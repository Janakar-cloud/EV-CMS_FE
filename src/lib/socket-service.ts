import io, { Socket } from 'socket.io-client';

// LEGACY SOCKET SERVICE
// ---------------------
// This module predates the centralized SocketProvider in src/contexts/socket.tsx.
// New code MUST use SocketProvider + useSocket (and hooks built on top of it)
// instead of creating independent Socket.IO connections via this service.

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || 'http://localhost:5000';

export interface ChargerStatusData {
  chargerId: string;
  status: 'available' | 'in-use' | 'faulted' | 'unavailable';
  lastUpdate: string;
  powerAvailable?: number;
  connectors?: Array<{
    connectorId: number;
    status: string;
    currentSession?: string | null;
  }>;
}

export interface TransactionUpdateData {
  sessionId: string;
  chargerId: string;
  status: 'in-progress' | 'completed' | 'failed';
  cost: number;
  energyDelivered?: number;
  duration?: number;
}

export interface MeterValuesData {
  chargerId: string;
  connectorId?: number;
  voltage: number;
  current: number;
  power: number;
  energy?: number;
  temperature?: number;
  timestamp: string;
}

export interface ChargeFaultData {
  chargerId: string;
  connectorId?: number;
  error: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: string;
  errorCode?: string;
}

export interface CommandResultData {
  commandId: string;
  success: boolean;
  result: Record<string, any>;
  error?: string;
  timestamp: string;
}

// Contract events
export interface BookingUpdateData {
  bookingId: string;
  status?: string;
  [key: string]: any;
}

export interface StationUpdateData {
  stationId: string;
  [key: string]: any;
}

export interface SessionUpdateData {
  sessionId: string;
  status?: string;
  [key: string]: any;
}

export interface NotificationData {
  id?: string;
  type?: string;
  message?: string;
  [key: string]: any;
}

