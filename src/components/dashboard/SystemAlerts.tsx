'use client';

import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  chargerId?: string;
  resolved: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'error',
    title: 'Charger Offline',
    message: 'Highway Plaza - DC02 has been offline for 15 minutes',
    timestamp: new Date(Date.now() - 900000),
    chargerId: '3',
    resolved: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Temperature',
    message: 'Phoenix Mall - DC01 temperature above 50Â°C',
    timestamp: new Date(Date.now() - 600000),
    chargerId: '1',
    resolved: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Maintenance Scheduled',
    message: 'Tech Park - AC01 maintenance scheduled for tomorrow',
    timestamp: new Date(Date.now() - 3600000),
    chargerId: '2',
    resolved: false,
  },
];

function getAlertIcon(type: Alert['type']) {
  switch (type) {
    case 'error':
      return <ExclamationTriangleIcon className="h-5 w-5 text-danger-600" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />;
    case 'info':
      return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
    default:
      return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
  }
}

function getAlertColor(type: Alert['type']) {
  switch (type) {
    case 'error':
      return 'border-l-danger-500 bg-danger-50';
    case 'warning':
      return 'border-l-warning-500 bg-warning-50';
    case 'info':
      return 'border-l-blue-500 bg-blue-50';
    case 'success':
      return 'border-l-success-500 bg-success-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
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

export default function SystemAlerts() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">System Alerts</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          {mockAlerts.filter(alert => !alert.resolved).length} Active
        </span>
      </div>

      <div className="space-y-4">
        {mockAlerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getAlertIcon(alert.type)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {alert.title}
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  {alert.message}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                  {alert.chargerId && (
                    <button className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                      View Charger
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockAlerts.length === 0 && (
        <div className="text-center py-8">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-success-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">All systems operational</h3>
          <p className="mt-1 text-sm text-gray-500">
            No active alerts at this time.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full text-sm text-primary-600 hover:text-primary-800 font-medium">
          View All Alerts
        </button>
      </div>
    </div>
  );
}
