'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to use auth context
 * @returns Auth context values (user, token, isAuthenticated, etc.)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

export default useAuth;
