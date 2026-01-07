'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { walletService } from '@/lib/wallet-service';
import type { Transaction } from '@/types/wallet';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [type, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (type !== 'all') params.type = type;

      const response = await walletService.getTransactions(params);
      setTransactions(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowDownLeft className="h-5 w-5 text-green-600" />
    ) : (
      <ArrowUpRight className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      pending: { variant: 'secondary', label: 'Pending' },
      failed: { variant: 'destructive', label: 'Failed' },
    };
    const config = variants[status] || variants.completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all your wallet transactions</p>
        </div>
        <Button onClick={() => router.push('/wallet')}>Back to Wallet</Button>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
              <SelectItem value="debit">Debits</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No transactions found</h3>
            <p className="text-muted-foreground">
              {type === 'all'
                ? "You don't have any transactions yet"
                : `No ${type} transactions found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'PPp')}
                        </p>
                        {transaction.sessionId && (
                          <p className="text-xs text-muted-foreground">
                            Session: {transaction.sessionId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}₹
                        {transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: ₹{transaction.balanceAfter.toFixed(2)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
