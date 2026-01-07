'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface StationVerification {
  id: string;
  stationId: string;
  name: string;
  address: string;
  city: string;
  ownerName: string;
  ownerEmail: string;
  documents: string[];
  status: string;
  submittedAt: string;
}

export default function AdminStationsPage() {
  const [stations, setStations] = useState<StationVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/stations/verification?status=pending');
      if (!response.ok) throw new Error('Failed to fetch station verifications');
      const data = await response.json();
      setStations(data.stations || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load station verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/v1/admin/stations/verification/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approved ? 'approved' : 'rejected' }),
      });
      if (!response.ok) throw new Error('Failed to update station verification');
      toast.success(`Station ${approved ? 'approved' : 'rejected'} successfully`);
      loadStations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update verification status');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Station Verification</h1>
        <p className="text-muted-foreground">Review and approve charging stations</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : stations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No pending verifications</h3>
            <p className="text-muted-foreground">All stations have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stations.map((station) => (
            <Card key={station.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{station.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {station.stationId}</p>
                  </div>
                  <Badge variant="secondary">{station.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {station.address}, {station.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-sm text-muted-foreground">{station.ownerName}</p>
                    <p className="text-sm text-muted-foreground">{station.ownerEmail}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {station.documents.map((doc, idx) => (
                      <Badge key={idx} variant="outline">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Submitted: {format(new Date(station.submittedAt), 'PPp')}
                </p>

                {station.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleVerify(station.id, true)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerify(station.id, false)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
