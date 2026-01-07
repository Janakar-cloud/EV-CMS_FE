// Dashboard Type Definitions

export interface UserDashboardStats {
  upcomingBookings: number;
  activeSession?: ActiveSessionInfo;
  walletBalance: number;
  thisMonth: MonthlyStats;
  recentSessions: RecentSession[];
  favoriteStations: FavoriteStation[];
}

export interface ActiveSessionInfo {
  sessionId: string;
  chargerId: string;
  stationName: string;
  startTime: string;
  energyConsumed: number;
  currentPower: number;
  estimatedCost: number;
}

export interface MonthlyStats {
  sessions: number;
  energyConsumed: number; // kWh
  totalSpent: number;
}

export interface RecentSession {
  id: string;
  stationName: string;
  date: string;
  energyConsumed: number;
  cost: number;
}

export interface FavoriteStation {
  id: string;
  name: string;
  address: string;
  visitCount: number;
}

export interface AdminDashboardStats {
  overview: OverviewStats;
  chargers: ChargerStats;
  sessions: SessionStats;
  revenue: RevenueStats;
}

export interface OverviewStats {
  totalUsers: number;
  totalStations: number;
  totalChargers: number;
  activeSessions: number;
  todayRevenue: number;
  monthRevenue: number;
}

export interface ChargerStats {
  online: number;
  offline: number;
  faulted: number;
  maintenance: number;
  utilizationRate: number;
}

export interface SessionStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  avgDuration: number;
  totalEnergyDispensed: number;
}

export interface RevenueStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  trend: 'up' | 'down';
  topStations: Array<{
    stationId: string;
    stationName?: string;
    revenue: number;
  }>;
}
