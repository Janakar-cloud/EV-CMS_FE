'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { walletService } from '@/lib/wallet-service';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Loader2, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WalletTopupPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      const data = await walletService.getWallet();
      setBalance(data.balance);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();

    const topupAmount = parseFloat(amount);
    if (!topupAmount || topupAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (topupAmount < 100) {
      toast.error('Minimum topup amount is ₹100');
      return;
    }

    if (topupAmount > 50000) {
      toast.error('Maximum topup amount is ₹50,000');
      return;
    }

    try {
      setSubmitting(true);
      await walletService.topupWallet({ amount: topupAmount });
      toast.success('Wallet topped up successfully');
      router.push('/wallet');
    } catch (error: any) {
      toast.error(error.message || 'Failed to topup wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Wallet
      </Button>

      <div className="space-y-6">
        {/* Current Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-muted-foreground" />
                <span className="text-3xl font-bold">₹{balance.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Money to Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTopup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  max="50000"
                  step="1"
                />
                <p className="text-sm text-muted-foreground">
                  Min: ₹100 | Max: ₹50,000
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label>Quick Select</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      onClick={() => setAmount(quickAmount.toString())}
                    >
                      ₹{quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 font-semibold">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topup Amount</span>
                    <span className="font-medium">
                      ₹{amount ? parseFloat(amount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span className="font-medium">₹0.00</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t pt-2">
                    <span className="font-semibold">Total Payable</span>
                    <span className="font-bold">
                      ₹{amount ? parseFloat(amount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
