'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vehicleService } from '@/lib/vehicle-service';
import type { VehicleStats } from '@/types/vehicle';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Battery, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function VehicleStatsPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      loadStats();
    }
  }, [vehicleId]);

  const loadStats = async () => {
    try {
      const data = await vehicleService.getVehicleStats(vehicleId);
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stats');
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
    return <div>Stats not available</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vehicles
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vehicle Statistics</h1>
        <p className="text-muted-foreground">Detailed charging analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Charging sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Consumed</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnergyConsumed.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground">Total energy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.averageCostPerSession.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sessions This Month</span>
              <span className="font-bold">{stats.monthlyStats?.sessions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Energy This Month</span>
              <span className="font-bold">
                {stats.monthlyStats?.energyConsumed.toFixed(1) || 0} kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Spent This Month</span>
              <span className="font-bold">
                ₹{stats.monthlyStats?.cost.toFixed(2) || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charging Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg Energy/Session</span>
              <span className="font-bold">
                {stats.averageEnergyPerSession.toFixed(1)} kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Most Used Station</span>
              <span className="font-bold">{stats.favoriteStation || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Charged</span>
              <span className="font-bold">
                {stats.lastChargedDate
                  ? new Date(stats.lastChargedDate).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
