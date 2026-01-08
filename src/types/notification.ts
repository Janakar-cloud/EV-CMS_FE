export interface EmailNotificationPreferences {
  bookingConfirmation?: boolean;
  sessionComplete?: boolean;
  paymentSuccess?: boolean;
  promotions?: boolean;
}

export interface PushNotificationPreferences {
  bookingReminder?: boolean;
  sessionStart?: boolean;
  sessionEnd?: boolean;
  lowBalance?: boolean;
}

export interface SmsNotificationPreferences {
  bookingConfirmation?: boolean;
  sessionComplete?: boolean;
  paymentSuccess?: boolean;
}

export interface NotificationPreferences {
  email: EmailNotificationPreferences;
  push: PushNotificationPreferences;
  sms: SmsNotificationPreferences;
}
