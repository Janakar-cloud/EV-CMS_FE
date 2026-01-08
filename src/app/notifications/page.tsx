'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notificationService } from '@/lib/notification-service';
import type { NotificationResponse } from '@/lib/notification-service';
import { toast } from 'sonner';
import { Bell, Loader2, Check, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ page, limit: 20 });
      setNotifications(response.notifications);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error: any) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      loadNotifications();
    } catch (error: any) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
      loadNotifications();
    } catch (error: any) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-slate-300">Stay updated with important alerts</p>
        </div>
        <Button onClick={handleMarkAllAsRead} variant="outline">
          <Check className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                >
                  <Bell className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), 'PPp')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.type && (
                      <Badge variant="outline" className="mt-2">
                        {notification.type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
