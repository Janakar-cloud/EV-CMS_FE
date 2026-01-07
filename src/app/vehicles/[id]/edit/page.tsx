'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vehicleService } from '@/lib/vehicle-service';
import type { Vehicle } from '@/types/vehicle';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    batteryCapacity: '',
    registrationNumber: '',
    isDefault: false,
  });

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      const vehicle = await vehicleService.getVehicle(vehicleId);
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year.toString(),
        batteryCapacity: vehicle.batteryCapacity.toString(),
        registrationNumber: vehicle.registrationNumber,
        isDefault: vehicle.isDefault,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await vehicleService.updateVehicle(vehicleId, {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        batteryCapacity: parseFloat(formData.batteryCapacity),
        registrationNumber: formData.registrationNumber,
        isDefault: formData.isDefault,
      });
      toast.success('Vehicle updated successfully');
      router.push('/vehicles');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update vehicle');
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
        Back to Vehicles
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Vehicle</CardTitle>
          <CardDescription>Update your vehicle information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="battery">Battery Capacity (kWh) *</Label>
                <Input
                  id="battery"
                  type="number"
                  step="0.1"
                  value={formData.batteryCapacity}
                  onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration">Registration Number *</Label>
              <Input
                id="registration"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
