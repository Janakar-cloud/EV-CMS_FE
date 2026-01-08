import { z } from 'zod';
import apiClient from './api-client';

/**
 * Notification Service
 * Handles real-time notifications and system alerts
 *
 * Backend API:
 * - GET /api/v1/notifications?type=system_alert&isRead=false&page=1&limit=20
 * - PATCH /api/v1/notifications/:id/read
 * - POST /api/v1/notifications (admin create)
 */

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ALERT = 'alert',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationCategory {
  CHARGER = 'charger',
  SESSION = 'session',
  PAYMENT = 'payment',
  PARTNER = 'partner',
  SYSTEM = 'system',
  SECURITY = 'security',
}

// Validation schema for notification
export const notificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  message: z.string().min(1, 'Message required'),
  type: z.nativeEnum(NotificationType).default(NotificationType.INFO),
  category: z.nativeEnum(NotificationCategory),
  read: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unread: number;
  page: number;
  pages: number;
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
  category?: NotificationCategory;
}

export interface CreateNotificationRequest {
  userId?: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  type?: NotificationType;
  category?: NotificationCategory;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private static readonly API_BASE = '/notifications';

  /**
   * Get all notifications for current user
   * GET /api/v1/notifications?type=system_alert&isRead=false&page=1&limit=20
   */
  async getNotifications(options?: NotificationFilters): Promise<NotificationListResponse> {
    try {
      const params: Record<string, string> = {};
      if (options?.page) params.page = String(options.page);
      if (options?.limit) params.limit = String(options.limit);
      if (options?.type) params.type = options.type;
      if (options?.isRead !== undefined) params.isRead = String(options.isRead);
      if (options?.category) params.category = options.category;

      const response = await apiClient.get(NotificationService.API_BASE, { params });
      const data = unwrap<any>(response);

      // Handle both array and paginated response
      if (Array.isArray(data)) {
        return {
          notifications: data,
          total: data.length,
          unread: data.filter((n: any) => !n.isRead && !n.read).length,
          page: 1,
          pages: 1,
        };
      }

      return {
        notifications: data.notifications ?? data.data ?? [],
        total: data.total ?? 0,
        unread: data.unread ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get system alerts (unread)
   * GET /api/v1/notifications?type=system_alert&isRead=false&page=1&limit=20
   */
  async getSystemAlerts(page = 1, limit = 20): Promise<NotificationListResponse> {
    try {
      return await this.getNotifications({
        type: 'system_alert',
        isRead: false,
        page,
        limit,
      });
    } catch (error) {
      console.error('Failed to fetch system alerts:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(limit = 20): Promise<NotificationResponse[]> {
    const response = await this.getNotifications({ isRead: false, limit });
    return response.notifications;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<NotificationResponse> {
    try {
      const response = await apiClient.get(`${NotificationService.API_BASE}/${id}`);
      return unwrap<NotificationResponse>(response);
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<NotificationResponse> {
    try {
      const response = await apiClient.patch(`${NotificationService.API_BASE}/${id}/read`);
      return unwrap<NotificationResponse>(response);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string; updated: number }> {
    try {
      const response = await apiClient.patch(`${NotificationService.API_BASE}/read-all`);
      return unwrap<{ message: string; updated: number }>(response);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Create notification (admin only)
   * POST /api/v1/notifications with { userId, title, message, priority }
   */
  async createNotification(data: CreateNotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await apiClient.post(NotificationService.API_BASE, data);
      return unwrap<NotificationResponse>(response);
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`${NotificationService.API_BASE}/${id}`);
      return unwrap<{ message: string }>(response);
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<{ message: string; deleted: number }> {
    try {
      const response = await apiClient.delete(NotificationService.API_BASE);
      return unwrap<{ message: string; deleted: number }>(response);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<any> {
    try {
      const response = await apiClient.get(`${NotificationService.API_BASE}/preferences`);
      return unwrap<any>(response);
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: any): Promise<any> {
    try {
      const response = await apiClient.put(
        `${NotificationService.API_BASE}/preferences`,
        preferences
      );
      return unwrap<any>(response);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Create bulk notifications (admin only)
   */
  async createBulkNotifications(data: {
    userIds: string[];
    title: string;
    message: string;
    type?: NotificationType;
  }): Promise<{ message: string; created: number }> {
    try {
      const response = await apiClient.post(`${NotificationService.API_BASE}/bulk`, data);
      return unwrap<{ message: string; created: number }>(response);
    } catch (error) {
      console.error('Failed to create bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get(`${NotificationService.API_BASE}/unread-count`);
      const data = unwrap<{ unread: number }>(response);
      return data.unread ?? 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }

  /**
   * Get notifications by category
   */
  async getNotificationsByCategory(
    category: NotificationCategory
  ): Promise<NotificationResponse[]> {
    const response = await this.getNotifications({ category });
    return response.notifications;
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: NotificationType): Promise<NotificationResponse[]> {
    const response = await this.getNotifications({ type });
    return response.notifications;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
