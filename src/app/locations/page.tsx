'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import LocationMap from '@/components/locations/LocationMap';
import chargerService from '@/lib/charger-service';
import { Charger } from '@/types/charger';

export default function LocationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [powerTypeFilter, setPowerTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChargers = async () => {
      try {
        const response = await chargerService.getAllChargers();
        setChargers(response.chargers);
      } catch (error) {
        console.error('Failed to load chargers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChargers();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Location Map</h1>
            <p className="text-slate-400">
              Interactive map showing all EV charger locations with real-time gun status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 transition-colors hover:bg-slate-700">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Data
            </button>
            <button className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-lg shadow-emerald-900/50 transition-colors hover:bg-emerald-500">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Location
            </button>
          </div>
        </div>

        {/* Map Filters */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex w-full items-center space-x-2 sm:w-auto">
              <label className="whitespace-nowrap text-sm font-medium text-slate-300">
                Status:
              </label>
              <select
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="fault">Fault</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="flex w-full items-center space-x-2 sm:w-auto">
              <label className="whitespace-nowrap text-sm font-medium text-slate-300">
                Power Type:
              </label>
              <select
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto"
                value={powerTypeFilter}
                onChange={e => setPowerTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="ac">AC Charging</option>
                <option value="dc">DC Fast Charging</option>
              </select>
            </div>

            <div className="flex w-full items-center space-x-2 sm:w-auto">
              <label className="whitespace-nowrap text-sm font-medium text-slate-300">
                Location:
              </label>
              <input
                type="text"
                placeholder="Search locations..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-48"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex w-full items-center space-x-2 sm:w-auto">
              <label className="whitespace-nowrap text-sm font-medium text-slate-300">
                Map Style:
              </label>
              <select className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto">
                <option value="roadmap">Road Map</option>
                <option value="satellite">Satellite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <button className="inline-flex w-full items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-700 sm:w-auto">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Near Me
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-800 bg-emerald-950/50">
                  <svg
                    className="h-4 w-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Available</p>
                <p className="text-2xl font-bold text-slate-100">
                  {loading ? '...' : chargers.filter(c => c.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-800 bg-blue-950/50">
                  <svg
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Occupied</p>
                <p className="text-2xl font-bold text-slate-100">
                  {loading ? '...' : chargers.filter(c => c.status === 'occupied').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-800 bg-red-950/50">
                  <svg
                    className="h-4 w-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Fault</p>
                <p className="text-2xl font-bold text-slate-100">
                  {loading ? '...' : chargers.filter(c => c.status === 'faulted').length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Offline</p>
                <p className="text-2xl font-bold text-slate-100">
                  {loading ? '...' : chargers.filter(c => c.status === 'offline').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="relative h-[600px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-400"></div>
                  <p className="text-slate-400">Loading chargers...</p>
                </div>
              </div>
            ) : (
              <LocationMap
                statusFilter={statusFilter}
                powerTypeFilter={powerTypeFilter}
                searchQuery={searchQuery}
                chargers={chargers}
              />
            )}

            {/* Map Legend */}
            <div className="absolute right-4 top-4 z-10 max-w-xs rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm sm:p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-100">Charger Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full border-2 border-emerald-300 bg-emerald-500 shadow-sm sm:h-4 sm:w-4"></div>
                  <span className="text-xs text-slate-300 sm:text-sm">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full border-2 border-blue-300 bg-blue-500 shadow-sm sm:h-4 sm:w-4"></div>
                  <span className="text-xs text-slate-300 sm:text-sm">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full border-2 border-red-300 bg-red-500 shadow-sm sm:h-4 sm:w-4"></div>
                  <span className="text-xs text-slate-300 sm:text-sm">Fault</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full border-2 border-slate-300 bg-slate-400 shadow-sm sm:h-4 sm:w-4"></div>
                  <span className="text-xs text-slate-300 sm:text-sm">Offline</span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-700 pt-3">
                <h4 className="mb-2 text-sm font-semibold text-slate-100">Power Types</h4>
                <div className="grid grid-cols-2 gap-1">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded bg-yellow-400 sm:h-3 sm:w-3"></div>
                    <span className="text-xs text-slate-400">AC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded bg-purple-500 sm:h-3 sm:w-3"></div>
                    <span className="text-xs text-slate-400">DC Fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-medium text-slate-100">Map Legend</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-300">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-slate-300">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-300">Fault</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-slate-400"></div>
              <span className="text-sm text-slate-300">Offline</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-300">
            Click on any charger location to view detailed gun status and information.
          </div>
        </div>
      </div>
    </Layout>
  );
}
