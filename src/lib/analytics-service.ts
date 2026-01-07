import { apiClient } from './api-client';

// NOTE: Analytics uses /api/analytics (NOT /api/v1/analytics)
const ANALYTICS_BASE = '/api/analytics';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

// Helper to check if error is a 404/route not found
const isNotFoundError = (error: any): boolean => {
  const message = error.response?.data?.message || error.message || '';
  return (
    error.response?.status === 404 ||
    message.includes('Route not found') ||
    message.includes('not found') ||
    message.includes('404')
  );
};

export interface RevenueAnalytics {
  totalRevenue: number;
  cpoShare: number;
  partnerShare: number;
  utilityShare: number;
  period: {
    start: string;
    end: string;
  };
}

export interface ChargerStatistics {
  totalChargers: number;
  activeChargers: number;
  inUseChargers: number;
  faultedChargers: number;
  averageUtilization: number;
  chargersByType: {
    'slow-ac': number;
    'moderate-ac': number;
    'fast-dc': number;
    'ultra-fast-dc': number;
  };
}

export interface SessionSummary {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  totalEnergyDelivered: number;
  totalCost: number;
  averageSessionDuration: number;
  averageEnergy: number;
}

export interface UserActivity {
  activeUsers: number;
  newUsers: number;
  topUsers: Array<{
    userId: string;
    sessions: number;
    energyUsed: number;
    totalSpent: number;
  }>;
}

export interface PeakHour {
  hour: number;
  sessions: number;
  energyDelivered: number;
}

export interface PeakHoursAnalysis {
  peakHours: PeakHour[];
}

export interface ComplianceReport {
  complianceScore: number;
  uptime: number;
  safetyIncidents: number;
  maintenanceCompliance: number;
  userComplaints: number;
}

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

// Default empty values for graceful degradation
const defaultRevenueAnalytics: RevenueAnalytics = {
  totalRevenue: 0,
  cpoShare: 0,
  partnerShare: 0,
  utilityShare: 0,
  period: { start: '', end: '' }
};

const defaultChargerStatistics: ChargerStatistics = {
  totalChargers: 0,
  activeChargers: 0,
  inUseChargers: 0,
  faultedChargers: 0,
  averageUtilization: 0,
  chargersByType: { 'slow-ac': 0, 'moderate-ac': 0, 'fast-dc': 0, 'ultra-fast-dc': 0 }
};

const defaultSessionSummary: SessionSummary = {
  totalSessions: 0,
  completedSessions: 0,
  failedSessions: 0,
  totalEnergyDelivered: 0,
  totalCost: 0,
  averageSessionDuration: 0,
  averageEnergy: 0
};

const defaultUserActivity: UserActivity = {
  activeUsers: 0,
  newUsers: 0,
  topUsers: []
};

const defaultPeakHoursAnalysis: PeakHoursAnalysis = {
  peakHours: []
};

const defaultComplianceReport: ComplianceReport = {
  complianceScore: 0,
  uptime: 0,
  safetyIncidents: 0,
  maintenanceCompliance: 0,
  userComplaints: 0
};

class AnalyticsService {
  // Analytics API is at /api/analytics (not under /api/v1)
  private baseEndpoint = ANALYTICS_BASE;

