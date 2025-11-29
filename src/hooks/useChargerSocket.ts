/**
 * Socket.IO Hook for Real-time Charger Updates
 * 
 * Uses Socket.IO (NOT OCPP WebSocket) to receive real-time updates
 * from the backend API service (port 5000).
 * 
 * Architecture: Browser → Socket.IO (port 5000) → Real-time events
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

interface ChargerStatusUpdate {
  chargerId: string;
  status: 'available' | 'occupied' | 'faulted' | 'offline' | 'maintenance';
  connectors?: Array<{
    connectorId: number;
    status: string;
    currentPower?: number;
  }>;
  timestamp: string;
}

interface ChargingSessionUpdate {
  sessionId: string;
  chargerId: string;
  status: 'started' | 'ongoing' | 'completed' | 'failed';
  energy?: number;
  duration?: number;
  cost?: number;
}

interface NotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  chargerId?: string;
  timestamp: string;
}

export function useChargerSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chargerUpdates, setChargerUpdates] = useState<ChargerStatusUpdate[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    // Get authentication token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.warn('No auth token found. Socket.IO connection requires authentication.');
      return;
    }

    // Create Socket.IO connection (NOT OCPP WebSocket!)
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected to backend');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    // Listen for charger status updates
    socketInstance.on('charger:status', (data: ChargerStatusUpdate) => {
      console.log('📡 Charger status update:', data);
      setChargerUpdates(prev => [data, ...prev.slice(0, 99)]); // Keep last 100
    });

    // Listen for charger connected/disconnected events
    socketInstance.on('charger:connected', (data: { chargerId: string }) => {
      console.log('🔌 Charger connected:', data.chargerId);
      setNotifications(prev => [{
        id: `${Date.now()}-connected`,
        type: 'success',
        message: `Charger ${data.chargerId} connected`,
        chargerId: data.chargerId,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)]);
    });

    socketInstance.on('charger:disconnected', (data: { chargerId: string }) => {
      console.log('🔌 Charger disconnected:', data.chargerId);
      setNotifications(prev => [{
        id: `${Date.now()}-disconnected`,
        type: 'warning',
        message: `Charger ${data.chargerId} disconnected`,
        chargerId: data.chargerId,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)]);
    });

    // Listen for session updates
    socketInstance.on('session:started', (data: ChargingSessionUpdate) => {
      console.log('⚡ Charging session started:', data);
      setNotifications(prev => [{
        id: `${Date.now()}-session`,
        type: 'info',
        message: `Charging session started on ${data.chargerId}`,
        chargerId: data.chargerId,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)]);
    });

    socketInstance.on('session:update', (data: ChargingSessionUpdate) => {
      console.log('⚡ Charging session update:', data);
    });

    socketInstance.on('session:completed', (data: ChargingSessionUpdate) => {
      console.log('✅ Charging session completed:', data);
      setNotifications(prev => [{
        id: `${Date.now()}-completed`,
        type: 'success',
        message: `Charging completed on ${data.chargerId} - ${data.energy}kWh delivered`,
        chargerId: data.chargerId,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)]);
    });

    // Listen for general notifications
    socketInstance.on('notification:new', (data: NotificationEvent) => {
      console.log('🔔 New notification:', data);
      setNotifications(prev => [data, ...prev.slice(0, 49)]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Method to emit events (if needed)
  const emit = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }, [socket]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear charger updates
  const clearChargerUpdates = useCallback(() => {
    setChargerUpdates([]);
  }, []);

  return {
    socket,
    isConnected,
    chargerUpdates,
    notifications,
    emit,
    clearNotifications,
    clearChargerUpdates
  };
}
