'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChargerGunMetrics,
  GunStatus,
  PowerModuleStatus,
  EfficiencyLevel,
  GunMonitoringFilters
} from '@/types/gun-monitoring';
import { gunMonitoringService } from '@/lib/gun-monitoring-service';
import { ChargerGunMonitor } from './ChargerGunMonitor';
import {
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FireIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

interface GunMonitoringDashboardProps {
  chargerId?: string;
}

export const GunMonitoringDashboard: React.FC<GunMonitoringDashboardProps> = ({ chargerId }) => {
  const [gunMetrics, setGunMetrics] = useState<ChargerGunMetrics[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<ChargerGunMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [selectedGun, setSelectedGun] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GunMonitoringFilters>({});

  const loadGunMetrics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Try to fetch from real API first
      let response;
      try {
        if (chargerId) {
          response = await gunMonitoringService.getChargerGunMetrics(chargerId);
        } else {
          response = await gunMonitoringService.getAllGunMetrics();
        }
        
        if (response.success && response.metrics && response.metrics.length > 0) {
          // Check if this is real data (has _id or came from API)
          const isRealData = response.metrics.some((m: any) => m._id || m.fromApi);
          setBackendConnected(isRealData);
          setGunMetrics(isRealData ? response.metrics : []);
          setError(null);
        } else {
          // No data from backend
          setBackendConnected(false);
          setGunMetrics([]);
          setError(null);
        }
      } catch (apiError) {
        // Backend not available - show empty state, not demo data
        setBackendConnected(false);
        setGunMetrics([]);
        setError(null);
      }
    } catch (err) {
      setBackendConnected(false);
      setGunMetrics([]);
      setError(null);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [chargerId]);

  const applyFilters = useCallback(() => {
    let filtered = [...gunMetrics];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(gun =>
        gun.gunId.toLowerCase().includes(query) ||
        gun.chargerId.toLowerCase().includes(query) ||
        gun.stationId.toLowerCase().includes(query) ||
        gun.connectorId.toLowerCase().includes(query) ||
        (gun.activeSession?.vehicleId?.toLowerCase().includes(query))
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(gun => filters.status!.includes(gun.status));
    }

    if (filters.powerModuleStatus && filters.powerModuleStatus.length > 0) {
      filtered = filtered.filter(gun => filters.powerModuleStatus!.includes(gun.powerModuleStatus));
    }

    if (filters.efficiencyLevel && filters.efficiencyLevel.length > 0) {
      filtered = filtered.filter(gun => filters.efficiencyLevel!.includes(gun.efficiencyMetrics.efficiencyLevel));
    }

    if (filters.minPower !== undefined) {
      filtered = filtered.filter(gun => gun.powerMetrics.currentChargingWatts / 1000 >= filters.minPower!);
    }

    if (filters.maxPower !== undefined) {
      filtered = filtered.filter(gun => gun.powerMetrics.currentChargingWatts / 1000 <= filters.maxPower!);
    }

    if (filters.hasActiveSession !== undefined) {
      filtered = filtered.filter(gun => 
        filters.hasActiveSession ? !!gun.activeSession : !gun.activeSession
      );
    }

    if (filters.hasAlerts !== undefined) {
      filtered = filtered.filter(gun => 
        filters.hasAlerts ? gun.alerts.length > 0 : gun.alerts.length === 0
      );
    }

    setFilteredMetrics(filtered);
  }, [gunMetrics, searchQuery, filters]);

  useEffect(() => {
    loadGunMetrics(true);
    const interval = setInterval(() => loadGunMetrics(false), 10000); 
    return () => clearInterval(interval);
  }, [loadGunMetrics]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getStatusStats = () => {
    const stats = gunMetrics.reduce((acc, gun) => {
      acc[gun.status] = (acc[gun.status] || 0) + 1;
      return acc;
    }, {} as Record<GunStatus, number>);

    return {
      total: gunMetrics.length,
      charging: stats.charging || 0,
      available: stats.available || 0,
      fault: stats.fault || 0,
      maintenance: stats.maintenance || 0,
      withAlerts: gunMetrics.filter(gun => gun.alerts.some(alert => !alert.acknowledged)).length,
      avgEfficiency: gunMetrics.length > 0 ? 
        gunMetrics.reduce((sum, gun) => sum + gun.efficiencyMetrics.chargingEfficiency, 0) / gunMetrics.length : 0
    };
  };

  const getPowerStats = () => {
    const chargingGuns = gunMetrics.filter(gun => gun.status === 'charging');
    const totalCurrentPower = chargingGuns.reduce((sum, gun) => sum + gun.powerMetrics.currentChargingWatts, 0);
    const totalCapacity = gunMetrics.reduce((sum, gun) => sum + gun.powerMetrics.maxOutputCapacity, 0);
    
    return {
      totalCurrentPower: totalCurrentPower / 1000, 
      totalCapacity: totalCapacity / 1000,
      utilizationPercentage: totalCapacity > 0 ? (totalCurrentPower / totalCapacity) * 100 : 0,
      activeSessions: chargingGuns.length
    };
  };

  const handleCommandExecuted = (success: boolean, message: string) => {
    if (success) {
      setTimeout(loadGunMetrics, 1000);
    }
    console.log(`Command ${success ? 'succeeded' : 'failed'}: ${message}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when backend is not connected
  if (!backendConnected || gunMetrics.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            {chargerId ? `Charger ${chargerId} Gun Monitoring` : 'Live Gun Monitoring'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Real-time monitoring of charging gun status, power metrics, efficiency, and heat load
          </p>
        </div>

        {/* Empty Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <div className="flex items-center">
              <BoltIcon className="h-6 w-6 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Active Sessions</p>
                <p className="text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <div className="flex items-center">
              <CpuChipIcon className="h-6 w-6 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Power</p>
                <p className="text-2xl font-semibold text-white">0.0 kW</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <div className="flex items-center">
              <FireIcon className="h-6 w-6 text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Utilization</p>
                <p className="text-2xl font-semibold text-white">0.0%</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Active Alerts</p>
                <p className="text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <ServerIcon className="mx-auto h-16 w-16 text-slate-500" />
          <h3 className="mt-4 text-lg font-medium text-white">No Charger Data Available</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {backendConnected 
              ? 'No charging guns are currently registered in the system.'
              : 'Unable to connect to the backend server. Please ensure the backend service is running.'}
          </p>
          <button
            onClick={() => loadGunMetrics(true)}
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-white">Error Loading Gun Metrics</h3>
        <p className="mt-1 text-sm text-slate-400">{error}</p>
        <button
          onClick={() => loadGunMetrics(true)}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const powerStats = getPowerStats();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {chargerId ? `Charger ${chargerId} Gun Monitoring` : 'Live Gun Monitoring'}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Real-time monitoring of charging gun status, power metrics, efficiency, and heat load
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center">
            <BoltIcon className="h-6 w-6 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Active Sessions</p>
              <p className="text-2xl font-semibold text-white">{powerStats.activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center">
            <CpuChipIcon className="h-6 w-6 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Power</p>
              <p className="text-2xl font-semibold text-white">{powerStats.totalCurrentPower.toFixed(1)} kW</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center">
            <FireIcon className="h-6 w-6 text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Utilization</p>
              <p className="text-2xl font-semibold text-white">{powerStats.utilizationPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center">
            {statusStats.withAlerts > 0 ? (
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            )}
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Active Alerts</p>
              <p className="text-2xl font-semibold text-white">{statusStats.withAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status?.[0] || ''}
            onChange={(e) => setFilters({
              ...filters,
              status: e.target.value ? [e.target.value as GunStatus] : undefined
            })}
            className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="charging">Charging</option>
            <option value="available">Available</option>
            <option value="fault">Fault</option>
            <option value="maintenance">Maintenance</option>
            <option value="idle">Idle</option>
          </select>

          {/* Power Module Status Filter */}
          <select
            value={filters.powerModuleStatus?.[0] || ''}
            onChange={(e) => setFilters({
              ...filters,
              powerModuleStatus: e.target.value ? [e.target.value as PowerModuleStatus] : undefined
            })}
            className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Power Modules</option>
            <option value="operational">Operational</option>
            <option value="degraded">Degraded</option>
            <option value="fault">Fault</option>
            <option value="offline">Offline</option>
            <option value="overheating">Overheating</option>
          </select>

          {/* Efficiency Filter */}
          <select
            value={filters.efficiencyLevel?.[0] || ''}
            onChange={(e) => setFilters({
              ...filters,
              efficiencyLevel: e.target.value ? [e.target.value as EfficiencyLevel] : undefined
            })}
            className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Efficiency</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
            <option value="critical">Critical</option>
          </select>

          {/* Active Sessions Filter */}
          <select
            value={filters.hasActiveSession === undefined ? '' : filters.hasActiveSession.toString()}
            onChange={(e) => setFilters({
              ...filters,
              hasActiveSession: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Guns</option>
            <option value="true">Active Sessions</option>
            <option value="false">No Active Sessions</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || Object.keys(filters).length > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        Showing {filteredMetrics.length} of {gunMetrics.length} charging guns
      </div>

      {/* Gun Details View */}
      {selectedGun ? (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setSelectedGun(null)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <span>←</span> Back to gun list
            </button>
          </div>
          <ChargerGunMonitor
            gunId={selectedGun}
            showControls={true}
            onCommandExecuted={handleCommandExecuted}
          />
        </div>
      ) : (
        /* Gun Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMetrics.map((gun) => (
            <div
              key={gun.gunId}
              onClick={() => setSelectedGun(gun.gunId)}
              className="bg-slate-800 rounded-lg border border-slate-700 p-5 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Gun {gun.gunId}</h3>
                  <p className="text-sm text-slate-400">
                    {gun.chargerId} • {gun.stationId}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    gun.status === 'charging' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    gun.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    gun.status === 'fault' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-slate-600/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    {gun.status}
                  </span>
                  
                  {gun.alerts.filter(alert => !alert.acknowledged).length > 0 && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-400">Current Power</p>
                  <p className="text-xl font-semibold text-blue-400">
                    {(gun.powerMetrics.currentChargingWatts / 1000).toFixed(1)} kW
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Efficiency</p>
                  <p className="text-xl font-semibold text-green-400">
                    {(gun.efficiencyMetrics.chargingEfficiency * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Temperature</p>
                  <p className="text-xl font-semibold text-orange-400">
                    {gun.thermalMetrics.powerModuleTemp.toFixed(1)}°C
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Heat Load</p>
                  <p className="text-xl font-semibold text-red-400">
                    {gun.thermalMetrics.heatLoadPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {gun.activeSession && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">Active Session</p>
                  <p className="text-sm font-medium text-white">
                    {gun.activeSession.vehicleId} • {gun.activeSession.energyDelivered.toFixed(1)} kWh
                  </p>
                  <p className="text-xs text-slate-500">
                    ETA: {gun.estimates.estimatedTimeToComplete ? 
                      `${Math.floor(gun.estimates.estimatedTimeToComplete / 60)}h ${gun.estimates.estimatedTimeToComplete % 60}m` : 
                      'N/A'
                    }
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-500">
                Click to view detailed monitoring
              </p>
            </div>
          ))}
        </div>
      )}

      {filteredMetrics.length === 0 && gunMetrics.length > 0 && (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <BoltIcon className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-2 text-sm font-medium text-white">No guns match filters</h3>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default GunMonitoringDashboard;
