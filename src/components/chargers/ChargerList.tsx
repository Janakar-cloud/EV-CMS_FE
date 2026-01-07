import React, { useState, useEffect, useCallback } from 'react';
import {
  Charger,
  ChargerStatus,
  ChargerType,
  ChargerFilters,
  ChargerStats
} from '@/types/charger';
import { chargerService } from '@/lib/charger-service';

interface ChargerListProps {
  onEditCharger?: (charger: Charger) => void;
  onAddCharger?: () => void;
}

export const ChargerList: React.FC<ChargerListProps> = ({ onEditCharger, onAddCharger }) => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [filteredChargers, setFilteredChargers] = useState<Charger[]>([]);
  const [stats, setStats] = useState<ChargerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChargerStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<ChargerType[]>([]);
  const [locationFilter, setLocationFilter] = useState('');

  const loadChargers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chargerService.getAllChargers();
      if (response.success) {
        setChargers(response.chargers);
      } else {
        setError('Failed to load chargers');
      }
    } catch (err) {
      setError('Failed to load chargers');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await chargerService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = chargers;
    if (searchQuery) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter.length > 0) {
      filtered = filtered.filter(c => statusFilter.includes(c.status));
    }
    if (typeFilter.length > 0) {
      filtered = filtered.filter(c => typeFilter.includes(c.type));
    }
    if (locationFilter) {
      filtered = filtered.filter(c => c.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    }
    setFilteredChargers(filtered);
  }, [chargers, searchQuery, statusFilter, typeFilter, locationFilter]);

  useEffect(() => {
    loadChargers();
    loadStats();
  }, [loadChargers, loadStats]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleStatusChange = async (chargerId: string, newStatus: ChargerStatus) => {
    try {
      const response = await chargerService.updateChargerStatus(chargerId, newStatus);
      if (response.success) {
        setChargers(prev => prev.map(charger =>
          charger.id === chargerId ? { ...charger, status: newStatus } : charger
        ));
        loadStats();
      } else {
        setError('Failed to update charger status');
      }
    } catch (err) {
      setError('Failed to update charger status');
    }
  };

  const getStatusColor = (status: ChargerStatus): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'faulted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: ChargerType): string => {
    switch (type) {
      case 'AC':
        return 'bg-blue-100 text-blue-800';
      case 'DC_FAST':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions: { value: ChargerStatus; label: string }[] = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' },
    { value: 'faulted', label: 'Faulted' }
  ];

  const typeOptions: { value: ChargerType; label: string }[] = [
    { value: 'AC', label: 'AC' },
    { value: 'DC_FAST', label: 'DC Fast' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading chargers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">{error}</div>
        <button
          onClick={loadChargers}
          className="mt-2 text-sm text-red-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Chargers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalChargers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.availableChargers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Occupied</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.occupiedChargers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalSessions.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Charger Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage all charging stations with unique charger IDs and station IDs
          </p>
        </div>
        {onAddCharger && (
          <button
            onClick={onAddCharger}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Charger
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by ID, name, manufacturer..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              multiple
              value={statusFilter}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value as ChargerStatus);
                setStatusFilter(values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              multiple
              value={typeFilter}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value as ChargerType);
                setTypeFilter(values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="locationFilter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, address..."
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || statusFilter.length > 0 || typeFilter.length > 0 || locationFilter) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter([]);
                setTypeFilter([]);
                setLocationFilter('');
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
        Showing {filteredChargers.length} of {chargers.length} chargers
      </div>

      {/* Charger List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredChargers.map((charger) => (
            <li key={charger.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Charger IDs and Name */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-900 truncate">
                          {charger.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-medium">
                            Charger ID: <span className="text-gray-900">{charger.chargerId}</span>
                          </span>
                          <span className="font-medium">
                            Station ID: <span className="text-gray-900">{charger.stationId}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Status and Type Badges */}
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                          {charger.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(charger.type)}`}>
                          {charger.type}
                        </span>
                      </div>
                    </div>

                    {/* Charger Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Manufacturer & Model</p>
                        <p className="font-medium">{charger.manufacturer} {charger.model}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Max Power</p>
                        <p className="font-medium">{charger.maxPower} kW</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Connectors</p>
                        <p className="font-medium">{charger.connectors.length} connector{charger.connectors.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mt-2 text-sm">
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">
                        {charger.location.address}, {charger.location.city}, {charger.location.state} {charger.location.zipCode}
                      </p>
                    </div>

                    {/* Statistics */}
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Energy</p>
                        <p className="font-medium">{charger.totalEnergyDelivered.toLocaleString()} kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Sessions</p>
                        <p className="font-medium">{charger.totalSessions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Installation Date</p>
                        <p className="font-medium">{new Date(charger.installationDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-6 flex-shrink-0 flex flex-col items-end space-y-2">
                    {/* Gun Monitoring Link */}
                    <a
                      href={`/monitoring?chargerId=${charger.chargerId}`}
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-500 font-medium"
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Gun Monitoring
                    </a>

                    {/* Status Change */}
                    <select
                      value={charger.status}
                      onChange={(e) => handleStatusChange(charger.id, e.target.value as ChargerStatus)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Edit Button */}
                    {onEditCharger && (
                      <button
                        onClick={() => onEditCharger(charger)}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                </div>

                {/* Connectors Details */}
                {charger.connectors.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Connectors:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {charger.connectors.map((connector, index) => (
                        <div key={connector.id} className="text-sm border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{connector.type}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              connector.status === 'available' ? 'bg-green-100 text-green-800' :
                              connector.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                              connector.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {connector.status}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">{connector.maxPower} kW max</p>
                          {connector.currentPower && (
                            <p className="text-gray-500">Current: {connector.currentPower} kW</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {filteredChargers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chargers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {chargers.length === 0 
                ? 'Get started by adding your first charger.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            {onAddCharger && chargers.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={onAddCharger}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add New Charger
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
