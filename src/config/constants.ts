/**
 * Application Constants
 * Centralized configuration for the EV CMS Brand Admin Dashboard
 */

// API Base URLs
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  OCPP_URL: process.env.NEXT_PUBLIC_OCPP_API_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    SEND_OTP: '/auth/send-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHECK_AUTH: '/auth/check',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    BLOCK: (id: string) => `/users/${id}/block`,
    UNBLOCK: (id: string) => `/users/${id}/unblock`,
    KYC: (id: string) => `/users/${id}/kyc`,
    KYC_VERIFY: (id: string) => `/users/${id}/kyc/verify`,
  },
  
  // Chargers
  CHARGERS: {
    BASE: '/chargers',
    BY_ID: (id: string) => `/chargers/${id}`,
    CONNECTORS: (id: string) => `/chargers/${id}/connectors`,
    STATUS: (id: string) => `/chargers/${id}/status`,
    START_CHARGING: (id: string) => `/chargers/${id}/start`,
    STOP_CHARGING: (id: string) => `/chargers/${id}/stop`,
    MONITORING: '/chargers/monitoring',
  },
  
  // Locations
  LOCATIONS: {
    BASE: '/locations',
    BY_ID: (id: string) => `/locations/${id}`,
    NEARBY: '/locations/nearby',
    SEARCH: '/locations/search',
  },
  
  // Vehicles
  VEHICLES: {
    BASE: '/vehicles',
    BY_ID: (id: string) => `/vehicles/${id}`,
    BY_USER: (userId: string) => `/vehicles/user/${userId}`,
  },
  
  // Pricing
  PRICING: {
    BASE: '/pricing',
    RULES: '/pricing/rules',
    BY_ID: (id: string) => `/pricing/rules/${id}`,
    CALCULATE: '/pricing/calculate',
  },
  
  // Sessions
  SESSIONS: {
    BASE: '/sessions',
    BY_ID: (id: string) => `/sessions/${id}`,
    ACTIVE: '/sessions/active',
    HISTORY: '/sessions/history',
  },
  
  // Analytics - NOTE: Uses /api/analytics (NOT /api/v1/analytics)
  ANALYTICS: {
    // These are relative to /api/analytics, not /api/v1
    BASE: '/api/analytics',
    DASHBOARD: '/api/analytics/dashboard',
    REVENUE: '/api/analytics/revenue',
    CHARGER_STATS: '/api/analytics/charger-stats',
    SESSION_SUMMARY: '/api/analytics/session-summary',
    USER_ACTIVITY: '/api/analytics/user-activity',
    PEAK_HOURS: '/api/analytics/peak-hours',
    COMPLIANCE_REPORT: '/api/analytics/compliance-report', // admin only
    UTILIZATION: '/api/analytics/utilization',
    USERS: '/api/analytics/users',
  },
  
  // Franchises
  FRANCHISES: {
    BASE: '/franchises',
    BY_ID: (id: string) => `/franchises/${id}`,
    ONBOARDING: '/franchises/onboarding',
    PERFORMANCE: '/franchises/performance',
  },
  
  // Partners - NOTE: Uses /api/partners (NOT /api/v1/partners)
  PARTNERS: {
    // These are relative to /api/partners, not /api/v1
    BASE: '/api/partners',
    BY_ID: (id: string) => `/api/partners/${id}`,
    APPROVE: (id: string) => `/api/partners/${id}/approve`,
    REJECT: (id: string) => `/api/partners/${id}/reject`,
    REVOKE: (id: string) => `/api/partners/${id}/revoke`,
    REACTIVATE: (id: string) => `/api/partners/${id}/reactivate`,
    STATUS: (id: string) => `/api/partners/${id}/status`,
    ONBOARDING: '/api/partners/onboarding',
  },
  
  // Roaming
  ROAMING: {
    BASE: '/roaming',
    PARTNERS: '/roaming/partners',
    AGREEMENTS: '/roaming/agreements',
    SESSIONS: '/roaming/sessions',
    SETTLEMENT: '/roaming/settlement',
  },
  
  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    TICKET_BY_ID: (id: string) => `/support/tickets/${id}`,
    KNOWLEDGE_BASE: '/support/kb',
    CHAT: '/support/chat',
  },
  
  // Reports
  REPORTS: {
    BASE: '/reports',
    FINANCIAL: '/reports/financial',
    OPERATIONAL: '/reports/operational',
    COMPLIANCE: '/reports/compliance',
  },
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FRANCHISE_OWNER: 'franchise_owner',
  PARTNER: 'partner',
  OPERATOR: 'operator',
  CUSTOMER: 'customer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Charger Status
