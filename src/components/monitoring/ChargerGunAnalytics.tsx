'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChargerGunMetrics } from '@/types/gun-monitoring';
import { gunMonitoringService } from '@/lib/gun-monitoring-service';
import {
  PowerUsageTrends,
  EfficiencyAnalysis,
  TemperatureMonitoring,
  SessionAnalytics
} from './GunMonitoringCharts';

interface ChargerGunAnalyticsProps {
  gunId: string;
}

export const ChargerGunAnalytics: React.FC<ChargerGunAnalyticsProps> = ({ gunId }) => {
  const [gunMetrics, setGunMetrics] = useState<ChargerGunMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGunMetrics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await gunMonitoringService.getGunMetrics(gunId);
      if (response.success && response.metrics) {
        setGunMetrics(response.metrics);
        setError(null);
      } else {
        setError(response.error || 'Failed to load gun metrics');
      }
    } catch (err) {
      setError('Failed to load gun metrics');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [gunId]);

  useEffect(() => {
    loadGunMetrics(true);
    
    const interval = setInterval(() => loadGunMetrics(false), 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [loadGunMetrics]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-red-400">Error loading analytics data</div>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => loadGunMetrics(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gunMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Power Usage Trends</h4>
        <PowerUsageTrends gunMetrics={gunMetrics} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Efficiency Analysis</h4>
        <EfficiencyAnalysis gunMetrics={gunMetrics} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Temperature Monitoring</h4>
        <TemperatureMonitoring gunMetrics={gunMetrics} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Session Analytics</h4>
        <SessionAnalytics gunMetrics={gunMetrics} />
      </div>
    </div>
  );
};
