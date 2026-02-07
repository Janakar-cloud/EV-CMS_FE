'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  subscribe: (event: string, handler: (...args: any[]) => void) => () => void;
  emit: (event: string, data?: any, callback?: (...args: any[]) => void) => void;
  subscribeToBooking: (bookingId: string) => void;
  unsubscribeFromBooking: (bookingId: string) => void;
  subscribeToStation: (stationId: string) => void;
  unsubscribeFromStation: (stationId: string) => void;
  subscribeToCharger: (chargerId: string) => void;
  unsubscribeFromCharger: (chargerId: string) => void;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      console.warn('[Socket] No auth token found, skipping connection');
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Connection established
    newSocket.on('connect', () => {
      console.log('[Socket] Connected with ID:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    // Connection error
    newSocket.on('connect_error', err => {
      console.error('[Socket] Connection error:', err.message);
      setError(err.message);
    });

    // Disconnection
    newSocket.on('disconnect', reason => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Subscribe to event
  const subscribe = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (!socket) return () => {};

      socket.on(event, handler);

      return () => {
        socket.off(event, handler);
      };
    },
    [socket]
  );

  // Emit event
  const emit = useCallback(
    (event: string, data?: any, callback?: (...args: any[]) => void) => {
      if (!socket?.connected) {
        console.warn('[Socket] Socket not connected');
        return;
      }

      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket.emit(event, data);
      }
    },
    [socket]
  );

  // Subscribe to charger updates
  const subscribeToCharger = useCallback(
    (chargerId: string) => {
      if (!socket?.connected) return;
      // Back-compat
      socket.emit('subscribeCharger', { chargerId });
    },
    [socket]
  );

  // Unsubscribe from charger updates
  const unsubscribeFromCharger = useCallback(
    (chargerId: string) => {
      if (!socket?.connected) return;
      // Back-compat
      socket.emit('unsubscribeCharger', { chargerId });
    },
    [socket]
  );

  // Contract: subscribe to booking updates
  const subscribeToBooking = useCallback(
    (bookingId: string) => {
      if (!socket?.connected) return;
      socket.emit('subscribe:booking', { bookingId, id: bookingId });
    },
    [socket]
  );

  const unsubscribeFromBooking = useCallback(
    (bookingId: string) => {
      if (!socket?.connected) return;
      socket.emit('unsubscribe:booking', { bookingId, id: bookingId });
    },
    [socket]
  );

  // Contract: subscribe to station updates
  const subscribeToStation = useCallback(
    (stationId: string) => {
      if (!socket?.connected) return;
      socket.emit('subscribe:station', { stationId, id: stationId });
    },
    [socket]
  );

  const unsubscribeFromStation = useCallback(
    (stationId: string) => {
      if (!socket?.connected) return;
      socket.emit('unsubscribe:station', { stationId, id: stationId });
    },
    [socket]
  );

  // Subscribe to session updates
  const subscribeToSession = useCallback(
    (sessionId: string) => {
      if (!socket?.connected) return;
      // Contract + back-compat
      socket.emit('subscribe:session', { sessionId, id: sessionId });
      socket.emit('subscribeSession', { sessionId });
    },
    [socket]
  );

  // Unsubscribe from session updates
  const unsubscribeFromSession = useCallback(
    (sessionId: string) => {
      if (!socket?.connected) return;
      // Contract + back-compat
      socket.emit('unsubscribe:session', { sessionId, id: sessionId });
      socket.emit('unsubscribeSession', { sessionId });
    },
    [socket]
  );

  const value: SocketContextType = {
    socket,
    isConnected,
    error,
    subscribe,
    emit,
    subscribeToBooking,
    unsubscribeFromBooking,
    subscribeToStation,
    unsubscribeFromStation,
    subscribeToCharger,
    unsubscribeFromCharger,
    subscribeToSession,
    unsubscribeFromSession,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
