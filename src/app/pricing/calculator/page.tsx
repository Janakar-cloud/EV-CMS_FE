'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pricingService } from '@/lib/pricing-service';
import type { PricingCalculation } from '@/types/pricing';
import { toast } from 'sonner';
import { ArrowLeft, Calculator, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function PricingCalculatorPage() {
  const router = useRouter();
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<PricingCalculation | null>(null);

  const [formData, setFormData] = useState({
    stationId: '',
    connectorType: '',
    energyKwh: '',
    duration: '',
  });

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stationId || !formData.connectorType || !formData.energyKwh) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCalculating(true);
      const data = await pricingService.calculatePrice({
        stationId: formData.stationId,
        connectorType: formData.connectorType,
        energyKwh: parseFloat(formData.energyKwh),
        durationMinutes: formData.duration ? parseInt(formData.duration) : undefined,
      });
      setResult(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate price');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Calculator</CardTitle>
            <CardDescription>Estimate charging costs</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="station">Station ID *</Label>
                <Input
                  id="station"
                  placeholder="Enter station ID"
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                />
              </div>

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
                    <SelectItem value="CCS">CCS</SelectItem>
                    <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                    <SelectItem value="Type2">Type 2</SelectItem>
                    <SelectItem value="GBT">GB/T</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="energy">Energy (kWh) *</Label>
                <Input
                  id="energy"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter energy in kWh"
                  value={formData.energyKwh}
                  onChange={(e) => setFormData({ ...formData, energyKwh: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={calculating}>
                {calculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Cost
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Cost</CardTitle>
            <CardDescription>Breakdown of charges</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Fill in the form to calculate pricing
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Energy Cost</span>
                    <span>₹{result.energyCost.toFixed(2)}</span>
                  </div>
                  {result.serviceFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>₹{result.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {result.parkingFee && result.parkingFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Parking Fee</span>
                      <span>₹{result.parkingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {result.tax > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax ({result.taxRate}%)</span>
                      <span>₹{result.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {result.discount && result.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-₹{result.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span>₹{result.totalAmount.toFixed(2)}</span>
                </div>

                {result.breakdown && (
                  <div className="rounded-md bg-muted p-4">
                    <p className="mb-2 text-sm font-medium">Details:</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Base Rate: ₹{result.breakdown.baseRate}/kWh</p>
                      <p>Energy: {formData.energyKwh} kWh</p>
                      {result.breakdown.isPeakHour && (
                        <p className="text-orange-600">Peak Hour Rate Applied</p>
                      )}
                      {result.breakdown.appliedRule && (
                        <p>Rule: {result.breakdown.appliedRule}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
