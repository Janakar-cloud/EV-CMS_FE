'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/lib/dashboard-service';
import type { AdminDashboardStats } from '@/types/dashboard';
import { toast } from 'sonner';
import { Users, MapPin, Zap, DollarSign, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getStats();
      // Map stats to AdminDashboardStats format - with extended properties for page compatibility
      const mappedStats: any = {
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalStations: 0,
        activeStations: 0,
        activeSessions: data?.overview?.activeSessions ?? 0,
        totalSessionsToday: 0,
        revenue: {
          total: data?.overview?.todaysRevenue ?? 0,
          percentageChange: 0,
        },
        monthlyStats: {
          totalSessions: data?.overview?.activeSessions ?? 0,
          energyConsumed: 0,
          revenue: data?.overview?.todaysRevenue ?? 0,
          newBookings: 0,
        },
        pendingVerifications: 0,
        openSupportTickets: 0,
        pendingRefunds: 0,
        stationAlerts: 0,
        overview: {
          totalUsers: 0,
          totalStations: 0,
          totalChargers: data?.overview?.totalChargers ?? 0,
          activeSessions: data?.overview?.activeSessions ?? 0,
          todayRevenue: data?.overview?.todaysRevenue ?? 0,
          monthRevenue: 0,
        },
        chargers: {
          online: 0,
          offline: 0,
          faulted: 0,
          maintenance: 0,
          utilizationRate: 0,
        },
        sessions: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          avgDuration: 0,
          totalEnergyDispensed: 0,
        },
        revenue_stats: {
          today: data?.overview?.todaysRevenue ?? 0,
          thisWeek: 0,
          thisMonth: 0,
          trend: 'up',
          topStations: [],
        },
      };
      setStats(mappedStats);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSessionsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.revenue.total.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +{stats.revenue.percentageChange}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Sessions</span>
              <span className="font-bold">{stats.monthlyStats.totalSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Energy Consumed</span>
              <span className="font-bold">{stats.monthlyStats.energyConsumed} kWh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-bold">₹{stats.monthlyStats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New Bookings</span>
              <span className="font-bold">{stats.monthlyStats.newBookings}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Verifications</span>
              <span className="font-bold text-orange-600">
                {stats.pendingVerifications}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Open Support Tickets</span>
              <span className="font-bold text-blue-600">
                {stats.openSupportTickets}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Refunds</span>
              <span className="font-bold text-red-600">
                {stats.pendingRefunds}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Station Alerts</span>
              <span className="font-bold">
                {stats.stationAlerts || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => router.push('/admin/users')}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium">User Management</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => router.push('/admin/stations')}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium">Station Verification</p>
              <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
            </div>
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => router.push('/admin/kyc')}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium">KYC Queue</p>
              <p className="text-2xl font-bold">{stats.pendingKycDocuments || 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
