'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import paymentService, { WalletTransaction } from '@/lib/payment-service';

export default function PaymentManager() {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    
    try {
      const balance = await paymentService.getWalletBalance(user.id);
      setWalletBalance(balance);
      
      const history = await paymentService.getTransactionHistory({ limit: 10 });
      setTransactions(history);
    } catch (err) {
      console.error('Failed to load wallet:', err);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount) {
      alert('Enter amount');
      return;
    }

    setLoading(true);
    try {
      const order = await paymentService.createRazorpayOrder(parseInt(topupAmount) * 100);
      
      // In real implementation, trigger Razorpay modal here
      console.log('Razorpay Order:', order);
      
      // For now, simulate topup
      await paymentService.walletTopup(parseInt(topupAmount));
      loadWalletData();
      setShowTopup(false);
      setTopupAmount('');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet & Payments</h1>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h2 className="text-lg opacity-90">Wallet Balance</h2>
        <p className="text-4xl font-bold mt-2">₹{walletBalance}</p>
        <button
          onClick={() => setShowTopup(!showTopup)}
          className="mt-4 px-4 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100"
        >
          Add Money
        </button>
      </div>

      {/* Topup Form */}
      {showTopup && (
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-bold mb-3">Top-up Wallet</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={handleTopup}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Top-up'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            transactions.map((tx: any) => (
              <div key={tx.transactionId} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{tx.type.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'topup' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <p className={`text-xs ${tx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
