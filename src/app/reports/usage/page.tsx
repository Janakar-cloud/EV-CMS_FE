'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Loader2, BarChart3, FileText } from 'lucide-react';

export default function UsageReportPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');
  const [stats, setStats] = useState({
    totalSessions: 450,
    totalEnergy: 5240,
    activeUsers: 125,
    averageSessionDuration: 45,
    peakHourSessions: 180,
    stationUtilization: 68,
  });

  useEffect(() => {
    loadUsageStats();
  }, [period]);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      // Simulated data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: any) {
      toast.error('Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Usage report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usage Report</h1>
          <p className="text-muted-foreground">Platform usage and utilization metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Charging sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnergy} kWh</div>
            <p className="text-xs text-muted-foreground">Energy consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSessionDuration} min</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Peak Hour Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peakHourSessions}</div>
            <p className="text-xs text-muted-foreground">During peak hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Station Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stationUtilization}%</div>
            <p className="text-xs text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
