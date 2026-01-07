'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wrench, Loader2, Plus, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface MaintenanceRecord {
  id: string;
  stationId: string;
  stationName: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  scheduledDate?: string;
  completedDate?: string;
  technician?: string;
  cost?: number;
  createdAt: string;
}

export default function MaintenancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const loadMaintenanceRecords = async () => {
    try {
      setLoading(true);
      // Simulated data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRecords([
        {
          id: '1',
          stationId: 'STN001',
          stationName: 'Green Energy Hub',
          type: 'preventive',
          description: 'Regular connector inspection',
          status: 'scheduled',
          priority: 'medium',
          scheduledDate: '2025-12-30T10:00:00Z',
          createdAt: '2025-12-25T10:00:00Z',
        },
        {
          id: '2',
          stationId: 'STN002',
          stationName: 'Fast Charge Point',
          type: 'corrective',
          description: 'Connector malfunction repair',
          status: 'completed',
          priority: 'high',
          completedDate: '2025-12-28T15:00:00Z',
          technician: 'John Smith',
          cost: 5000,
          createdAt: '2025-12-27T09:00:00Z',
        },
      ]);
    } catch (error: any) {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      'in-progress': { variant: 'default', label: 'In Progress' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      low: { variant: 'outline', label: 'Low' },
      medium: { variant: 'secondary', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      urgent: { variant: 'destructive', label: 'Urgent' },
    };
    const config = variants[priority] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Maintenance Records</h1>
          <p className="text-slate-300 mt-1">Track and manage all maintenance operations</p>
        </div>
        <Button onClick={() => router.push('/maintenance/schedule')}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No maintenance records</h3>
            <p className="text-muted-foreground">No maintenance activities found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/maintenance/${record.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{record.stationName}</h3>
                      {getStatusBadge(record.status)}
                      {getPriorityBadge(record.priority)}
                      <Badge variant="outline" className="capitalize">
                        {record.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{record.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {record.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Scheduled: {format(new Date(record.scheduledDate), 'PPp')}
                          </span>
                        </div>
                      )}
                      {record.completedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Completed: {format(new Date(record.completedDate), 'PPp')}
                          </span>
                        </div>
                      )}
                    </div>

                    {record.technician && (
                      <p className="text-sm text-muted-foreground">
                        Technician: {record.technician}
                      </p>
                    )}

                    {record.cost && (
                      <p className="text-sm font-semibold">Cost: ₹{record.cost.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
