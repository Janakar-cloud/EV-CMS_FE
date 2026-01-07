'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowRightOnRectangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import dashboardService, { DashboardStats, RecentSession } from '@/lib/dashboard-service';
import { DashboardChargerMap } from './DashboardChargerMap';

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

const statusAccent: Record<RecentSession['status'], string> = {
  charging: 'text-emerald-300',
  completed: 'text-cyan-300',
  failed: 'text-red-300',
  pending: 'text-amber-300',
  stopped: 'text-slate-300',
};

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const data = await dashboardService.getTodayStats(10);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-4 rounded-3xl border border-white/5 bg-slate-900/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 rounded-full bg-slate-800 animate-pulse"></div>
          <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
              <div className="h-3 w-20 rounded-full bg-slate-800 animate-pulse" />
              <div className="mt-4 h-8 w-full rounded-xl bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-900/50 p-6 text-sm text-red-100 shadow-lg">
        <p>{error ?? 'Unable to load dashboard data at the moment.'}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const { overview, networkStatus, recentSessions } = dashboardData;
  const energyFlowValue = Math.max(Math.round((overview.utilizationRate / 100) * overview.activeSessions * 90), 0);
  const statCards = [
    {
      label: 'Total Revenue (Today)',
      value: formatCurrency(overview.todaysRevenue),
      meta: `${overview.trends?.revenue ?? 0 >= 0 ? '+' : ''}${overview.trends?.revenue ?? 0}% vs yesterday`,
      accent: 'from-emerald-500/70 to-cyan-500/40',
    },
    {
      label: 'Active Chargers',
      value: `${overview.totalChargers}`,
      meta: `${overview.trends?.chargers ?? 0 >= 0 ? '+' : ''}${overview.trends?.chargers ?? 0}% trend`,
      accent: 'from-slate-900 to-slate-800',
    },
    {
      label: 'Energy Flow',
      value: `${energyFlowValue.toLocaleString()} kWh`,
      meta: `${overview.trends?.sessions ?? 0 >= 0 ? '+' : ''}${overview.trends?.sessions ?? 0}% sessions`,
      accent: 'from-amber-400/70 to-pink-500/40',
    },
    {
      label: 'Active Sessions',
      value: `${overview.activeSessions}`,
      meta: `${overview.utilizationRate.toFixed(1)}% utilization`,
      accent: 'from-indigo-500/60 to-sky-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-400">Live Data</p>
          <h1 className="text-3xl font-semibold text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400">Updated in real-time with your grid and session telemetry.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-emerald-500/40">
          <SparklesIcon className="h-4 w-4" />
          Generate Report
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border border-white/5 bg-gradient-to-br ${card.accent} p-5 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.8)]`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-xs text-white/70">{card.meta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Live Network Topology</p>
              <p className="text-xs text-slate-500">Current grid load & availability</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/80 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Live
            </span>
          </div>

          <div className="mt-6 h-72 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_60%),_rgba(15,23,42,0.95)] p-4 text-white relative overflow-hidden">
            <div className="h-full w-full rounded-2xl bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-70"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900/70 via-transparent to-slate-900/80" />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="space-y-4">
                {['Delhi Hub', 'Mumbai Hub', 'Bengaluru Hub'].map((hub, index) => (
                  <div key={hub} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-300" />
                      <p className="text-white/80">{hub}</p>
                    </div>
                    <p className="font-semibold text-white">{[420, 360, 180][index]} kW</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300">
                <span>Online</span>
                <span>{networkStatus.online} chargers</span>
                <span>Faults {networkStatus.faulted}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Online</p>
              <p className="text-2xl font-semibold text-white">{networkStatus.online}</p>
              <p className="text-xs text-slate-500">Stable</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Charging</p>
              <p className="text-2xl font-semibold text-white">{overview.activeSessions}</p>
              <p className="text-xs text-slate-500">Sessions & counting</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Activity Feed</p>
              <p className="text-xs text-slate-500">Latest session, payment, and alerts</p>
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Live</span>
          </div>

          <div className="mt-5 space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {recentSessions.slice(0, 6).map((session: RecentSession) => (
              <div
                key={session._id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{session.chargerName ?? `Charger ${session.chargerId}`}</p>
                  <p className="text-xs text-slate-400">{formatTimeAgo(session.startTime)} • {session.chargerId}</p>
                  <p className="text-xs text-slate-400">{session.energyConsumed.toFixed(1)} kWh · ₹{session.cost.toFixed(1)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold ${statusAccent[session.status] ?? 'text-slate-200'}`}>
                    {session.status}
                  </span>
                  <p className="text-xs text-slate-500">{session.paymentStatus}</p>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-sm text-slate-400">No recent activity yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Charger Map Section */}
      <section className="mt-6">
        <DashboardChargerMap />
      </section>
    </div>
  );
}
