'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { stationService } from '@/lib/station-service';
import type { Station, StationAvailability } from '@/types/station';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Star, Clock, Zap, Loader2, Calendar } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const stationId = params.id as string;
  const [station, setStation] = useState<Station | null>(null);
  const [availability, setAvailability] = useState<StationAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stationId) {
      loadStationDetails();
    }
  }, [stationId]);

  const loadStationDetails = async () => {
    try {
      const [stationData, availData] = await Promise.all([
        stationService.getStation(stationId),
        stationService.getAvailability(stationId),
      ]);
      setStation(stationData);
      setAvailability(availData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load station details');
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

  if (!station) {
    return <div>Station not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Station Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{station.name}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {station.address}, {station.city}, {station.state}
                  </CardDescription>
                </div>
                <Badge variant={station.status === 'active' ? 'default' : 'secondary'}>
                  {station.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {station.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{station.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({station.totalReviews} reviews)
                  </span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {station.operatingHours.open} - {station.operatingHours.close}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{station.connectors.length} Connectors</span>
                </div>
              </div>

              {station.amenities.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {station.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connectors */}
          <Card>
            <CardHeader>
              <CardTitle>Connectors</CardTitle>
              <CardDescription>Available charging connectors at this station</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {station.connectors.map((connector, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h4 className="font-semibold">{connector.type}</h4>
                      <p className="text-sm text-muted-foreground">{connector.power} kW</p>
                      <p className="mt-1 text-sm">
                        ₹{connector.pricing.basePrice}/kWh
                      </p>
                    </div>
                    <Badge
                      variant={connector.status === 'available' ? 'default' : 'secondary'}
                    >
                      {connector.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Available Connectors</p>
                  <p className="text-3xl font-bold">{availability?.available || 0}</p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/bookings/create?stationId=${stationId}`)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {station.images && station.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {station.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <img
                        src={img}
                        alt={`Station ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
