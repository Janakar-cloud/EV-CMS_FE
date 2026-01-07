'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { billingService } from '@/lib/billing-service';
import type { Refund } from '@/types/billing';
import { toast } from 'sonner';
import { DollarSign, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function RefundsPage() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRefunds();
  }, [page]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const response = await billingService.getRefunds({ page, limit: 10 });
      setRefunds(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      processed: { variant: 'outline', label: 'Processed' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">Track your refund requests</p>
      </div>

      {/* Refunds List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : refunds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No refunds found</h3>
            <p className="text-muted-foreground">You haven't requested any refunds</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {refunds.map((refund) => (
              <Card key={refund.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Refund #{refund.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Invoice: {refund.invoiceId}
                          </p>
                        </div>
                        {getStatusBadge(refund.status)}
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Requested: {format(new Date(refund.requestedAt), 'PPP')}</span>
                        </div>
                        {refund.processedAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Processed: {format(new Date(refund.processedAt), 'PPP')}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="text-sm">{refund.reason}</p>
                      </div>

                      <div className="text-lg font-semibold">
                        Amount: ₹{refund.amount.toFixed(2)}
                      </div>

                      {refund.adminNotes && (
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-sm font-medium">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{refund.adminNotes}</p>
                        </div>
                      )}
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
