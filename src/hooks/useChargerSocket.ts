/**
 * Socket.IO Hook for Real-time Charger Updates
 *
 * Uses Socket.IO (NOT OCPP WebSocket) to receive real-time updates
 * from the backend API service (port 5000).
 *
 * Architecture: Browser → Socket.IO (port 5000) → Real-time events
 */

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/contexts/socket';

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

function toChargerStatus(value: unknown): ChargerStatusUpdate['status'] {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'available') return 'available';
  if (normalized === 'occupied') return 'occupied';
  if (normalized === 'faulted') return 'faulted';
  if (normalized === 'offline') return 'offline';
  if (normalized === 'maintenance') return 'maintenance';
  return 'available';
}

function toNotificationType(value: unknown): NotificationEvent['type'] {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'info') return 'info';
  if (normalized === 'warning') return 'warning';
  if (normalized === 'error') return 'error';
  if (normalized === 'success') return 'success';
  return 'info';
}

export function useChargerSocket() {
  const { isConnected, subscribe, emit: contextEmit } = useSocket();
  const [chargerUpdates, setChargerUpdates] = useState<ChargerStatusUpdate[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Listen for charger status updates
    unsubscribers.push(
      subscribe('charger:status', (data: ChargerStatusUpdate) => {
        console.log('Charger status update:', data);
        setChargerUpdates(prev => [data, ...prev.slice(0, 99)]); // Keep last 100
      })
    );

    // Contract: station updates (use same local list for UI)
    unsubscribers.push(
      subscribe('station:update', (data: any) => {
        console.log('Station update:', data);
        const mapped: ChargerStatusUpdate = {
          chargerId: String(data?.chargerId ?? data?.evseId ?? data?.stationId ?? ''),
          status: toChargerStatus(data?.status),
          connectors: data?.connectors,
          timestamp: String(data?.timestamp ?? new Date().toISOString()),
        };
        setChargerUpdates(prev => [mapped, ...prev.slice(0, 99)]);
      })
    );

    // Listen for charger connected/disconnected events
    unsubscribers.push(
      subscribe('charger:connected', (data: { chargerId: string }) => {
        console.log('Charger connected:', data.chargerId);
        setNotifications(prev => [
          {
            id: `${Date.now()}-connected`,
            type: 'success',
            message: `Charger ${data.chargerId} connected`,
            chargerId: data.chargerId,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);
      })
    );

    unsubscribers.push(
      subscribe('charger:disconnected', (data: { chargerId: string }) => {
        console.log('Charger disconnected:', data.chargerId);
        setNotifications(prev => [
          {
            id: `${Date.now()}-disconnected`,
            type: 'warning',
            message: `Charger ${data.chargerId} disconnected`,
            chargerId: data.chargerId,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);
      })
    );

    // Listen for session updates
    unsubscribers.push(
      subscribe('session:started', (data: ChargingSessionUpdate) => {
        console.log('Charging session started:', data);
        setNotifications(prev => [
          {
            id: `${Date.now()}-session`,
            type: 'info',
            message: `Charging session started on ${data.chargerId}`,
            chargerId: data.chargerId,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);
      })
    );

    unsubscribers.push(
      subscribe('session:update', (data: unknown) => {
        console.log('Session update:', data);
      })
    );

    unsubscribers.push(
      subscribe('session:completed', (data: ChargingSessionUpdate) => {
        console.log('Charging session completed:', data);
        setNotifications(prev => [
          {
            id: `${Date.now()}-completed`,
            type: 'success',
            message: `Charging completed on ${data.chargerId} - ${data.energy}kWh delivered`,
            chargerId: data.chargerId,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);
      })
    );

    // Listen for general notifications
    unsubscribers.push(
      subscribe('notification:new', (data: NotificationEvent) => {
        console.log('New notification:', data);
        setNotifications(prev => [data, ...prev.slice(0, 49)]);
      })
    );

    // Contract: notification
    unsubscribers.push(
      subscribe('notification', (data: any) => {
        console.log('Notification:', data);
        const mapped: NotificationEvent = {
          id: String(data?.id ?? `${Date.now()}-notification`),
          type: toNotificationType(data?.type),
          message: String(data?.message ?? ''),
          chargerId: data?.chargerId,
          timestamp: String(data?.timestamp ?? new Date().toISOString()),
        };
        setNotifications(prev => [mapped, ...prev.slice(0, 49)]);
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe]);

  // Method to emit events (if needed)
  const emit = useCallback(
    (event: string, data: any) => {
      contextEmit(event, data);
    },
    [contextEmit]
  );

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear charger updates
  const clearChargerUpdates = useCallback(() => {
    setChargerUpdates([]);
  }, []);

  return {
    isConnected,
    chargerUpdates,
    notifications,
    emit,
    clearNotifications,
    clearChargerUpdates,
  };
}
