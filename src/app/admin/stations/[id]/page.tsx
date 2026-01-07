'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Loader2, CheckCircle2, XCircle, ShieldAlert, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface StationDetail {
  id: string;
  name: string;
  stationId: string;
  address: string;
  city: string;
  state?: string;
  ownerName: string;
  ownerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  connectors: { type: string; power: number; count: number }[];
  documents: string[];
  submittedAt: string;
}

export default function AdminStationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadStation();
  }, [params?.id]);

  const loadStation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/stations/${params?.id}`);
      if (!response.ok) throw new Error('Station not found');
      const data = await response.json();
      setStation(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load station');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (approve: boolean) => {
    if (!station) return;
    try {
      setUpdating(true);
      const response = await fetch(`/api/v1/admin/stations/${station.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approve ? 'approved' : 'rejected' }),
      });
      if (!response.ok) throw new Error('Failed to verify station');
      setStation({ ...station, status: approve ? 'approved' : 'rejected' });
      toast.success(`Station ${approve ? 'approved' : 'rejected'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update station');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Station not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin / Stations / {station.stationId}</p>
          <h1 className="text-3xl font-bold">{station.name}</h1>
          <p className="text-muted-foreground">Review documents and approve this location</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/stations')}>
            Back
          </Button>
          {station.status === 'pending' ? (
            <>
              <Button
                variant="destructive"
                disabled={updating}
                onClick={() => handleDecision(false)}
              >
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}Reject
              </Button>
              <Button
                variant="default"
                disabled={updating}
                onClick={() => handleDecision(true)}
              >
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}Approve
              </Button>
            </>
          ) : (
            <Badge variant={station.status === 'approved' ? 'default' : 'destructive'}>
              {station.status}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Location</CardTitle>
          </div>
          <Badge variant="outline">ID: {station.stationId}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Address</p>
              <p>{station.address}</p>
              <p>
                {station.city}{station.state ? `, ${station.state}` : ''}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Owner</p>
              <p>{station.ownerName}</p>
              <p>{station.ownerEmail}</p>
              <p className="mt-1 text-xs">Submitted {format(new Date(station.submittedAt), 'PPp')}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Connectors</p>
            <div className="grid gap-3 md:grid-cols-3">
              {station.connectors.map((c) => (
                <div key={c.type} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-sm">
                  <p className="font-semibold text-foreground">{c.type}</p>
                  <p className="text-muted-foreground">{c.power} kW • {c.count} connectors</p>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Documents</p>
            <div className="flex flex-wrap gap-2">
              {station.documents.map((doc) => (
                <Badge key={doc} variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {doc}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Review documents before approval.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
