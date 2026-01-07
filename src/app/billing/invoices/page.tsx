'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { billingService } from '@/lib/billing-service';
import type { Invoice } from '@/types/billing';
import { toast } from 'sonner';
import { FileText, Search, Loader2, Download, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInvoices();
  }, [search, page]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.invoiceNumber = search;

      const response = await billingService.getInvoices(params);
      setInvoices(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      paid: { variant: 'default', label: 'Paid' },
      pending: { variant: 'secondary', label: 'Pending' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const blob = await billingService.downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">View and download your charging invoices</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No invoices found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try a different search term' : "You don't have any invoices yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/billing/invoices/${invoice.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Invoice #{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            Session: {invoice.sessionId}
                          </p>
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>

                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Issued: {format(new Date(invoice.issuedAt), 'PPP')}</span>
                        </div>
                        {invoice.dueDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {format(new Date(invoice.dueDate), 'PPP')}</span>
                          </div>
                        )}
                        {invoice.paidAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Paid: {format(new Date(invoice.paidAt), 'PPP')}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-lg font-semibold">
                        Total: ₹{invoice.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(invoice.id);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
