'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sessionService } from '@/lib/session-service';
import type { ChargingSession } from '@/types/session';
import { toast } from 'sonner';
import { ArrowLeft, Battery, Calendar, Clock, Zap, Loader2, MapPin, StopCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<ChargingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
      // Poll for active sessions
      const interval = session?.status === 'active' ? setInterval(loadSessionDetails, 10000) : null;
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [sessionId, session?.status]);

  const loadSessionDetails = async () => {
    try {
      const data = await sessionService.getSession(sessionId);
      setSession(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    if (!confirm('Are you sure you want to stop this charging session?')) return;

    try {
      setStopping(true);
      await sessionService.stopSession(sessionId);
      toast.success('Session stopped successfully');
      loadSessionDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop session');
    } finally {
      setStopping(false);
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  const socProgress = ((session.currentSoc || 0) / 100) * 100;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sessions
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{session.station.name}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {session.station.address}
                </CardDescription>
              </div>
              <Badge variant={session.status === 'active' ? 'default' : 'outline'}>
                {session.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium">{format(new Date(session.startTime), 'PPp')}</p>
                </div>
              </div>
              {session.endTime && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p className="font-medium">{format(new Date(session.endTime), 'PPp')}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{formatDuration(session.startTime, session.endTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charging Progress */}
        {session.status === 'active' && (
          <Card>
            <CardHeader>
              <CardTitle>Charging Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Battery Level</span>
                  <span className="text-sm font-medium">{session.currentSoc || 0}%</span>
                </div>
                <Progress value={socProgress} className="h-2" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Energy Consumed</p>
                  <p className="text-2xl font-bold">{session.energyConsumed.toFixed(2)} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Power</p>
                  <p className="text-2xl font-bold">{session.connector.power} kW</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Cost</p>
                  <p className="text-2xl font-bold">₹{session.totalCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Energy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Energy Consumed</span>
                <span className="font-medium">{session.energyConsumed.toFixed(2)} kWh</span>
              </div>
              {session.initialSoc !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Initial SOC</span>
                  <span className="font-medium">{session.initialSoc}%</span>
                </div>
              )}
              {session.currentSoc !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current SOC</span>
                  <span className="font-medium">{session.currentSoc}%</span>
                </div>
              )}
              {session.finalSoc !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Final SOC</span>
                  <span className="font-medium">{session.finalSoc}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connector Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{session.connector.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Power</span>
                <span className="font-medium">{session.connector.power} kW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge>{session.connector.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Energy Cost</span>
              <span>₹{(session.energyConsumed * (session.connector.pricing?.basePrice || 0)).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Cost</span>
              <span>₹{session.totalCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {session.status === 'active' && (
          <div className="flex justify-center">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleStopSession}
              disabled={stopping}
            >
              {stopping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Charging
                </>
              )}
            </Button>
          </div>
        )}

        {session.status === 'completed' && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/sessions/${sessionId}/cdr`)}
            >
              View Charge Detail Record
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
