/**
 * RFID System Type Definitions
 * Comprehensive types for NFC-based EV charger access
 */

// RFID Card Entity
export interface RFIDCard {
  id: string;
  uid: string; // Unique identifier from NFC card
  userId: string;
  vehicleId?: string;
  cardName?: string; // User-friendly name (e.g., "Main Card", "Backup Card")
  cardType: 'user' | 'vehicle' | 'both';
  status: 'active' | 'blocked' | 'expired' | 'suspended';
  issueDate: string;
  expiryDate?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    readerModel?: string;
    location?: string;
    notes?: string;
  };
}

// RFID Transaction Log
export interface RFIDTransaction {
  id: string;
  rfidCardId: string;
  userId: string;
  chargerId: string;
  stationId: string;
  sessionId?: string;
  transactionType: 'tap' | 'validation' | 'access_denied' | 'session_start' | 'session_stop';
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
  readerInfo?: {
    readerId: string;
    readerLocation?: string;
    signal_strength?: number;
  };
  metadata?: Record<string, any>;
}

// RFID Reader Configuration
export interface RFIDReader {
  id: string;
  chargerId: string;
  stationId: string;
  readerModel: string; // e.g., "ACR122U", "Feig Electronic", "Elatec"
  readerSerialNumber: string;
  connectionType: 'serial' | 'usb' | 'tcp_ip' | 'mqtt';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  status: 'online' | 'offline' | 'error';
  lastHeartbeat?: string;
  firmwareVersion?: string;
  supportedProtocols: string[]; // e.g., ["ISO14443A", "MIFARE", "DESFire"]
  offlineModeEnabled: boolean;
  whitelistCacheSize?: number;
  createdAt: string;
  updatedAt: string;
}

// RFID Whitelist (for offline operation)
export interface RFIDWhitelist {
  id: string;
  readerId: string;
  rfidCardId: string;
  uid: string;
  userId: string;
  status: 'active' | 'revoked';
  lastSyncedAt: string;
  syncedVersion: number;
}

// RFID Validation Request (from charger reader)
export interface RFIDValidationRequest {
  uid: string;
  readerId: string;
  chargerId: string;
  stationId: string;
  timestamp: string;
  signalStrength?: number;
}

// RFID Validation Response
export interface RFIDValidationResponse {
  valid: boolean;
  userId?: string;
  vehicleId?: string;
  userName?: string;
  vehicleName?: string;
  canCharge: boolean;
  reason?: string; // e.g., "card_blocked", "user_suspended", "no_active_booking"
  sessionId?: string;
  chargingDetails?: {
    maxPower: number;
    estimatedDuration: number;
    costPerKwh: number;
  };
}

// RFID Registration Request
export interface RFIDRegistrationRequest {
  uid: string;
  userId: string;
  vehicleId?: string;
  cardName?: string;
  cardType: 'user' | 'vehicle' | 'both';
  expiryDate?: string;
}

// RFID Usage Analytics
export interface RFIDUsageAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalTaps: number;
  successfulSessions: number;
  failedValidations: number;
  successRate: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    tapCount: number;
    sessionCount: number;
  }>;
  topChargers: Array<{
    chargerId: string;
    chargerName: string;
    stationId: string;
    tapCount: number;
  }>;
  byStatus: {
    success: number;
    access_denied: number;
    error: number;
  };
  energyCharged: number; // kWh
  revenue: number; // Currency amount
}

// RFID System Configuration
export interface RFIDSystemConfig {
  enabled: boolean;
  primaryAuthMethod: 'rfid' | 'mobile' | 'both';
  offlineModeEnabled: boolean;
  whitelistSyncInterval: number; // seconds
  validationTimeout: number; // seconds
  maxRetries: number;
  autoCreateSession: boolean; // Auto-start charging on valid tap
  requireActiveBooking: boolean; // Only allow if booking exists
  blockExpiredCards: boolean;
  auditTrailEnabled: boolean;
  complianceMode: 'none' | 'gdpr' | 'strict'; // Data retention policies
}

// RFID Card Registration Form Data
export interface RFIDRegistrationForm {
  uid: string;
  userId: string;
  vehicleId?: string;
  cardName: string;
  cardType: 'user' | 'vehicle' | 'both';
  expiryDate?: string;
  notes?: string;
}

// RFID Card Query Filters
export interface RFIDCardFilters {
  userId?: string;
  vehicleId?: string;
  status?: 'active' | 'blocked' | 'expired' | 'suspended';
  cardType?: 'user' | 'vehicle' | 'both';
  searchTerm?: string; // Search by name or UID
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// API Response Types
export interface RFIDResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface RFIDListResponse {
  items: RFIDCard[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
