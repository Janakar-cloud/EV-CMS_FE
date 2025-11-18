/**
 * Global App Store
 * Zustand store for global application state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  timestamp: Date;
  read: boolean;
}

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Loading States
  globalLoading: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Loading Actions
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        sidebarCollapsed: false,
        theme: 'system',
        notifications: [],
        unreadCount: 0,
        globalLoading: false,

        // UI Actions
        toggleSidebar: () =>
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          })),

        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),

        setTheme: (theme) =>
          set({ theme }),

        // Notification Actions
        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: `notif_${Date.now()}_${Math.random()}`,
              timestamp: new Date(),
              read: false,
            };

            return {
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            };
          }),

        markNotificationAsRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          })),

        markAllNotificationsAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          })),

        removeNotification: (id) =>
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: notification && !notification.read 
                ? Math.max(0, state.unreadCount - 1) 
                : state.unreadCount,
            };
          }),

        clearAllNotifications: () =>
          set({
            notifications: [],
            unreadCount: 0,
          }),

        // Loading Actions
        setGlobalLoading: (loading) =>
          set({ globalLoading: loading }),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
);

// Selectors for optimized re-renders
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);
export const useGlobalLoading = () => useAppStore((state) => state.globalLoading);
