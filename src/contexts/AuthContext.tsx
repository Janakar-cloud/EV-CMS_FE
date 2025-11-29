'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { STORAGE_KEYS, APP_ROUTES } from '@/config/constants';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!(user && token);

  const publicRoutes = [APP_ROUTES.LOGIN];
  const isPublicRoute = publicRoutes.includes(pathname);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
    
    // Set cookie for middleware authentication
    document.cookie = `auth-token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  };

  const logout = async () => {
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    
    // Clear cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    router.push(APP_ROUTES.LOGIN);
  };

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    
    if (!storedToken || !storedUser) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      
      // Set cookie for middleware
      document.cookie = `auth-token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      
      const response = await authService.checkAuth(storedToken);
      
      if (response.success && response.user && response.token) {
        if (response.token !== storedToken) {
          setToken(response.token);
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
          document.cookie = `auth-token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        if (JSON.stringify(response.user) !== JSON.stringify(parsedUser)) {
          setUser(response.user);
          localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.replace('/login'); 
      } else if (isAuthenticated && pathname === APP_ROUTES.LOGIN) {
        router.replace(APP_ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, pathname, isPublicRoute, router]);
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
