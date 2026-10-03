import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { useUIStore } from "@/stores/ui-store";

interface ApiErrorBody {
  statusCode?: number;
  error?: string | { message?: string | string[] };
  message?: string | string[];
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const baseURL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://torino-dessert.onrender.com/api/v1"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body: unknown = response.data;
    if (
      typeof body === "object" &&
      body !== null &&
      "status" in body &&
      "data" in body
    ) {
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const messageValue = body?.message ?? body?.error;
    const fallbackMessage = error.message || "The request could not be completed.";
    let message = fallbackMessage;

    if (typeof messageValue === "string") {
      message = messageValue;
    } else if (Array.isArray(messageValue)) {
      message = messageValue.join(", ");
    } else if (messageValue && typeof messageValue === "object") {
      const nestedMessage = messageValue.message;
      if (typeof nestedMessage === "string") {
        message = nestedMessage;
      } else if (Array.isArray(nestedMessage)) {
        message = nestedMessage.join(", ");
      }
    }

    if (status === 401) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("torino:auth-expired"));
        if (
          window.location.pathname.startsWith("/admin") &&
          window.location.pathname !== "/admin/login"
        ) {
          window.location.assign("/admin/login");
        }
      }
    } else if (status === 403) {
      useUIStore
        .getState()
        .notify("error", "You do not have permission to do that.");
    }

    return Promise.reject(new ApiRequestError(message, status, body));
  },
);
