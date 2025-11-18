'use client';

import { ChargingSession } from '@/types';

const mockSessions: ChargingSession[] = [
  {
    id: 'sess-001',
    userId: 'user-123',
    chargerId: '1',
    connectorId: '1-1',
    startTime: new Date(Date.now() - 1800000),
    status: 'charging',
    energyConsumed: 15.5,
    duration: 30,
    cost: 450,
    currency: 'INR',
    paymentStatus: 'pending',
    startMethod: 'qr',
    brand: 'EV CMS',
    roaming: {
      isRoaming: false,
    },
    realTimeData: {
      currentPower: 45,
      voltage: 400,
      current: 112.5,
      temperature: 42,
      stateOfCharge: 65,
    },
  },
  {
    id: 'sess-002',
    userId: 'user-456',
    chargerId: '2',
    connectorId: '2-1',
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() - 600000),
    status: 'completed',
    energyConsumed: 22.3,
    duration: 50,
    cost: 668,
    currency: 'INR',
    paymentStatus: 'paid',
    startMethod: 'app',
    brand: 'EV CMS',
    roaming: {
      isRoaming: false,
    },
    realTimeData: {
      currentPower: 0,
      voltage: 0,
      current: 0,
      temperature: 35,
    },
  },
  {
    id: 'sess-003',
    userId: 'user-789',
    chargerId: '1',
    connectorId: '1-2',
    startTime: new Date(Date.now() - 7200000),
    endTime: new Date(Date.now() - 5400000),
    status: 'completed',
    energyConsumed: 45.8,
    duration: 30,
    cost: 1374,
    currency: 'INR',
    paymentStatus: 'paid',
    startMethod: 'nfc',
    brand: 'EV CMS',
    roaming: {
      isRoaming: true,
      partnerBrand: 'ChargePoint',
      roamingFee: 25,
    },
    realTimeData: {
      currentPower: 0,
      voltage: 0,
      current: 0,
      temperature: 32,
    },
  },
];

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getStatusColor(status: ChargingSession['status']) {
  switch (status) {
    case 'charging':
      return 'bg-warning-100 text-warning-800';
    case 'completed':
      return 'bg-success-100 text-success-800';
    case 'failed':
      return 'bg-danger-100 text-danger-800';
    case 'starting':
      return 'bg-blue-100 text-blue-800';
    case 'stopping':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPaymentStatusColor(status: ChargingSession['paymentStatus']) {
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

export default function RecentSessions() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
        <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View All Sessions
        </button>
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
            {mockSessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      #{session.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(session.startTime)}
                    </div>
                    {session.roaming.isRoaming && (
                      <div className="text-xs text-blue-600 font-medium">
                        Roaming â€¢ {session.roaming.partnerBrand}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Charger {session.chargerId}</div>
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
                  {session.status === 'charging' && session.realTimeData.currentPower && (
                    <div className="text-xs text-gray-500">
                      {session.realTimeData.currentPower} kW
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    â‚¹{session.cost.toFixed(2)}
                  </div>
                  {session.roaming.isRoaming && session.roaming.roamingFee && (
                    <div className="text-xs text-gray-500">
                      +â‚¹{session.roaming.roamingFee} roaming
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

      {mockSessions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">No recent sessions found</div>
        </div>
      )}
    </div>
  );
}
