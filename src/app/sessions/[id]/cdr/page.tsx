'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sessionService } from '@/lib/session-service';
import type { CDR } from '@/types/session';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2, FileText } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function SessionCDRPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const [cdr, setCdr] = useState<CDR | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadCDR();
    }
  }, [sessionId]);

  const loadCDR = async () => {
    try {
      const data = await sessionService.getCDR(sessionId);
      setCdr(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load CDR');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!cdr) return;

    const cdrText = `
CHARGE DETAIL RECORD
${'='.repeat(50)}

Session ID: ${cdr.sessionId}
CDR ID: ${cdr.cdrId}

STATION INFORMATION
${'-'.repeat(50)}
Station: ${cdr.station.name}
Address: ${cdr.station.address}

VEHICLE INFORMATION
${'-'.repeat(50)}
Vehicle: ${cdr.vehicle.make} ${cdr.vehicle.model}
Registration: ${cdr.vehicle.registrationNumber}

SESSION DETAILS
${'-'.repeat(50)}
Start Time: ${format(new Date(cdr.startTime), 'PPpp')}
End Time: ${format(new Date(cdr.endTime), 'PPpp')}
Duration: ${((new Date(cdr.endTime).getTime() - new Date(cdr.startTime).getTime()) / 60000).toFixed(0)} minutes

Connector Type: ${cdr.connector.type}
Power: ${cdr.connector.power} kW

ENERGY CONSUMPTION
${'-'.repeat(50)}
Initial SOC: ${cdr.initialSoc}%
Final SOC: ${cdr.finalSoc}%
Energy Consumed: ${cdr.energyConsumed.toFixed(2)} kWh

COST BREAKDOWN
${'-'.repeat(50)}
Energy Cost: ₹${cdr.cost.energyCost.toFixed(2)}
Service Fee: ₹${cdr.cost.serviceFee.toFixed(2)}
Tax: ₹${cdr.cost.tax.toFixed(2)}
${'-'.repeat(50)}
Total Amount: ₹${cdr.cost.totalAmount.toFixed(2)}

Payment Status: ${cdr.paymentStatus}
${cdr.invoiceNumber ? `Invoice Number: ${cdr.invoiceNumber}` : ''}

Generated on: ${format(new Date(), 'PPpp')}
    `.trim();

    const blob = new Blob([cdrText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDR_${cdr.cdrId}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CDR downloaded successfully');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cdr) {
    return <div>CDR not found</div>;
  }

  const duration = (new Date(cdr.endTime).getTime() - new Date(cdr.startTime).getTime()) / 60000;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Charge Detail Record</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">CDR ID: {cdr.cdrId}</p>
              </div>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download CDR
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Station & Vehicle Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Station Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Station Name</p>
                <p className="font-medium">{cdr.station.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{cdr.station.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                  {cdr.vehicle.make} {cdr.vehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration</p>
                <p className="font-medium">{cdr.vehicle.registrationNumber}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Start Time</p>
                <p className="font-medium">{format(new Date(cdr.startTime), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Time</p>
                <p className="font-medium">{format(new Date(cdr.endTime), 'PPpp')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{Math.floor(duration / 60)}h {Math.floor(duration % 60)}m</p>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Connector Type</p>
                <p className="font-medium">{cdr.connector.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Power</p>
                <p className="font-medium">{cdr.connector.power} kW</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Consumption */}
        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Initial SOC</p>
                <p className="text-2xl font-bold">{cdr.initialSoc}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final SOC</p>
                <p className="text-2xl font-bold">{cdr.finalSoc}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Energy Consumed</p>
                <p className="text-2xl font-bold">{cdr.energyConsumed.toFixed(2)} kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Energy Cost</span>
              <span className="font-medium">₹{cdr.cost.energyCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium">₹{cdr.cost.serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">₹{cdr.cost.tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>₹{cdr.cost.totalAmount.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className="font-medium capitalize">{cdr.paymentStatus}</span>
            </div>
            {cdr.invoiceNumber && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-medium">{cdr.invoiceNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {cdr.invoiceNumber && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/billing/invoices/${cdr.invoiceNumber}`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
