'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { walletService } from '@/lib/wallet-service';
import type { WalletResponse, Transaction } from '@/types/wallet';
import { toast } from 'sonner';
import { Wallet, Plus, TrendingUp, TrendingDown, Loader2, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const data = await walletService.getWallet({ limit: 10 });
      setWallet(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load wallet');
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

  if (!wallet) {
    return <div>Failed to load wallet</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet balance and transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <IndianRupee className="h-6 w-6" />
                <span className="text-4xl font-bold">{wallet.balance.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{wallet.currency}</p>
            </div>
            <Button className="w-full" onClick={() => router.push('/wallet/topup')}>
              <Plus className="mr-2 h-4 w-4" />
              Top Up Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{wallet.transactions.length}</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/wallet/transactions')}
              >
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last 10 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {wallet.transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.type === 'credit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: ₹{transaction.balanceAfter.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
