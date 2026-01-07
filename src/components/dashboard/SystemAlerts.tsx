'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { notificationService, NotificationResponse, NotificationType } from '@/lib/notification-service';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  chargerId?: string;
  resolved: boolean;
}

function mapNotificationToAlert(notification: NotificationResponse): Alert {
  let alertType: Alert['type'] = 'info';
  
  switch (notification.type) {
    case NotificationType.ERROR:
    case NotificationType.ALERT:
    case NotificationType.SYSTEM_ALERT:
      alertType = 'error';
      break;
    case NotificationType.WARNING:
      alertType = 'warning';
      break;
    case NotificationType.SUCCESS:
      alertType = 'success';
      break;
    default:
      alertType = 'info';
  }

  return {
    id: notification.id,
    type: alertType,
    title: notification.title,
    message: notification.message,
    timestamp: new Date(notification.createdAt),
    chargerId: notification.metadata?.chargerId,
    resolved: notification.read,
  };
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      // GET /api/v1/notifications?type=system_alert&isRead=false&page=1&limit=20
      const response = await notificationService.getSystemAlerts(1, 20);
      const mappedAlerts = response.notifications.map(mapNotificationToAlert);
      setAlerts(mappedAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    
    // Polling: refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      // PATCH /api/v1/notifications/:id/read
      await notificationService.markAsRead(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-danger-600">{error}</p>
        <button onClick={fetchAlerts} className="mt-2 btn btn-sm btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">System Alerts</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          {activeAlerts.length} Active
        </span>
      </div>

      <div className="space-y-4">
        {activeAlerts.slice(0, 5).map((alert) => (
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
                  <div className="flex items-center gap-3">
                    {alert.chargerId && (
                      <Link 
                        href={`/chargers?id=${alert.chargerId}`}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        View Charger
                      </Link>
                    )}
                    <button 
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeAlerts.length === 0 && (
        <div className="text-center py-8">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-success-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">All systems operational</h3>
          <p className="mt-1 text-sm text-gray-500">
            No active alerts at this time.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link href="/support/tickets" className="block w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium">
          View All Alerts
        </Link>
      </div>
    </div>
  );
}
