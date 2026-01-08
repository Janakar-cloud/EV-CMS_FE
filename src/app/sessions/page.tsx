'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sessionService } from '@/lib/session-service';
import type { ChargingSession } from '@/types/session';
import { toast } from 'sonner';
import { Battery, Clock, Zap, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSessions();
  }, [status, page]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (status !== 'all') params.status = status;

      const response = await sessionService.getSessions(params);
      setSessions(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'outline', label: 'Completed' },
      stopped: { variant: 'secondary', label: 'Stopped' },
      failed: { variant: 'destructive', label: 'Failed' },
    } as const;

    const key = (
      status in variants ? (status as keyof typeof variants) : 'active'
    ) as keyof typeof variants;
    const config = variants[key];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDuration = (start: string, end?: string | null) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Charging Sessions</h1>
        <p className="text-muted-foreground">View your charging history and active sessions</p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Select
            value={status}
            onValueChange={value => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Zap className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No sessions found</h3>
            <p className="text-muted-foreground">
              {status === 'all'
                ? "You haven't started any charging sessions yet"
                : `No ${status} sessions found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {sessions.map(session => (
              <Card
                key={session.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/sessions/${session.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{session.station.name}</h3>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(session.startTime), 'PPp')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDuration(session.startTime, session.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Battery className="h-4 w-4 text-muted-foreground" />
                          <span>{session.energyConsumed.toFixed(2)} kWh</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span>{session.connector.power} kW</span>
                        </div>
                      </div>

                      {session.totalCost > 0 && (
                        <div className="text-lg font-semibold">
                          Cost: ₹{session.totalCost.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/sessions/${session.id}`);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
