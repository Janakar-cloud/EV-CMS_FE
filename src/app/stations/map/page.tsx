'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { stationService } from '@/lib/station-service';
import type { Station } from '@/types/station';
import { toast } from 'sonner';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StationsMapPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          loadNearbyStations(location.lat, location.lng);
        },
        (error) => {
          toast.error('Unable to get your location');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocation not supported');
      setLoading(false);
    }
  };

  const loadNearbyStations = async (lat: number, lng: number) => {
    try {
      const response = await stationService.findNearby({
        latitude: lat,
        longitude: lng,
        radius: 5000, // 5km
      });
      setStations(response.stations);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load nearby stations');
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nearby Stations</h1>
          <p className="text-muted-foreground">Stations within 5km of your location</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/stations')}>
          List View
        </Button>
      </div>

      {/* Map Placeholder */}
      <Card className="mb-6">
        <CardContent className="flex h-96 items-center justify-center bg-muted">
          <div className="text-center">
            <MapPin className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              Map integration coming soon
              <br />
              Google Maps API key required
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Stations List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Found {stations.length} nearby stations</h2>
        {stations.map((station) => (
          <Card key={station.id} className="cursor-pointer" onClick={() => router.push(`/stations/${station.id}`)}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{station.name}</h3>
                  <p className="text-sm text-muted-foreground">{station.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {station.connectors.length} connectors available
                  </p>
                </div>
              </div>
              <Button variant="outline">
                <Navigation className="mr-2 h-4 w-4" />
                Navigate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
