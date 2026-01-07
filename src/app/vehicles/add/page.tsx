'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vehicleService } from '@/lib/vehicle-service';
import type { CreateVehicleRequest } from '@/types/vehicle';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    batteryCapacity: 0,
    registrationNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vehicleService.createVehicle(formData);
      toast.success('Vehicle added successfully');
      router.push('/vehicles');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Vehicle</CardTitle>
          <CardDescription>Enter your vehicle details</CardDescription>
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
                  placeholder="e.g., Tesla, Nissan, BMW"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., Model 3, Leaf, i3"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  min="2010"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="battery">Battery Capacity (kWh) *</Label>
                <Input
                  id="battery"
                  type="number"
                  step="0.1"
                  value={formData.batteryCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, batteryCapacity: parseFloat(e.target.value) })
                  }
                  placeholder="e.g., 75.0"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="registration">Registration Number *</Label>
                <Input
                  id="registration"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationNumber: e.target.value })
                  }
                  placeholder="e.g., KA01AB1234"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Vehicle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