export type SocketEventHandler<T> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketEventHandler<any>>> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize Socket.IO connection
   */
  connect(socketUrl: string = SOCKET_URL): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

        this.socket = io(socketUrl, {
          auth: {
            token: token || '',
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ['websocket', 'polling'],
        });

        // Connection established
        this.socket.on('connect', () => {
          console.log('[Socket.IO] Connected:', this.socket?.id);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.setupEventListeners();
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', error => {
          console.error('[Socket.IO] Connection error:', error);
          this.isConnecting = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        // Disconnection
        this.socket.on('disconnect', reason => {
          console.log('[Socket.IO] Disconnected:', reason);
          this.isConnecting = false;
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', () => {
          this.reconnectAttempts++;
          console.log(`[Socket.IO] Reconnect attempt ${this.reconnectAttempts}`);
        });
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Setup all Socket.IO event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Contract-aligned update streams
    this.socket.on('booking:update', (data: BookingUpdateData) => {
      this.emitToListeners('booking:update', data);
    });

    this.socket.on('station:update', (data: StationUpdateData) => {
      this.emitToListeners('station:update', data);
    });

    this.socket.on('session:update', (data: SessionUpdateData) => {
      this.emitToListeners('session:update', data);
    });

    this.socket.on('notification', (data: NotificationData) => {
      this.emitToListeners('notification', data);
    });

    // Charger Status Updates
    this.socket.on('chargerStatus', (data: ChargerStatusData) => {
      this.emitToListeners('chargerStatus', data);
    });

    // Transaction Updates
    this.socket.on('transactionUpdate', (data: TransactionUpdateData) => {
      this.emitToListeners('transactionUpdate', data);
    });

    // Meter Values (Real-time Power Data)
    this.socket.on('meterValues', (data: MeterValuesData) => {
      this.emitToListeners('meterValues', data);
    });

    // Charge Fault Alerts
    this.socket.on('chargeFault', (data: ChargeFaultData) => {
      this.emitToListeners('chargeFault', data);
    });

    // Command Results
    this.socket.on('commandResult', (data: CommandResultData) => {
      this.emitToListeners('commandResult', data);
    });

    // System Messages
    this.socket.on('systemMessage', (data: { message: string; type: string }) => {
      this.emitToListeners('systemMessage', data);
    });
  }

  onBookingUpdate(handler: SocketEventHandler<BookingUpdateData>): () => void {
    return this.on('booking:update', handler);
  }

  onStationUpdate(handler: SocketEventHandler<StationUpdateData>): () => void {
    return this.on('station:update', handler);
  }

  onSessionUpdate(handler: SocketEventHandler<SessionUpdateData>): () => void {
    return this.on('session:update', handler);
  }

  onNotification(handler: SocketEventHandler<NotificationData>): () => void {
    return this.on('notification', handler);
  }

  /**
   * Subscribe to charger status updates
   */
  onChargerStatus(handler: SocketEventHandler<ChargerStatusData>): () => void {
    return this.on('chargerStatus', handler);
  }

  /**
   * Subscribe to transaction updates
   */
  onTransactionUpdate(handler: SocketEventHandler<TransactionUpdateData>): () => void {
    return this.on('transactionUpdate', handler);
  }

  /**
   * Subscribe to meter values (real-time power data)
   */
  onMeterValues(handler: SocketEventHandler<MeterValuesData>): () => void {
    return this.on('meterValues', handler);
  }

  /**
   * Subscribe to charge fault alerts
   */
  onChargeFault(handler: SocketEventHandler<ChargeFaultData>): () => void {
    return this.on('chargeFault', handler);
  }

  /**
   * Subscribe to command results
   */
  onCommandResult(handler: SocketEventHandler<CommandResultData>): () => void {
    return this.on('commandResult', handler);
  }

  /**
   * Subscribe to system messages
   */
  onSystemMessage(handler: SocketEventHandler<{ message: string; type: string }>): () => void {
    return this.on('systemMessage', handler);
  }

  /**
   * Generic event subscription
   */
  on<T>(event: string, handler: SocketEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Emit event to listeners
   */
  private emitToListeners<T>(event: string, data: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[Socket.IO] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Send event to server
   */
  emit<T = any>(event: string, data: T, callback?: (response: any) => void): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  /**
   * Subscribe to charger-specific updates
   */
  subscribeToCharger(chargerId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Back-compat
    this.socket.emit('subscribeCharger', { chargerId });
  }

  /**
   * Unsubscribe from charger updates
   */
  unsubscribeFromCharger(chargerId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Back-compat
    this.socket.emit('unsubscribeCharger', { chargerId });
  }

  /**
   * Contract: subscribe to booking updates
   */
  subscribeToBooking(bookingId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: subscribe:booking expects bookingId as string
    this.socket.emit('subscribe:booking', bookingId);
  }

  unsubscribeFromBooking(bookingId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: unsubscribe:booking expects bookingId as string
    this.socket.emit('unsubscribe:booking', bookingId);
  }

  /**
   * Contract: subscribe to station updates
   */
  subscribeToStation(stationId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: subscribe:station expects stationId as string
    this.socket.emit('subscribe:station', stationId);
  }

  unsubscribeFromStation(stationId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: unsubscribe:station expects stationId as string
    this.socket.emit('unsubscribe:station', stationId);
  }

  /**
   * Subscribe to session-specific updates
   */
  subscribeToSession(sessionId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: subscribe:session expects sessionId as string
    this.socket.emit('subscribe:session', sessionId);
  }

  /**
   * Unsubscribe from session updates
   */
  unsubscribeFromSession(sessionId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: unsubscribe:session expects sessionId as string
    this.socket.emit('unsubscribe:session', sessionId);
  }

  /**
   * Update user location
   */
  updateLocation(latitude: number, longitude: number): void {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Socket not connected');
      return;
    }

    // Contract: location:update expects { latitude, longitude }
    this.socket.emit('location:update', { latitude, longitude });
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket ID
   */
  getId(): string | null {
    return this.socket?.id ?? null;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Reconnect socket
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const socketService = new SocketService();
