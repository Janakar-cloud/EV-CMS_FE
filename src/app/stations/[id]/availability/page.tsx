'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { stationService } from '@/lib/station-service';
import type { StationAvailability } from '@/types/station';
import { toast } from 'sonner';
import { ArrowLeft, Zap, Loader2, RefreshCw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StationAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const stationId = params.id as string;
  const [availability, setAvailability] = useState<StationAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (stationId) {
      loadAvailability();
    }
  }, [stationId]);

  const loadAvailability = async () => {
    try {
      setRefreshing(true);
      const data = await stationService.getAvailability(stationId);
      setAvailability(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load availability');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!availability) {
    return <div>Availability data not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      occupied: 'bg-red-500',
      faulted: 'bg-yellow-500',
      unavailable: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Availability</h1>
          <p className="text-muted-foreground">Current connector status</p>
        </div>
        <Button onClick={loadAvailability} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Connectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availability.connectors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availability.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {availability.connectors.filter((c) => c.status === 'occupied').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connector Status</CardTitle>
          <CardDescription>Live status of all connectors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availability.connectors.map((connector, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(connector.status)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <h4 className="font-semibold">{connector.type}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{connector.power} kW</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={connector.status === 'available' ? 'default' : 'secondary'}
                  >
                    {connector.status}
                  </Badge>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ₹{connector.pricing.basePrice}/kWh
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {availability.available > 0 && (
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={() => router.push(`/bookings/create?stationId=${stationId}`)}
          >
            Book a Connector
          </Button>
        </div>
      )}
    </div>
  );
}
