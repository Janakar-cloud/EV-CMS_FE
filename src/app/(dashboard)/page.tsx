'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/lib/dashboard-service';
import type { UserDashboardStats } from '@/types/dashboard';
import { toast } from 'sonner';
import {
  Calendar,
  Zap,
  IndianRupee,
  Activity,
  Wallet,
  MapPin,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats();
      // Map DashboardStats to UserDashboardStats format
      const recentSessions = data?.recentSessions?.map((session: any) => ({
        id: session._id || session.sessionId || '',
        stationName: session.stationName || 'Unknown Station',
        date: new Date().toISOString(),
        energyConsumed: session.energyConsumption || 0,
        cost: session.cost || 0,
      })) ?? [];

      const mappedStats: UserDashboardStats = {
        upcomingBookings: 0,
        walletBalance: 0,
        thisMonth: {
          sessions: data?.overview?.activeSessions ?? 0,
          energyConsumed: 0,
          totalSpent: data?.overview?.todaysRevenue ?? 0,
        },
        recentSessions,
        favoriteStations: [],
      };
      setStats(mappedStats);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard stats');
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
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-300 mt-1">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-100">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.upcomingBookings}</div>
            <p className="text-xs text-blue-100">Scheduled charging sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-emerald-100">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{stats.walletBalance.toFixed(2)}</div>
            <p className="text-xs text-emerald-100">Available balance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-purple-100">This Month</CardTitle>
            <Activity className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.thisMonth.sessions}</div>
            <p className="text-xs text-purple-100">Charging sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-amber-100">Energy Used</CardTitle>
            <Zap className="h-4 w-4 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.thisMonth.energyConsumed.toFixed(1)}</div>
            <p className="text-xs text-amber-100">kWh this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Active Session */}
        {stats.activeSession && (
          <Card>
            <CardHeader>
              <CardTitle>Active Session</CardTitle>
              <CardDescription>Currently charging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Station:</span>
                  <span className="font-medium">{stats.activeSession.stationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Energy:</span>
                  <span className="font-medium">
                    {stats.activeSession.energyConsumed.toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power:</span>
                  <span className="font-medium">{stats.activeSession.currentPower} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Cost:</span>
                  <span className="font-medium">
                    ₹{stats.activeSession.estimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* This Month Summary */}
        <Card>
          <CardHeader>
            <CardTitle>This Month Summary</CardTitle>
            <CardDescription>Your charging activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions:</span>
                <span className="font-medium">{stats.thisMonth.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Energy Consumed:</span>
                <span className="font-medium">{stats.thisMonth.energyConsumed.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spent:</span>
                <span className="font-medium">₹{stats.thisMonth.totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your last charging sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{session.stationName}</p>
                    <p className="text-sm text-muted-foreground">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{session.energyConsumed.toFixed(2)} kWh</p>
                    <p className="text-sm text-muted-foreground">₹{session.cost.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorite Stations */}
      {stats.favoriteStations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Favorite Stations</CardTitle>
            <CardDescription>Stations you visit most</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.favoriteStations.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{station.name}</p>
                      <p className="text-sm text-muted-foreground">{station.address}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{station.visitCount} visits</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
