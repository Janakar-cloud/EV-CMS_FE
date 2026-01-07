'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { rfidService } from '@/lib/rfid-service';
import { toast } from 'sonner';
import { Loader2, Plus, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import type { RFIDCard } from '@/types/rfid';

export default function RFIDDashboardPage() {
  const router = useRouter();
  const [cards, setCards] = useState<RFIDCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    blockedCards: 0,
    readersOnline: 0,
    readersOffline: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [cardsResponse, healthResponse] = await Promise.all([
        rfidService.listCards({}, 1, 5),
        rfidService.getSystemHealth(),
      ]);

      setCards(cardsResponse.items);
      setSystemHealth(healthResponse);
      setStats({
        totalCards: healthResponse.totalCards,
        activeCards: healthResponse.activeCards,
        blockedCards: healthResponse.blockedCards,
        readersOnline: healthResponse.readersOnline,
        readersOffline: healthResponse.readersOffline,
      });
    } catch (error) {
      console.error('Failed to load RFID dashboard:', error);
      toast.error('Failed to load RFID data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to block this card?')) return;

    try {
      await rfidService.blockCard(cardId, 'Blocked by admin');
      toast.success('Card blocked successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to block card');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">RFID Management</h1>
            <p className="mt-2 text-slate-300">Manage NFC cards, validate access, and monitor transactions</p>
          </div>
          <button
            onClick={() => router.push('/rfid/register')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium"
          >
            <Plus className="h-4 w-4" />
            Register Card
          </button>
        </div>

        {/* System Health Status */}
        {systemHealth && (
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600 p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                  <p className="text-sm text-slate-300">Status</p>
                </div>
                <p className="text-lg font-bold text-white capitalize">{systemHealth.status}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-slate-300">Readers Online</p>
                </div>
                <p className="text-lg font-bold text-white">{stats.readersOnline}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-slate-300">Readers Offline</p>
                </div>
                <p className="text-lg font-bold text-white">{stats.readersOffline}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <p className="text-sm text-slate-300 mb-2">Last Sync</p>
                <p className="text-sm font-mono text-slate-200">
                  {systemHealth.lastSyncTime
                    ? new Date(systemHealth.lastSyncTime).toLocaleTimeString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 border border-blue-500">
            <p className="text-blue-100 text-sm mb-2">Total Cards</p>
            <p className="text-3xl font-bold text-white">{stats.totalCards}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 border border-green-500">
            <p className="text-green-100 text-sm mb-2">Active Cards</p>
            <p className="text-3xl font-bold text-white">{stats.activeCards}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 border border-purple-500">
            <p className="text-purple-100 text-sm mb-2">Blocked Cards</p>
            <p className="text-3xl font-bold text-white">{stats.blockedCards}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-6 border border-amber-500">
            <p className="text-amber-100 text-sm mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-white">98.5%</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/rfid/cards')}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition"
          >
            <p className="text-white font-semibold mb-1">Manage Cards</p>
            <p className="text-sm text-slate-300">View and manage all RFID cards</p>
          </button>

          <button
            onClick={() => router.push('/rfid/readers')}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition"
          >
            <p className="text-white font-semibold mb-1">RFID Readers</p>
            <p className="text-sm text-slate-300">Configure charger readers</p>
          </button>

          <button
            onClick={() => router.push('/rfid/analytics')}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition"
          >
            <p className="text-white font-semibold mb-1">Analytics</p>
            <p className="text-sm text-slate-300">View usage reports and insights</p>
          </button>
        </div>

        {/* Recent Cards */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600 overflow-hidden">
          <div className="p-6 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white">Recent Cards</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : cards.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">No RFID cards registered yet</p>
              <button
                onClick={() => router.push('/rfid/register')}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Register First Card
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-700/50">
                    <th className="px-6 py-3 text-left text-slate-300">Card Name</th>
                    <th className="px-6 py-3 text-left text-slate-300">UID</th>
                    <th className="px-6 py-3 text-left text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-slate-300">Type</th>
                    <th className="px-6 py-3 text-left text-slate-300">Last Used</th>
                    <th className="px-6 py-3 text-right text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {cards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-white font-medium">{card.cardName || 'Unnamed'}</td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">{card.uid}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            card.status === 'active'
                              ? 'bg-green-900/30 text-green-300'
                              : card.status === 'blocked'
                                ? 'bg-red-900/30 text-red-300'
                                : 'bg-yellow-900/30 text-yellow-300'
                          }`}
                        >
                          {card.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{card.cardType}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {card.lastUsedAt ? new Date(card.lastUsedAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {card.status === 'active' ? (
                          <button
                            onClick={() => handleBlockCard(card.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Block
                          </button>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