  /**
   * Get revenue analytics for a date range
   */
  async getRevenueAnalytics(dateRange: AnalyticsDateRange): Promise<RevenueAnalytics> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await apiClient.get<RevenueAnalytics>(
        `${this.baseEndpoint}/revenue?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Revenue analytics endpoint not available');
        return { ...defaultRevenueAnalytics, period: { start: dateRange.startDate, end: dateRange.endDate } };
      }
      console.error('Failed to fetch revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get charger statistics
   */
  async getChargerStatistics(dateRange: AnalyticsDateRange): Promise<ChargerStatistics> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await apiClient.get<ChargerStatistics>(
        `${this.baseEndpoint}/charger-stats?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Charger statistics endpoint not available');
        return defaultChargerStatistics;
      }
      console.error('Failed to fetch charger statistics:', error);
      throw error;
    }
  }

  /**
   * Get session summary
   */
  async getSessionSummary(dateRange: AnalyticsDateRange): Promise<SessionSummary> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await apiClient.get<SessionSummary>(
        `${this.baseEndpoint}/session-summary?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Session summary endpoint not available');
        return defaultSessionSummary;
      }
      console.error('Failed to fetch session summary:', error);
      throw error;
    }
  }

  /**
   * Get user activity metrics
   */
  async getUserActivity(
    dateRange: AnalyticsDateRange,
    limit: number = 10
  ): Promise<UserActivity> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: String(limit),
      });

      const response = await apiClient.get<UserActivity>(
        `${this.baseEndpoint}/user-activity?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('User activity endpoint not available');
        return defaultUserActivity;
      }
      console.error('Failed to fetch user activity:', error);
      throw error;
    }
  }

  /**
   * Get peak hours analysis
   */
  async getPeakHoursAnalysis(dateRange: AnalyticsDateRange): Promise<PeakHoursAnalysis> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await apiClient.get<PeakHoursAnalysis>(
        `${this.baseEndpoint}/peak-hours?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Peak hours endpoint not available');
        return defaultPeakHoursAnalysis;
      }
      console.error('Failed to fetch peak hours analysis:', error);
      throw error;
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(dateRange: AnalyticsDateRange): Promise<ComplianceReport> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await apiClient.get<ComplianceReport>(
        `${this.baseEndpoint}/compliance-report?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Compliance report endpoint not available');
        return defaultComplianceReport;
      }
      console.error('Failed to fetch compliance report:', error);
      throw error;
    }
  }

  /**
   * Get all analytics data for dashboard
   */
  async getDashboardMetrics(dateRange: AnalyticsDateRange): Promise<{
    revenue: RevenueAnalytics;
    chargerStats: ChargerStatistics;
    sessionSummary: SessionSummary;
    userActivity: UserActivity;
    peakHours: PeakHoursAnalysis;
    compliance: ComplianceReport;
  }> {
    // Use Promise.allSettled to handle partial failures gracefully
    const [revenue, chargerStats, sessionSummary, userActivity, peakHours, compliance] =
      await Promise.all([
        this.getRevenueAnalytics(dateRange).catch(() => ({ ...defaultRevenueAnalytics, period: { start: dateRange.startDate, end: dateRange.endDate } })),
        this.getChargerStatistics(dateRange).catch(() => defaultChargerStatistics),
        this.getSessionSummary(dateRange).catch(() => defaultSessionSummary),
        this.getUserActivity(dateRange).catch(() => defaultUserActivity),
        this.getPeakHoursAnalysis(dateRange).catch(() => defaultPeakHoursAnalysis),
        this.getComplianceReport(dateRange).catch(() => defaultComplianceReport),
      ]);

    return {
      revenue,
      chargerStats,
      sessionSummary,
      userActivity,
      peakHours,
      compliance,
    };
  }

  /**
   * Get revenue trend over time
   */
  async getRevenueTrend(
    dateRange: AnalyticsDateRange,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<Array<{ date: string; revenue: number }>> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        interval,
      });

      const response = await apiClient.get<Array<{ date: string; revenue: number }>>(
        `${this.baseEndpoint}/revenue-trend?${params.toString()}`
      );
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Revenue trend endpoint not available');
        return [];
      }
      console.error('Failed to fetch revenue trend:', error);
      throw error;
    }
  }

  /**
   * Get charger utilization trend
   */
  async getUtilizationTrend(
    dateRange: AnalyticsDateRange,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<Array<{ date: string; utilization: number }>> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        interval,
      });

      const response = await apiClient.get<Array<{ date: string; utilization: number }>>(
        `${this.baseEndpoint}/utilization-trend?${params.toString()}`
      );
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Utilization trend endpoint not available');
        return [];
      }
      console.error('Failed to fetch utilization trend:', error);
      throw error;
    }
  }

  /**
   * Export analytics as CSV
   */
  async exportAnalytics(
    dateRange: AnalyticsDateRange,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
      });

      const response = await apiClient.get<Blob>(
        `${this.baseEndpoint}/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Export endpoint not available');
        return new Blob(['No data available'], { type: 'text/plain' });
      }
      console.error('Failed to export analytics:', error);
      throw error;
    }
  }

  /**
   * Get custom report
   */
  async getCustomReport(
    dateRange: AnalyticsDateRange,
    metrics: string[]
  ): Promise<Record<string, any>> {
    try {
      const response = await apiClient.post<Record<string, any>>(
        `${this.baseEndpoint}/custom-report`,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          metrics,
        }
      );
      return response;
    } catch (error: any) {
      if (isNotFoundError(error)) {
        console.warn('Custom report endpoint not available');
        return {};
      }
      console.error('Failed to fetch custom report:', error);
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();
export { analyticsService };
export default analyticsService;
