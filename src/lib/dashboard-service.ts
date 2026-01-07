// Dashboard Service - Real-time dashboard data from backend
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

// ========================================
// Types
// ========================================

export interface DashboardOverview {
  totalChargers: number;
  activeSessions: number;
  todaysRevenue: number;
  activeUsers: number;
  utilizationRate: number;
  trends?: {
    chargers?: number;
    sessions?: number;
    revenue?: number;
    users?: number;
  };
}

export interface NetworkStatus {
  online: number;
  offline: number;
  faulted: number;
  maintenance: number;
  unavailable: number;
}

export interface PeakHourData {
  hour: string;
  sessionCount: number;
}

export interface RecentSession {
  _id: string;
  sessionId: string;
  userId?: string;
  chargerId: string;
  chargerName?: string;
  connectorId: string;
  stationId?: string;
  stationName?: string;
  startTime: string;
  endTime?: string;
  status: 'charging' | 'completed' | 'stopped' | 'failed' | 'pending';
  energyConsumed: number;
  duration: number;
  cost: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  currentPower?: number;
  roaming?: {
    isRoaming: boolean;
    partnerBrand?: string;
    roamingFee?: number;
  };
}

export interface DashboardStats {
  overview: DashboardOverview;
  networkStatus: NetworkStatus;
  peakHours: PeakHourData[];
  recentSessions: RecentSession[];
}

export interface DashboardFilters {
  date?: string; // YYYY-MM-DD format
  recentSessionsLimit?: number;
}

// ========================================
// Dashboard Service Class
// ========================================

class DashboardService {
  private static readonly API_BASE = '/dashboard';

  /**
   * Get all dashboard stats in a single call
   * GET /api/v1/dashboard/stats?date=YYYY-MM-DD&recentSessionsLimit=10
   * Falls back to mock data in dev mode when backend is unavailable
   */
  async getStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      const params: Record<string, string> = {};
      if (filters?.date) params.date = filters.date;
      if (filters?.recentSessionsLimit) params.recentSessionsLimit = String(filters.recentSessionsLimit);

      const response = await apiClient.get(`${DashboardService.API_BASE}/stats`, { params });
      const data = unwrap<any>(response);

      // Normalize response structure
      return {
        overview: data.overview ?? {
          totalChargers: data.totalChargers ?? 0,
          activeSessions: data.activeSessions ?? 0,
          todaysRevenue: data.todaysRevenue ?? 0,
          activeUsers: data.activeUsers ?? 0,
          utilizationRate: data.utilizationRate ?? 0,
          trends: data.trends,
        },
        networkStatus: data.networkStatus ?? {
          online: 0,
          offline: 0,
          faulted: 0,
          maintenance: 0,
          unavailable: 0,
        },
        peakHours: data.peakHours ?? [],
        recentSessions: data.recentSessions ?? [],
      };
    } catch (error) {
      console.error('[Dashboard Service] Failed to fetch stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get today's dashboard stats
   */
  async getTodayStats(recentSessionsLimit = 10): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    return this.getStats({ date: today, recentSessionsLimit });
  }

  /**
   * Calculate peak hours summary from peak hours data
   */
  calculatePeakHoursSummary(peakHours: PeakHourData[]): { 
    peakRange: string; 
    avgSessions: number;
  } {
    if (!peakHours.length) {
      return { peakRange: 'N/A', avgSessions: 0 };
    }

    // Find the peak hours (highest session counts)
    const sorted = [...peakHours].sort((a, b) => b.sessionCount - a.sessionCount);
    const topHours = sorted.slice(0, 3);
    
    if (topHours.length === 0) {
      return { peakRange: 'N/A', avgSessions: 0 };
    }

    // Get hour range
    const hours = topHours.map(h => parseInt(h.hour)).sort((a, b) => a - b);
    const startHour = hours[0] ?? 0;
    const endHour = (hours[hours.length - 1] ?? 0) + 1;

    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:00 ${period}`;
    };

    const avgSessions = Math.round(
      topHours.reduce((sum, h) => sum + h.sessionCount, 0) / topHours.length
    );

    return {
      peakRange: `${formatHour(startHour)} - ${formatHour(endHour)}`,
      avgSessions,
    };
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const dashboardService = new DashboardService();
export { dashboardService };
export default dashboardService;
