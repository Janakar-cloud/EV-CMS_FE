'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Clock3, Battery, MapPin } from 'lucide-react';
import sessionService from '@/lib/session-service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface ActiveSession {
  id: string;
  stationName: string;
  connectorId: number;
  power: number;
  energyConsumed: number;
  startTime: string;
  userName?: string;
  vehicle?: string;
  status: string;
}

export default function ActiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActive();
  }, []);

  const loadActive = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getActiveSessions();
      const normalized = Array.isArray(data) ? data : data?.data || [];
      setSessions(normalized);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (start: string) => {
    const startTime = new Date(start).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - startTime) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground">Live charging sessions across the network</p>
        </div>
        <Button variant="outline" onClick={loadActive} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No active sessions</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="relative">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>{session.stationName}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Connector {session.connectorId}
                  </p>
                </div>
                <Badge variant="default">{session.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <span>{formatDuration(session.startTime)} (started {format(new Date(session.startTime), 'PPp')})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>{session.power} kW</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Battery className="h-4 w-4" />
                  <span>{session.energyConsumed.toFixed(2)} kWh</span>
                </div>
                {session.userName && (
                  <div className="text-sm text-muted-foreground">User: {session.userName}</div>
                )}
                {session.vehicle && (
                  <div className="text-sm text-muted-foreground">Vehicle: {session.vehicle}</div>
                )}
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/sessions/${session.id}`)}>
                    View details
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
