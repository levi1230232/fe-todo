import { useAuthStore } from "@/store/auth.store";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
    if (socketRef.current && accessToken) {
      socketRef.current.auth = { token: `Bearer ${accessToken}` };
    }
  }, [accessToken]);

  useEffect(() => {
    if (!tokenRef.current) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    if (socketRef.current) return;

    const socketInstance = io(SOCKET_URL, {
      auth: (cb) => {
        cb({ token: `Bearer ${tokenRef.current}` });
      },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      socketInstance.on("connect", () => {
        console.log("[Socket] CONNECT", {
          id: socketInstance.id,
          connected: socketInstance.connected,
        });

        setIsConnected(true);
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] DISCONNECT", {
        id: socketInstance.id,
        reason,
      });

      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err: any) => {
      console.log("[Socket] CONNECT ERROR", {
        message: err.message,
        description: err.description,
        type: err.type,
        context: err.context,
      });
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, []);
  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
    } else {
      console.warn(
        `[useSocket] Cannot emit "${event}". Socket is not connected.`,
      );
    }
  }, []);

  return {
    socket,
    isConnected,
    emit,
  };
};
