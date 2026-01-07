'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dashboardService, { RecentSession } from '@/lib/dashboard-service';

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getStatusColor(status: RecentSession['status']) {
  switch (status) {
    case 'charging':
      return 'bg-warning-100 text-warning-800';
    case 'completed':
      return 'bg-success-100 text-success-800';
    case 'failed':
      return 'bg-danger-100 text-danger-800';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'stopped':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPaymentStatusColor(status: RecentSession['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'text-success-600';
    case 'pending':
      return 'text-warning-600';
    case 'failed':
      return 'text-danger-600';
    case 'refunded':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

interface RecentSessionsProps {
  sessions?: RecentSession[];
  loading?: boolean;
}

export default function RecentSessions({ sessions: propSessions, loading: propLoading }: RecentSessionsProps) {
  const [sessions, setSessions] = useState<RecentSession[]>(propSessions ?? []);
  const [loading, setLoading] = useState(propLoading ?? !propSessions);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    // Skip if sessions are passed as props
    if (propSessions) return;

    try {
      setError(null);
      const data = await dashboardService.getTodayStats(10);
      setSessions(data.recentSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [propSessions]);

  useEffect(() => {
    if (propSessions) {
      setSessions(propSessions);
      setLoading(false);
    } else {
      fetchSessions();
    }
  }, [propSessions, fetchSessions]);

  // Update sessions when props change
  useEffect(() => {
    if (propSessions) {
      setSessions(propSessions);
    }
  }, [propSessions]);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-danger-600">{error}</p>
        <button onClick={fetchSessions} className="mt-2 btn btn-sm btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
        <Link href="/chargers/monitoring" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View All Sessions
        </Link>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Charger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Energy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      #{session.sessionId?.slice(-6).toUpperCase() ?? session._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(session.startTime)}
                    </div>
                    {session.roaming?.isRoaming && (
                      <div className="text-xs text-blue-600 font-medium">
                        Roaming • {session.roaming.partnerBrand}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{session.chargerName ?? `Charger ${session.chargerId}`}</div>
                  <div className="text-sm text-gray-500">Connector {session.connectorId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDuration(session.duration)}
                  </div>
                  {session.status === 'charging' && (
                    <div className="text-xs text-gray-500">Ongoing</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {session.energyConsumed.toFixed(1)} kWh
                  </div>
                  {session.status === 'charging' && session.currentPower && (
                    <div className="text-xs text-gray-500">
                      {session.currentPower} kW
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{session.cost.toFixed(2)}
                  </div>
                  {session.roaming?.isRoaming && session.roaming.roamingFee && (
                    <div className="text-xs text-gray-500">
                      +₹{session.roaming.roamingFee} roaming
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${getPaymentStatusColor(session.paymentStatus)}`}
                  >
                    {session.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">No recent sessions found</div>
        </div>
      )}
    </div>
  );
}
