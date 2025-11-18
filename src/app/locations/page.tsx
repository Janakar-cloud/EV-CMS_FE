'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import LocationMap from '@/components/locations/LocationMap';
import { mockChargers } from '@/components/locations/LocationMap';

export default function LocationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [powerTypeFilter, setPowerTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Location Map</h1>
            <p className="text-gray-600">Interactive map showing all EV charger locations with real-time gun status</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn btn-outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <button className="btn btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Location
            </button>
          </div>
        </div>

        {/* Map Filters */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
              <select
                className="form-select text-sm flex-1 sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="fault">Fault</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Power Type:</label>
              <select
                className="form-select text-sm flex-1 sm:w-auto"
                value={powerTypeFilter}
                onChange={(e) => setPowerTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="ac">AC Charging</option>
                <option value="dc">DC Fast Charging</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Location:</label>
              <input
                type="text"
                placeholder="Search locations..."
                className="form-input text-sm flex-1 sm:w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Map Style:</label>
              <select className="form-select text-sm flex-1 sm:w-auto">
                <option value="roadmap">Road Map</option>
                <option value="satellite">Satellite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <button className="btn btn-sm btn-outline w-full sm:w-auto">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Near Me
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockChargers.filter(c => c.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockChargers.filter(c => c.status === 'occupied').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fault</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockChargers.filter(c => c.status === 'fault').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockChargers.filter(c => c.status === 'offline').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="card p-0 overflow-hidden">
          <div className="h-[600px] w-full relative">
            <LocationMap
              statusFilter={statusFilter}
              powerTypeFilter={powerTypeFilter}
              searchQuery={searchQuery}
            />

            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 sm:p-4 z-10 max-w-xs">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Charger Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Fault</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400 border-2 border-white shadow-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Offline</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Power Types</h4>
                <div className="grid grid-cols-2 gap-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-yellow-400"></div>
                    <span className="text-xs text-gray-600">AC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-purple-500"></div>
                    <span className="text-xs text-gray-600">DC Fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Map Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Fault</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Offline</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Click on any charger location to view detailed gun status and information.
          </div>
        </div>
      </div>
    </Layout>
  );
}
