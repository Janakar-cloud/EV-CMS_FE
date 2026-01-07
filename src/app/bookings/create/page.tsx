'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingService } from '@/lib/booking-service';
import { stationService } from '@/lib/station-service';
import { vehicleService } from '@/lib/vehicle-service';
import type { Station } from '@/types/station';
import type { Vehicle } from '@/types/vehicle';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStationId = searchParams.get('stationId');

  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    stationId: preselectedStationId || '',
    connectorType: '',
    vehicleId: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stationsRes, vehiclesRes] = await Promise.all([
        stationService.getStations({ status: 'active' }),
        vehicleService.getVehicles(),
      ]);
      setStations(stationsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectedStation = stations.find((s) => s.id === formData.stationId);
  const availableConnectors = selectedStation?.connectors.filter(
    (c) => c.status === 'available'
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stationId || !formData.connectorType || !formData.vehicleId || 
        !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduledTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    if (scheduledTime < new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    try {
      setSubmitting(true);
      await bookingService.createBooking({
        stationId: formData.stationId,
        connectorType: formData.connectorType,
        vehicleId: formData.vehicleId,
        scheduledTime: scheduledTime.toISOString(),
      });
      toast.success('Booking created successfully');
      router.push('/bookings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
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
    <div className="container mx-auto max-w-2xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Booking</CardTitle>
          <CardDescription>Book a charging station for your vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Station Selection */}
            <div className="space-y-2">
              <Label htmlFor="station">Charging Station *</Label>
              <Select
                value={formData.stationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, stationId: value, connectorType: '' })
                }
              >
                <SelectTrigger id="station">
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name} - {station.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Connector Type */}
            {formData.stationId && (
              <div className="space-y-2">
                <Label htmlFor="connector">Connector Type *</Label>
                <Select
                  value={formData.connectorType}
                  onValueChange={(value) => setFormData({ ...formData, connectorType: value })}
                >
                  <SelectTrigger id="connector">
                    <SelectValue placeholder="Select connector type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConnectors.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No connectors available
                      </SelectItem>
                    ) : (
                      availableConnectors.map((connector, idx) => (
                        <SelectItem key={idx} value={connector.type}>
                          {connector.type} - {connector.power} kW (₹
                          {connector.pricing.basePrice}/kWh)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle *</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
              >
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No vehicles added
                    </SelectItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {vehicles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => router.push('/vehicles/add')}
                  >
                    Add a vehicle
                  </Button>{' '}
                  before creating a booking
                </p>
              )}
            </div>

            {/* Scheduled Date */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || vehicles.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
