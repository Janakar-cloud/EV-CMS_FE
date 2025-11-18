'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { formatTime } from '@/lib/time-utils';

export const AuthDebugInfo: React.FC = () => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('ðŸ” Auth State Change:', {
      pathname,
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      username: user?.username,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, isLoading, pathname, user, token]);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setCurrentTime(formatTime());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-3 rounded shadow-lg z-50 max-w-sm font-mono">
      <div className="font-bold mb-2">ðŸ” Auth Debug</div>
      <div>Path: <span className="text-green-400">{pathname}</span></div>
      <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>{isLoading ? 'true' : 'false'}</span></div>
      <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'true' : 'false'}</span></div>
      <div>User: <span className="text-blue-400">{user?.username || 'none'}</span></div>
      <div>Token: <span className={token ? 'text-green-400' : 'text-red-400'}>{token ? 'exists' : 'none'}</span></div>
      <div className="mt-2 text-xs text-gray-400">
        {currentTime}
      </div>
    </div>
  );
};

export default AuthDebugInfo;
