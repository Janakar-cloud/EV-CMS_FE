'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { formatTime } from '@/lib/time-utils';

export default function QuickAuthStatus() {
  const { isLoading, isAuthenticated, user, token } = useAuth();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setCurrentTime(formatTime());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs">
      <div className="mb-2 font-bold">Auth Status</div>
      <div>Path: {pathname}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user?.username || 'None'}</div>
      <div>Token: {token ? 'Present' : 'None'}</div>
      <div className="mt-2 text-gray-300">
        Last Updated: {currentTime}
      </div>
    </div>
  );
}