export const CHARGER_STATUS = {
  AVAILABLE: 'available',
  CHARGING: 'charging',
  RESERVED: 'reserved',
  OFFLINE: 'offline',
  FAULTED: 'faulted',
  UNAVAILABLE: 'unavailable',
  PREPARING: 'preparing',
  FINISHING: 'finishing',
} as const;

export type ChargerStatus = typeof CHARGER_STATUS[keyof typeof CHARGER_STATUS];

// Connector Types
export const CONNECTOR_TYPES = {
  TYPE_1: 'Type 1',
  TYPE_2: 'Type 2',
  CCS: 'CCS',
  CHADEMO: 'CHAdeMO',
  GB_T: 'GB/T',
} as const;

export type ConnectorType = typeof CONNECTOR_TYPES[keyof typeof CONNECTOR_TYPES];

// Session Status
export const SESSION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// KYC Status
export const KYC_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type KYCStatus = typeof KYC_STATUS[keyof typeof KYC_STATUS];

// Pricing Types
export const PRICING_TYPES = {
  FIXED: 'fixed',
  TIME_BASED: 'time_based',
  ENERGY_BASED: 'energy_based',
  DYNAMIC: 'dynamic',
} as const;

export type PricingType = typeof PRICING_TYPES[keyof typeof PRICING_TYPES];

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'hh:mm a',
  DATE_ONLY: 'yyyy-MM-dd',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_USER: 'authUser',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Cookie Keys
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
} as const;

// App Routes
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  
  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_REVENUE: '/analytics/revenue',
  ANALYTICS_USERS: '/analytics/users',
  ANALYTICS_UTILIZATION: '/analytics/utilization',
  
  // Chargers
  CHARGERS: '/chargers',
  CHARGERS_ADD: '/chargers/add',
  CHARGERS_MONITORING: '/chargers/monitoring',
  CHARGERS_CONTROL: '/chargers/control',
  CHARGERS_MAINTENANCE: '/chargers/maintenance',
  
  // Users
  USERS: '/users',
  USERS_ADD: '/users/add',
  USERS_KYC: '/users/kyc',
  USERS_BLOCKED: '/users/blocked',
  
  // Vehicles
  VEHICLES: '/vehicles',
  
  // Locations
  LOCATIONS: '/locations',
  
  // Pricing
  PRICING_DYNAMIC: '/pricing/dynamic',
  PRICING_FRANCHISE: '/pricing/franchise',
  PRICING_RULES: '/pricing/rules',
  
  // Franchises
  FRANCHISES: '/franchises',
  FRANCHISES_ONBOARDING: '/franchises/onboarding',
  FRANCHISES_PERFORMANCE: '/franchises/performance',
  FRANCHISES_STAFF: '/franchises/staff',
  
  // Partners
  PARTNERS_AFFILIATE: '/partners/affiliate',
  PARTNERS_LOCATION: '/partners/location',
  PARTNERS_ONBOARDING: '/partners/onboarding',
  PARTNERS_SMART: '/partners/smart',
  
  // Roaming
  ROAMING: '/roaming',
  ROAMING_PARTNERS: '/roaming/partners',
  ROAMING_AGREEMENTS: '/roaming/agreements',
  ROAMING_SESSIONS: '/roaming/sessions',
  ROAMING_SETTLEMENT: '/roaming/settlement',
  
  // Monitoring
  MONITORING: '/monitoring',
  
  // Reports
  REPORTS: '/reports',
  REPORTS_FINANCIAL: '/reports/financial',
  REPORTS_OPERATIONAL: '/reports/operational',
  REPORTS_COMPLIANCE: '/reports/compliance',
  
  // Support
  SUPPORT: '/support',
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_KB: '/support/kb',
  SUPPORT_CHAT: '/support/chat',
  SUPPORT_REPORTS: '/support/reports',
  
  // Settings
  SETTINGS: '/settings',
} as const;

// WebSocket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CHARGER_STATUS_UPDATE: 'charger_status_update',
  SESSION_UPDATE: 'session_update',
  GUN_MONITORING_UPDATE: 'gun_monitoring_update',
  NOTIFICATION: 'notification',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  CREATE_SUCCESS: 'Created successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  SAVE_SUCCESS: 'Saved successfully!',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 28.6139, lng: 77.209 }, // New Delhi
  DEFAULT_ZOOM: 12,
  MARKER_ICON_SIZE: 32,
} as const;
