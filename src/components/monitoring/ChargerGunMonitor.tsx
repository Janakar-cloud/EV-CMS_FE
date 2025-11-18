'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChargerGunMetrics,
  GunStatus,
  PowerModuleStatus,
  EfficiencyLevel,
  ChargingCommand
} from '@/types/gun-monitoring';
import { gunMonitoringService } from '@/lib/gun-monitoring-service';
import { formatDateTime } from '@/lib/time-utils';
import {
  BoltIcon,
  FireIcon,
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface ChargerGunMonitorProps {
  gunId: string;
  showControls?: boolean;
  onCommandExecuted?: (success: boolean, message: string) => void;
}

export const ChargerGunMonitor: React.FC<ChargerGunMonitorProps> = ({
  gunId,
  showControls = false,
  onCommandExecuted
}) => {
  const [gunMetrics, setGunMetrics] = useState<ChargerGunMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingCommand, setExecutingCommand] = useState(false);

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
    
    const interval = setInterval(() => loadGunMetrics(false), 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [loadGunMetrics]);

  const executeCommand = async (command: ChargingCommand) => {
    if (!gunMetrics) return;

    try {
      setExecutingCommand(true);
      const response = await gunMonitoringService.executeCommand(command);
      
      if (response.success) {
        onCommandExecuted?.(true, response.message || 'Command executed successfully');
        await loadGunMetrics(); // Refresh metrics
      } else {
        onCommandExecuted?.(false, response.error || 'Command failed');
      }
    } catch (err) {
      onCommandExecuted?.(false, 'Failed to execute command');
    } finally {
      setExecutingCommand(false);
    }
  };

  const getStatusColor = (status: GunStatus): string => {
    switch (status) {
      case 'charging':
        return 'text-blue-600 bg-blue-100';
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'fault':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'idle':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPowerModuleStatusColor = (status: PowerModuleStatus): string => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'fault':
        return 'text-red-600 bg-red-100';
      case 'offline':
        return 'text-gray-600 bg-gray-100';
      case 'overheating':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEfficiencyColor = (level: EfficiencyLevel): string => {
    switch (level) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'average':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (minutes?: number): string => {
    if (!minutes || minutes <= 0) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatPower = (watts: number): string => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(1)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gunMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Gun Metrics</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => loadGunMetrics(true)}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Gun {gunMetrics.gunId}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>Charger: {gunMetrics.chargerId}</span>
              <span>â€¢</span>
              <span>Station: {gunMetrics.stationId}</span>
              <span>â€¢</span>
              <span>Connector: {gunMetrics.connectorId}</span>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(gunMetrics.status)}`}>
              {gunMetrics.status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPowerModuleStatusColor(gunMetrics.powerModuleStatus)}`}>
              {gunMetrics.powerModuleStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alert Section */}
        {gunMetrics.alerts.filter(alert => !alert.acknowledged).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Active Alerts</h3>
            </div>
            <div className="space-y-2">
              {gunMetrics.alerts.filter(alert => !alert.acknowledged).map(alert => (
                <div key={alert.id} className="text-sm text-red-700">
                  <span className="font-medium">{alert.severity.toUpperCase()}:</span> {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Power Metrics */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <BoltIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Power Metrics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Current Charging</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPower(gunMetrics.powerMetrics.currentChargingWatts)}
                </div>
                <div className="text-xs text-gray-500">
                  {gunMetrics.powerMetrics.chargingRatePercentage.toFixed(1)}% of capacity
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Max Capacity</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPower(gunMetrics.powerMetrics.maxOutputCapacity)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Voltage</div>
                <div className="text-xl font-semibold text-gray-900">
                  {gunMetrics.powerMetrics.voltage.toFixed(0)} V
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Current</div>
                <div className="text-xl font-semibold text-gray-900">
                  {gunMetrics.powerMetrics.current.toFixed(1)} A
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Input Power</div>
                <div className="text-lg font-semibold text-gray-700">
                  {formatPower(gunMetrics.powerMetrics.inputPowerWatts)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Power Factor</div>
                <div className="text-lg font-semibold text-gray-700">
                  {gunMetrics.powerMetrics.powerFactor.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          {/* Thermal & Efficiency */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <FireIcon className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Thermal & Efficiency</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Power Module Temp</div>
                <div className="text-2xl font-bold text-orange-600">
                  {gunMetrics.thermalMetrics.powerModuleTemp.toFixed(1)}Â°C
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Heat Load</div>
                <div className="text-2xl font-bold text-red-600">
                  {gunMetrics.thermalMetrics.heatLoadPercentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Charging Efficiency</div>
                <div className="text-xl font-semibold text-green-600">
                  {(gunMetrics.efficiencyMetrics.chargingEfficiency * 100).toFixed(1)}%
                </div>
                <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getEfficiencyColor(gunMetrics.efficiencyMetrics.efficiencyLevel)}`}>
                  {gunMetrics.efficiencyMetrics.efficiencyLevel}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Energy Loss</div>
                <div className="text-xl font-semibold text-gray-700">
                  {formatPower(gunMetrics.efficiencyMetrics.energyLoss)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Connector Temp</div>
                <div className="text-lg font-semibold text-blue-600">
                  {gunMetrics.thermalMetrics.connectorTemp.toFixed(1)}Â°C
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Cooling Status</div>
                <div className="text-lg font-semibold text-gray-700 capitalize">
                  {gunMetrics.thermalMetrics.coolingSystemStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Charging Session */}
        {gunMetrics.activeSession && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Active Charging Session</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Vehicle</div>
                <div className="font-semibold text-gray-900">
                  {gunMetrics.activeSession.vehicleId || 'Unknown'}
                </div>
                {gunMetrics.activeSession.currentBatteryLevel && (
                  <div className="text-sm text-gray-500">
                    Battery: {gunMetrics.activeSession.currentBatteryLevel}% â†’ {gunMetrics.activeSession.targetBatteryLevel}%
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Energy Delivered</div>
                <div className="font-semibold text-gray-900">
                  {gunMetrics.activeSession.energyDelivered.toFixed(1)} kWh
                </div>
                <div className="text-sm text-gray-500">
                  Progress: {gunMetrics.estimates.chargingProgress.toFixed(1)}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Session Cost</div>
                <div className="font-semibold text-gray-900">
                  â‚¹{gunMetrics.activeSession.currentSessionCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Rate: â‚¹{gunMetrics.activeSession.costPerKwh}/kWh
                </div>
              </div>
            </div>

            {/* Time Estimates */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Time to Target</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatTime(gunMetrics.estimates.timeToTargetLevel)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Time to Full</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {formatTime(gunMetrics.estimates.timeToFullCharge)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Remaining Energy</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {gunMetrics.estimates.remainingEnergyNeeded?.toFixed(1) || '0'} kWh
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Estimated Cost</div>
                  <div className="text-lg font-semibold text-gray-700">
                    â‚¹{gunMetrics.estimates.estimatedCostToComplete?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Charging Progress</span>
                  <span>{gunMetrics.estimates.chargingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, gunMetrics.estimates.chargingProgress)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {showControls && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              {gunMetrics.status === 'available' && (
                <button
                  onClick={() => executeCommand({ command: 'start', gunId })}
                  disabled={executingCommand}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Charging
                </button>
              )}
              
              {gunMetrics.status === 'charging' && (
                <>
                  <button
                    onClick={() => executeCommand({ command: 'stop', gunId })}
                    disabled={executingCommand}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <StopIcon className="h-4 w-4 mr-2" />
                    Stop Charging
                  </button>
                  
                  <button
                    onClick={() => executeCommand({ 
                      command: 'setLimit', 
                      gunId, 
                      parameters: { powerLimit: 25 } 
                    })}
                    disabled={executingCommand}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Set Power Limit
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          Last updated: {formatDateTime(gunMetrics.lastUpdated)}
        </div>
      </div>
    </div>
  );
};

export default ChargerGunMonitor;
