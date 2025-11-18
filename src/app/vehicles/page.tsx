'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import VehicleList from '@/components/vehicles/VehicleList';
import { mockVehicles } from '@/components/vehicles/VehicleList';

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [makeFilter, setMakeFilter] = useState('all');
  const [connectorFilter, setConnectorFilter] = useState('all');

  const uniqueMakes = Array.from(new Set(mockVehicles.map((v: any) => v.make))).sort();
  const uniqueConnectors = Array.from(new Set(mockVehicles.flatMap((v: any) => v.connectorTypes))).sort();

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = searchQuery === '' ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;
    const matchesConnector = connectorFilter === 'all' || vehicle.connectorTypes.includes(connectorFilter as any);

    return matchesSearch && matchesMake && matchesConnector;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h1>
            <p className="text-gray-600">Manage and monitor customer electric vehicles</p>
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
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{mockVehicles.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Battery</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(mockVehicles.reduce((sum, v) => sum + v.batteryCapacity, 0) / mockVehicles.length)}kWh
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">DC Fast Charge</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockVehicles.filter(v => v.connectorTypes.includes('CCS2') || v.connectorTypes.includes('CHAdeMO')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AC Charge Only</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockVehicles.filter(v => !v.connectorTypes.includes('CCS2') && !v.connectorTypes.includes('CHAdeMO')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Search:</label>
              <input
                type="text"
                placeholder="Search by make, model, owner..."
                className="form-input text-sm flex-1 sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Make:</label>
              <select
                className="form-select text-sm flex-1 sm:w-auto"
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
              >
                <option value="all">All Makes</option>
                {uniqueMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Connector:</label>
              <select
                className="form-select text-sm flex-1 sm:w-auto"
                value={connectorFilter}
                onChange={(e) => setConnectorFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {uniqueConnectors.map(connector => (
                  <option key={connector} value={connector}>{connector}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button className="btn btn-sm btn-outline w-full sm:w-auto">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Advanced Filters
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="card p-0 overflow-hidden">
          <VehicleList vehicles={filteredVehicles} />
        </div>

        {/* Summary */}
        <div className="text-sm text-gray-600 text-center">
          Showing {filteredVehicles.length} of {mockVehicles.length} vehicles
        </div>
      </div>
    </Layout>
  );
}
