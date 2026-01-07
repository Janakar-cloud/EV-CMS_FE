'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { notificationService } from '@/lib/notification-service';
import type { NotificationPreferences } from '@/types/notification';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      bookingConfirmation: true,
      sessionComplete: true,
      paymentSuccess: true,
      promotions: false,
    },
    push: {
      bookingReminder: true,
      sessionStart: true,
      sessionEnd: true,
      lowBalance: true,
    },
    sms: {
      bookingConfirmation: false,
      sessionComplete: false,
      paymentSuccess: false,
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error: any) {
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationService.updatePreferences(preferences);
      toast.success('Preferences saved successfully');
    } catch (error: any) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground">Manage how you receive notifications</p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-booking">Booking Confirmation</Label>
              <Switch
                id="email-booking"
                checked={preferences.email.bookingConfirmation}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    email: { ...preferences.email, bookingConfirmation: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-session">Session Complete</Label>
              <Switch
                id="email-session"
                checked={preferences.email.sessionComplete}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    email: { ...preferences.email, sessionComplete: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-payment">Payment Success</Label>
              <Switch
                id="email-payment"
                checked={preferences.email.paymentSuccess}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    email: { ...preferences.email, paymentSuccess: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-promo">Promotions & Offers</Label>
              <Switch
                id="email-promo"
                checked={preferences.email.promotions}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    email: { ...preferences.email, promotions: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-reminder">Booking Reminder</Label>
              <Switch
                id="push-reminder"
                checked={preferences.push.bookingReminder}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    push: { ...preferences.push, bookingReminder: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-start">Session Start</Label>
              <Switch
                id="push-start"
                checked={preferences.push.sessionStart}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    push: { ...preferences.push, sessionStart: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-end">Session End</Label>
              <Switch
                id="push-end"
                checked={preferences.push.sessionEnd}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    push: { ...preferences.push, sessionEnd: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-balance">Low Balance Alert</Label>
              <Switch
                id="push-balance"
                checked={preferences.push.lowBalance}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    push: { ...preferences.push, lowBalance: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-booking">Booking Confirmation</Label>
              <Switch
                id="sms-booking"
                checked={preferences.sms.bookingConfirmation}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    sms: { ...preferences.sms, bookingConfirmation: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-session">Session Complete</Label>
              <Switch
                id="sms-session"
                checked={preferences.sms.sessionComplete}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    sms: { ...preferences.sms, sessionComplete: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-payment">Payment Success</Label>
              <Switch
                id="sms-payment"
                checked={preferences.sms.paymentSuccess}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    sms: { ...preferences.sms, paymentSuccess: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
