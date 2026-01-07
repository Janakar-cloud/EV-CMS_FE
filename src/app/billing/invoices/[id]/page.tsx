'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { billingService } from '@/lib/billing-service';
import type { Invoice } from '@/types/billing';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceDetails();
    }
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      const data = await billingService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    try {
      const blob = await billingService.downloadInvoice(invoice.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Invoice #{invoice.invoiceNumber}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">Invoice ID: {invoice.id}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                  {invoice.status}
                </Badge>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Session ID</span>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => router.push(`/sessions/${invoice.sessionId}`)}
              >
                {invoice.sessionId}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Issued Date</span>
              <span className="font-medium">{format(new Date(invoice.issuedAt), 'PPP')}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{format(new Date(invoice.dueDate), 'PPP')}</span>
              </div>
            )}
            {invoice.paidAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paid On</span>
                <span className="font-medium">{format(new Date(invoice.paidAt), 'PPP')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{invoice.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{invoice.customer.email}</p>
            </div>
            {invoice.customer.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{invoice.customer.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    {item.quantity && (
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">₹{item.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amount Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Amount Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{invoice.tax.toFixed(2)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>₹{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        {invoice.paymentMethod && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{invoice.paymentMethod}</span>
              </div>
              {invoice.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-medium">{invoice.transactionId}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
