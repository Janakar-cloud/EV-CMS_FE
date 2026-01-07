'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Loader2, TrendingUp, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface RevenueStats {
  totalRevenue: number;
  periodRevenue: number;
  growth: number;
  transactions: number;
  averageTransaction: number;
  byDay: { date: string; revenue: number }[];
}

export default function RevenueReportPage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');

  useEffect(() => {
    loadRevenueStats();
  }, [period]);

  const loadRevenueStats = async () => {
    try {
      setLoading(true);
      // Simulated data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStats({
        totalRevenue: 125000,
        periodRevenue: 35000,
        growth: 12.5,
        transactions: 450,
        averageTransaction: 277.78,
        byDay: Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
          revenue: Math.random() * 10000 + 3000,
        })),
      });
    } catch (error: any) {
      toast.error('Failed to load revenue stats');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Revenue report exported successfully');
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
          <h1 className="text-3xl font-bold">Revenue Report</h1>
          <p className="text-muted-foreground">Track platform revenue and earnings</p>
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

      {stats && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Period Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.periodRevenue.toLocaleString()}</div>
                <p className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{stats.growth}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.transactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.averageTransaction.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
              <CardDescription>Revenue breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.byDay.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{format(new Date(day.date), 'PPP')}</span>
                    </div>
                    <span className="font-semibold">₹{day.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
