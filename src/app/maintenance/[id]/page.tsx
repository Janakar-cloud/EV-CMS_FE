'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import maintenanceService, { MaintenanceTask, MaintenanceStatus } from '@/lib/maintenance-service';
import { Loader2, Calendar, Clock3, Wrench, ArrowLeft, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MaintenanceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<MaintenanceTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTask();
  }, [params?.id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getTask(params?.id || '');
      setTask(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (status: MaintenanceStatus) => {
    if (!task) return;
    try {
      setUpdating(true);
      if (status === 'in_progress') await maintenanceService.startTask(task._id);
      if (status === 'completed') await maintenanceService.completeTask(task._id);
      if (status === 'cancelled') await maintenanceService.cancelTask(task._id);
      setTask({ ...task, status });
      toast.success(`Task marked as ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const statusVariant: Record<MaintenanceStatus, 'default' | 'destructive' | 'secondary'> = {
    scheduled: 'secondary',
    in_progress: 'default',
    completed: 'default',
    cancelled: 'destructive',
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Task not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Maintenance / {task._id}</p>
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <p className="text-muted-foreground">{task.stationName} · {task.chargerName}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/maintenance')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Task Overview</CardTitle>
          </div>
          <Badge variant={statusVariant[task.status]}>Status: {task.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Details</p>
              <p>{task.description}</p>
              <p>Type: <Badge variant="outline">{task.type}</Badge></p>
              <p>Priority: <Badge variant="outline">{task.priority}</Badge></p>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Schedule</p>
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Scheduled {format(new Date(task.scheduledDate), 'PPp')}</p>
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Created {format(new Date(task.createdAt), 'PPp')}</p>
              {task.updatedAt && <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Updated {format(new Date(task.updatedAt), 'PPp')}</p>}
              {task.cost && (
                <p className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Cost ₹{task.cost}</p>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="default"
              disabled={updating || task.status === 'completed'}
              onClick={() => handleStatus('in_progress')}
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start
            </Button>
            <Button
              size="sm"
              variant="default"
              disabled={updating || task.status === 'completed'}
              onClick={() => handleStatus('completed')}
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Complete
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={updating || task.status === 'completed'}
              onClick={() => handleStatus('cancelled')}
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
