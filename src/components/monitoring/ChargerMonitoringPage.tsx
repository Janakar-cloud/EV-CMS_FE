'use client';

import React, { useState } from 'react';
import { ChargerGunMonitor } from '@/components/monitoring/ChargerGunMonitor';
import { GunMonitoringDashboard } from '@/components/monitoring/GunMonitoringDashboard';
import { ChargerGunAnalytics } from '@/components/monitoring/ChargerGunAnalytics';
import { 
  PowerUsageTrends,
  EfficiencyAnalysis,
  TemperatureMonitoring,
  SessionAnalytics
} from '@/components/monitoring/GunMonitoringCharts';
import {
  BoltIcon,
  CpuChipIcon,
  ChartBarIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

type MonitoringView = 'dashboard' | 'individual' | 'analytics';

interface ChargerMonitoringPageProps {
  chargerId?: string;
  stationId?: string;
}

export const ChargerMonitoringPage: React.FC<ChargerMonitoringPageProps> = ({
  chargerId,
  stationId
}) => {
  const [activeView, setActiveView] = useState<MonitoringView>('dashboard');
  const [selectedGun, setSelectedGun] = useState<string | null>(null);

  const handleGunSelected = (gunId: string) => {
    setSelectedGun(gunId);
    setActiveView('analytics');
    };

  const views = [
    {
      id: 'dashboard' as const,
      name: 'Gun Dashboard',
      icon: ListBulletIcon,
      description: 'Overview of all charging guns with real-time metrics'
    },
    {
      id: 'individual' as const,
      name: 'Individual Gun',
      icon: BoltIcon,
      description: 'Detailed monitoring of a specific charging gun'
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      icon: ChartBarIcon,
      description: 'Performance analytics and historical data'
    }
  ];

  const handleCommandExecuted = (success: boolean, message: string) => {
    console.log(`Command ${success ? 'succeeded' : 'failed'}: ${message}`);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <GunMonitoringDashboard 
            chargerId={chargerId}
          />
        );
      
      case 'individual':
        if (!selectedGun) {
          return (
            <div className="text-center py-12">
              <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Gun</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a specific charging gun to monitor in detail.
              </p>
              
              <div className="mt-6">
                <label htmlFor="gun-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Gun ID
                </label>
                <input
                  id="gun-select"
                  type="text"
                  placeholder="Enter gun ID (e.g., GUN-001)"
                  className="max-w-xs mx-auto block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        setSelectedGun(input.value.trim());
                      }
                    }
                  }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Press Enter to monitor the specified gun
                </p>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setSelectedGun(null)}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                ← Change gun selection
              </button>
            </div>
            <ChargerGunMonitor
              gunId={selectedGun}
              showControls={true}
              onCommandExecuted={handleCommandExecuted}
            />
          </div>
        );

      case 'analytics':
        if (!selectedGun) {
          return (
            <div className="space-y-6">
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Gun for Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a charging gun from the dashboard to view detailed analytics and charts.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600">Gun ID: {selectedGun}</p>
              </div>
              <button
                onClick={() => setSelectedGun(null)}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                ← Change gun selection
              </button>
            </div>

            {/* Real-time charts with gun metrics */}
            <ChargerGunAnalytics gunId={selectedGun} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {chargerId 
              ? `Charger ${chargerId} Monitoring` 
              : stationId 
                ? `Station ${stationId} Gun Monitoring`
                : 'Charging Gun Monitoring'
            }
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of charging gun status, power metrics, efficiency, heat load, and charging estimates
          </p>
        </div>

        {/* View Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {views.map((view) => {
                const Icon = view.icon;
                const isActive = activeView === view.id;
                
                return (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${
                      isActive 
                        ? 'text-blue-500' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {view.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* View Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {views.find(v => v.id === activeView)?.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ChargerMonitoringPage;
