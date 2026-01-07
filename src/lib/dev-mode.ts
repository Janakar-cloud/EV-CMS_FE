// Dev Mode Configuration
// Provides mock data when backend is unavailable for UI development/testing

import { DashboardStats } from './dashboard-service';

// Check if running in development environment
const isDevelopment = (): boolean => {
  // Check multiple indicators for development mode
  if (typeof window !== 'undefined') {
    // Check if running on localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    if (isLocalhost) return true;
  }
  
  // Next.js exposes NODE_ENV via process.env at build time
  return process.env.NODE_ENV !== 'production';
};

// Check if dev mode is explicitly enabled
export const isDevMode = (): boolean => {
  if (typeof window === 'undefined') return isDevelopment();
  
  // Check localStorage setting
  const devModeOverride = localStorage.getItem('EVCMS_DEV_MODE');
  if (devModeOverride === 'true') return true;
  if (devModeOverride === 'false') return false;
  
  // Default: auto-detect based on environment
  return isDevelopment();
};

// Check if we should use fallback data when API fails
// This is more permissive than isDevMode - always fallback in development
export const shouldUseFallback = (): boolean => {
  // Always allow fallback in development mode unless explicitly disabled
  const fallbackDisabled = typeof window !== 'undefined' 
    ? localStorage.getItem('EVCMS_FALLBACK_DISABLED') === 'true'
    : false;
    
  if (fallbackDisabled) return false;
  
  // Always use fallback in development (not production)
  return isDevelopment();
};

// Toggle dev mode (shows banner)
export const setDevMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('EVCMS_DEV_MODE', String(enabled));
  window.location.reload();
};

// Toggle fallback (use mock data when API fails)
export const setFallbackEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('EVCMS_FALLBACK_DISABLED', String(!enabled));
};

// Mock Dashboard Data
export const getMockDashboardStats = (): DashboardStats => {
  const now = new Date();
  
  return {
    overview: {
      totalChargers: 245,
      activeSessions: 87,
      todaysRevenue: 124500,
      activeUsers: 12400,
      utilizationRate: 78.5,
      trends: {
        chargers: 12,
        sessions: 4.5,
        revenue: 8.2,
        users: 2.1,
      },
    },
    networkStatus: {
      online: 198,
      offline: 35,
      faulted: 8,
      maintenance: 4,
      unavailable: 0,
    },
    peakHours: [
      { hour: '06', sessionCount: 45 },
      { hour: '07', sessionCount: 62 },
      { hour: '08', sessionCount: 89 },
      { hour: '09', sessionCount: 95 },
      { hour: '10', sessionCount: 78 },
      { hour: '11', sessionCount: 65 },
      { hour: '12', sessionCount: 72 },
      { hour: '13', sessionCount: 68 },
      { hour: '14', sessionCount: 71 },
      { hour: '15', sessionCount: 82 },
      { hour: '16', sessionCount: 98 },
      { hour: '17', sessionCount: 125 },
      { hour: '18', sessionCount: 142 },
      { hour: '19', sessionCount: 138 },
      { hour: '20', sessionCount: 118 },
      { hour: '21', sessionCount: 95 },
      { hour: '22', sessionCount: 72 },
      { hour: '23', sessionCount: 48 },
    ],
    recentSessions: [
      {
        _id: 'sess-001',
        sessionId: 'SS-001',
        userId: 'user-123',
        chargerId: 'CHG-001',
        chargerName: 'Charger 1',
        connectorId: '1-1',
        stationId: 'STN-001',
        stationName: 'Highway Plaza',
        startTime: new Date(now.getTime() - 30 * 60000).toISOString(),
        status: 'charging',
        energyConsumed: 15.5,
        duration: 30,
        cost: 450,
        currency: 'INR',
        paymentStatus: 'pending',
        currentPower: 45,
        roaming: { isRoaming: false },
      },
      {
        _id: 'sess-002',
        sessionId: 'SS-002',
        userId: 'user-456',
        chargerId: 'CHG-002',
        chargerName: 'Charger 2',
        connectorId: '2-1',
        stationId: 'STN-001',
        stationName: 'Highway Plaza',
        startTime: new Date(now.getTime() - 60 * 60000).toISOString(),
        endTime: new Date(now.getTime() - 10 * 60000).toISOString(),
        status: 'completed',
        energyConsumed: 22.3,
        duration: 50,
        cost: 668,
        currency: 'INR',
        paymentStatus: 'paid',
        roaming: { isRoaming: false },
      },
      {
        _id: 'sess-003',
        sessionId: 'SS-003',
        userId: 'user-789',
        chargerId: 'CHG-001',
        chargerName: 'Charger 1',
        connectorId: '1-2',
        stationId: 'STN-002',
        stationName: 'Tech Park',
        startTime: new Date(now.getTime() - 120 * 60000).toISOString(),
        endTime: new Date(now.getTime() - 90 * 60000).toISOString(),
        status: 'completed',
        energyConsumed: 45.8,
        duration: 30,
        cost: 1374,
        currency: 'INR',
        paymentStatus: 'paid',
        roaming: { 
          isRoaming: true, 
          partnerBrand: 'ChargePoint',
          roamingFee: 25,
        },
      },
    ],
  };
};

// Mock System Alerts
export const getMockSystemAlerts = () => {
  const now = new Date();
  
  return {
    notifications: [
      {
        id: 'alert-001',
        userId: 'system',
        title: 'Charger Offline',
        message: 'Highway Plaza - DC02 has been offline for 15 minutes',
        type: 'system_alert',
        category: 'charger',
        read: false,
        metadata: { chargerId: 'CHG-003' },
        createdAt: new Date(now.getTime() - 15 * 60000),
        updatedAt: new Date(now.getTime() - 15 * 60000),
      },
      {
        id: 'alert-002',
        userId: 'system',
        title: 'High Temperature',
        message: 'Phoenix Mall - DC01 temperature above 50°C',
        type: 'system_alert',
        category: 'charger',
        read: false,
        metadata: { chargerId: 'CHG-001' },
        createdAt: new Date(now.getTime() - 10 * 60000),
        updatedAt: new Date(now.getTime() - 10 * 60000),
      },
      {
        id: 'alert-003',
        userId: 'system',
        title: 'Maintenance Scheduled',
        message: 'Tech Park - AC01 maintenance scheduled for tomorrow',
        type: 'system_alert',
        category: 'system',
        read: false,
        metadata: { chargerId: 'CHG-002' },
        createdAt: new Date(now.getTime() - 60 * 60000),
        updatedAt: new Date(now.getTime() - 60 * 60000),
      },
    ],
    total: 3,
    unread: 3,
    page: 1,
    pages: 1,
  };
};

// Dev mode banner component helper
export const DEV_MODE_BANNER_STYLES = {
  container: 'fixed bottom-4 right-4 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2',
  button: 'ml-2 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs',
};
