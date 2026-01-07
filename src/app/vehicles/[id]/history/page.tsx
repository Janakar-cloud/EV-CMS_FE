'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vehicleService } from '@/lib/vehicle-service';
import type { VehicleSession } from '@/types/vehicle';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Battery, Clock, MapPin } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function VehicleHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [history, setHistory] = useState<VehicleSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      loadHistory();
    }
  }, [vehicleId]);

  const loadHistory = async () => {
    try {
      const data = await vehicleService.getVehicleHistory(vehicleId);
      setHistory(data.sessions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load history');
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

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vehicles
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Charging History</h1>
        <p className="text-muted-foreground">View past charging sessions for this vehicle</p>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Battery className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No charging history</h3>
            <p className="text-muted-foreground">This vehicle hasn't been charged yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((session) => (
            <Card key={session.sessionId}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.stationName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(session.date), 'PPp')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <span>{session.energyConsumed.toFixed(2)} kWh consumed</span>
                    </div>
                    <p className="text-sm font-semibold">Cost: ₹{session.cost.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/sessions/${session.sessionId}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
