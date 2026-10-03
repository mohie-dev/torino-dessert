"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiRequestError } from "@/lib/api";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth-token";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string | null;
  role: { id?: string; name?: string; permissions?: string[] } | string | null;
  permissions: string[];
}

type AuthMeUser = Omit<AuthUser, "permissions"> & {
  permissions?: string[];
};

type AuthMeResponse =
  | (AuthMeUser & { permissions?: string[] })
  | { user: AuthMeUser; permissions?: string[] };

function normalizeAuthUser(response: AuthMeResponse): AuthUser {
  const user = "user" in response ? response.user : response;
  return {
    ...user,
    permissions:
      response.permissions ??
      user.permissions ??
      (typeof user.role === "object" ? user.role?.permissions : undefined) ??
      [],
  };
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    let mounted = true;
    const onExpired = () => {
      if (mounted) {
        setUser(null);
        setStatus("unauthenticated");
      }
    };
    window.addEventListener("torino:auth-expired", onExpired);

    async function restore() {
      if (!getAccessToken()) {
        if (mounted) setStatus("unauthenticated");
        return;
      }
      try {
        const response = await api.get<AuthMeResponse>("/auth/me");
        if (mounted) {
          setUser(normalizeAuthUser(response.data));
          setStatus("authenticated");
        }
      } catch {
        clearAccessToken();
        if (mounted) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    }

    void restore();
    return () => {
      mounted = false;
      window.removeEventListener("torino:auth-expired", onExpired);
    };
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setStatus("loading");
      try {
        const loginResponse = await api.post<{ accessToken: string }>(
          "/auth/login",
          credentials,
        );
        setAccessToken(loginResponse.data.accessToken);
        const meResponse = await api.get<AuthMeResponse>("/auth/me");
        setUser(normalizeAuthUser(meResponse.data));
        setStatus("authenticated");
      } catch (error) {
        clearAccessToken();
        setUser(null);
        setStatus("unauthenticated");
        if (error instanceof ApiRequestError) throw error;
        throw new Error("Unable to sign in. Please try again.");
      }
    },
    [],
  );

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  const value = useMemo(
    () => ({ user, status, login, logout, hasPermission }),
    [user, status, login, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
