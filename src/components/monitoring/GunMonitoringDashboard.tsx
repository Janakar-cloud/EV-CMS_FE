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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface GunMonitoringDashboardProps {
  chargerId?: string;
}

export const GunMonitoringDashboard: React.FC<GunMonitoringDashboardProps> = ({ chargerId }) => {
  const [gunMetrics, setGunMetrics] = useState<ChargerGunMetrics[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<ChargerGunMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGun, setSelectedGun] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GunMonitoringFilters>({});

  const loadGunMetrics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      let response;
      
      if (chargerId) {
        response = await gunMonitoringService.getChargerGunMetrics(chargerId);
      } else {
        response = await gunMonitoringService.getAllGunMetrics();
      }
      
      if (response.success) {
        setGunMetrics(response.metrics);
        setError(null);
      } else {
        setError('Failed to load gun metrics');
      }
    } catch (err) {
      setError('Failed to load gun metrics');
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Gun Metrics</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => loadGunMetrics(true)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const powerStats = getPowerStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {chargerId ? `Charger ${chargerId} Gun Monitoring` : 'Live Gun Monitoring'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Real-time monitoring of charging gun status, power metrics, efficiency, and heat load
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">{powerStats.activeSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CpuChipIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Power</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {powerStats.totalCurrentPower.toFixed(1)} kW
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FireIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Utilization</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {powerStats.utilizationPercentage.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {statusStats.withAlerts > 0 ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusStats.withAlerts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status?.[0] || ''}
            onChange={(e) => setFilters({
              ...filters,
              status: e.target.value ? [e.target.value as GunStatus] : undefined
            })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Guns</option>
            <option value="true">Active Sessions</option>
            <option value="false">No Active Sessions</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || Object.keys(filters).length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredMetrics.length} of {gunMetrics.length} charging guns
      </div>

      {/* Gun Details View */}
      {selectedGun ? (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setSelectedGun(null)}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              â† Back to gun list
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMetrics.map((gun) => (
            <div
              key={gun.gunId}
              onClick={() => setSelectedGun(gun.gunId)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Gun {gun.gunId}</h3>
                  <div className="text-sm text-gray-500">
                    {gun.chargerId} â€¢ {gun.stationId}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    gun.status === 'charging' ? 'bg-blue-100 text-blue-800' :
                    gun.status === 'available' ? 'bg-green-100 text-green-800' :
                    gun.status === 'fault' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {gun.status}
                  </span>
                  
                  {gun.alerts.filter(alert => !alert.acknowledged).length > 0 && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Current Power</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {(gun.powerMetrics.currentChargingWatts / 1000).toFixed(1)} kW
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Efficiency</div>
                  <div className="text-lg font-semibold text-green-600">
                    {(gun.efficiencyMetrics.chargingEfficiency * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Temperature</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {gun.thermalMetrics.powerModuleTemp.toFixed(1)}Â°C
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Heat Load</div>
                  <div className="text-lg font-semibold text-red-600">
                    {gun.thermalMetrics.heatLoadPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {gun.activeSession && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Active Session</div>
                  <div className="text-sm font-medium">
                    {gun.activeSession.vehicleId} â€¢ {gun.activeSession.energyDelivered.toFixed(1)} kWh
                  </div>
                  <div className="text-xs text-gray-500">
                    ETA: {gun.estimates.estimatedTimeToComplete ? 
                      `${Math.floor(gun.estimates.estimatedTimeToComplete / 60)}h ${gun.estimates.estimatedTimeToComplete % 60}m` : 
                      'N/A'
                    }
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                Click to view detailed monitoring
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMetrics.length === 0 && (
        <div className="text-center py-12">
          <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No guns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {gunMetrics.length === 0 
              ? 'No charging guns are currently available.'
              : 'No guns match the current filters.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default GunMonitoringDashboard;
