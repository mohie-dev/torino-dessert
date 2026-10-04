"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { getAccessToken } from "@/lib/auth-token";
import { useUIStore } from "@/stores/ui-store";

interface NewOrderEvent {
  orderNumber: string;
  total: number | string;
}

function isNewOrderEvent(value: unknown): value is NewOrderEvent {
  if (typeof value !== "object" || value === null) return false;
  if (!("orderNumber" in value) || typeof value.orderNumber !== "string") {
    return false;
  }
  return (
    value.orderNumber.trim().length > 0 &&
    "total" in value &&
    (typeof value.total === "number" || typeof value.total === "string")
  );
}

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://torino-dessert.onrender.com/api/v1";

function playOrderChime(context: AudioContext): boolean {
  if (context.state !== "running") return false;

  const startAt = context.currentTime;
  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = startAt + index * 0.18;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.35, noteStart + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.42);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.43);
  });

  return true;
}

export function useOrdersSocket(userId: string | undefined, enabled: boolean) {
  const queryClient = useQueryClient();
  const notify = useUIStore((state) => state.notify);

  useEffect(() => {
    if (!userId || !enabled) return;

    const token = getAccessToken();
    if (!token) {
      console.warn("Order live updates are disabled because no auth token is available.");
      return;
    }

    let socketOrigin: string;
    try {
      socketOrigin = new URL(apiUrl).origin;
    } catch (error) {
      console.error("Invalid API URL for order notifications.", error);
      return;
    }

    const audioContextRef: { current: AudioContext | null } = { current: null };
    let pendingChime = false;

    function unlockAudio() {
      if (audioContextRef.current?.state === "running") return;

      try {
        audioContextRef.current ??= new window.AudioContext();
      } catch (error) {
        console.warn("New-order sounds are not supported in this browser.", error);
        return;
      }

      const context = audioContextRef.current;
      void context.resume()
        .then(() => {
          if (context.state !== "running") return;
          window.removeEventListener("pointerdown", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);

          if (pendingChime) {
            pendingChime = false;
            playOrderChime(context);
          }
        })
        .catch((error: unknown) => {
          console.warn("Could not enable new-order sounds.", error);
        });
    }

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    const socket = io(`${socketOrigin}/admin-orders`, {
      auth: { token },
      reconnection: true,
    });
    socket.on("connect_error", (error) => {
      console.error("Could not connect to live order updates.", error.message);
    });
    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        console.warn("Live order updates disconnected.", reason);
      }
    });

    function handleNewOrder(payload: unknown) {
      if (!isNewOrderEvent(payload)) {
        console.warn("Received an invalid new-order socket event.", payload);
        return;
      }

      if (
        !audioContextRef.current ||
        !playOrderChime(audioContextRef.current)
      ) {
        pendingChime = true;
      }
      notify("info", `New order ${payload.orderNumber} received.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "pending-order-count"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard-stats"],
      });
    }

    function handleOrderStatusUpdated() {
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "pending-order-count"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard-stats"],
      });
    }

    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusUpdated", handleOrderStatusUpdated);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
      socket.removeAllListeners();
      socket.disconnect();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        void audioContextRef.current.close();
      }
    };
  }, [
    enabled,
    notify,
    queryClient,
    userId,
  ]);
}
