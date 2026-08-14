"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Notification } from "@/types/notification";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, ...args: any[]) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => {},
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      );

      const newAccessToken =
        response.data?.accessToken ?? response.data?.data?.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh.");
      }

      useAuthStore.getState().setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Refresh token failed";

      // console.error("[Socket] Refresh failed:", message);

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const socketRef = useRef<Socket | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;

      setSocket(null);
      setIsConnected(false);

      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${accessToken}`,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,

      timeout: 10000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    const handleConnect = () => {
      // console.log("[Socket] ✅ Connected:", socketInstance.id);

      setIsConnected(true);

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    };

    const handleDisconnect = (reason: string) => {
      // console.warn("[Socket] 🔌 Disconnected:", reason);

      setIsConnected(false);
    };

    const handleConnectError = async (
      error: Error & {
        data?: any;
      },
    ) => {
      // console.warn("[Socket] ❌ Connect error:", {
      //   message: error.message,
      //   data: error.data,
      // });

      setIsConnected(false);

      const message = (
        error?.data?.message ||
        error?.message ||
        ""
      ).toLowerCase();

      const isAuthError =
        message.includes("unauthorized") ||
        message.includes("jwt") ||
        message.includes("token") ||
        message.includes("expired") ||
        message.includes("invalid");

      if (!isAuthError) {
        return;
      }

      if (refreshingRef.current) {
        return;
      }

      refreshingRef.current = true;

      try {
        // console.log("[Socket] 🔄 Refreshing access token...");

        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          // console.warn("[Socket] ❌ Refresh failed. Disconnecting.");

          socketInstance.disconnect();
          return;
        }

        // console.log("[Socket] 🔑 Token refreshed. Reconnecting...");

        socketInstance.auth = {
          token: `Bearer ${newAccessToken}`,
        };

        socketInstance.connect();
      } finally {
        refreshingRef.current = false;
      }
    };

    const handleNotification = (notification: Notification) => {
      // console.log("[Socket] 🔔 Notification:", notification);

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);
    socketInstance.on("notification", handleNotification);

    /*
     * Khi user quay lại tab
     */
    const reconnectIfNeeded = () => {
      const currentSocket = socketRef.current;

      if (!currentSocket) {
        return;
      }

      if (!currentSocket.connected) {
        // console.log("[Socket] 🔄 Reconnecting after tab/focus/online...");

        currentSocket.connect();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconnectIfNeeded();
      }
    };

    const handleOnline = () => {
      // console.log("[Socket] 🌐 Browser online");

      reconnectIfNeeded();
    };

    const handleFocus = () => {
      reconnectIfNeeded();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("online", handleOnline);

    window.addEventListener("focus", handleFocus);

    socketInstance.connect();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("online", handleOnline);

      window.removeEventListener("focus", handleFocus);

      socketInstance.off("connect", handleConnect);

      socketInstance.off("disconnect", handleDisconnect);

      socketInstance.off("connect_error", handleConnectError);

      socketInstance.off("notification", handleNotification);

      socketInstance.disconnect();

      if (socketRef.current === socketInstance) {
        socketRef.current = null;
      }

      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken, queryClient]);

  const emit = useCallback((event: string, ...args: any[]) => {
    const socketInstance = socketRef.current;

    if (!socketInstance || !socketInstance.connected) {
      // console.warn(`[Socket] Cannot emit "${event}". Socket is not connected.`);
      return;
    }

    socketInstance.emit(event, ...args);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        emit,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
