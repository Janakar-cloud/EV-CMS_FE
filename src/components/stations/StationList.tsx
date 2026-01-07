'use client';

import React, { useState, useEffect, useCallback } from 'react';
import stationService, { Station, StationFilters } from '@/lib/station-service';

export default function StationList() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StationFilters>({ page: 1, limit: 10 });
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  const loadStations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stationService.listStations(filters);
      setStations(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    
    try {
      await stationService.deleteStation(id);
      loadStations();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStation(null);
    loadStations();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Station Inventory</h2>
          <p className="text-slate-300 mt-1">Manage and monitor all charging stations</p>
        </div>
        <button
          onClick={() => {
            setEditingStation(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
        >
          {showForm ? 'Cancel' : '+ Add Station'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <StationForm 
          station={editingStation}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-300">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No stations found</div>
        ) : (
          stations.map((station, index) => (
            <div key={station.id || `station-${index}`} className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 p-6 rounded-lg hover:border-slate-500 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{station.name}</h3>
                  <p className="text-slate-300 mt-1">
                    {station.address || 'No address'}
                    {station.city ? `, ${station.city}` : ''}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-700/50 p-3 rounded">
                      <p className="text-slate-400">Available Chargers</p>
                      <p className="text-emerald-400 font-bold text-lg">{station.availableChargers || 0}/{station.totalChargers || 0}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded">
                      <p className="text-slate-400">Operating Hours</p>
                      <p className="text-slate-200 font-semibold">{station.operatingHours?.open || 'N/A'} - {station.operatingHours?.close || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => handleEdit(station)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(station.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface StationFormProps {
  station?: Station | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function StationForm({ station, onSuccess, onCancel }: StationFormProps) {
  const isEditing = !!station;
  
  const buildFormState = (station?: Station | null) => ({
    name: station?.name || '',
    address: station?.address || '',
    city: station?.city || '',
    state: station?.state || '',
    postalCode: station?.postalCode || '',
    country: station?.country || 'India',
    coordinates: {
      latitude: station?.coordinates?.latitude || 11.0168,
      longitude: station?.coordinates?.longitude || 76.9558
    },
    amenities: station?.amenities || [] as string[],
    contactNumber: station?.contactNumber || '',
    operatingHours: {
      open: station?.operatingHours?.open || '06:00',
      close: station?.operatingHours?.close || '22:00'
    },
  });

  const [formData, setFormData] = useState(buildFormState(station));
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(buildFormState(station));
  }, [station]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setValidationError('Station name is required');
      return false;
    }
    if (!formData.address.trim()) {
      setValidationError('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      setValidationError('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      setValidationError('State is required');
      return false;
    }
    if (!formData.postalCode.trim()) {
      setValidationError('Postal code is required');
      return false;
    }
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      setValidationError('Contact number must be 10 digits');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && station?.id) {
        // Only send fields that can be updated, exclude readonly fields
        const updateData = {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          coordinates: formData.coordinates,
          amenities: formData.amenities,
          contactNumber: formData.contactNumber,
          operatingHours: formData.operatingHours,
        };
        await stationService.updateStation(station.id, updateData);
      } else {
        // For create, send all fields
        await stationService.createStation(formData as any);
      }
      onSuccess();
    } catch (err) {
      setValidationError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl text-white">
          {isEditing ? 'Edit Station' : 'Add New Station'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {validationError && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded text-sm">
          {validationError}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Station Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Address *"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="City *"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="State *"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Postal Code *"
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          placeholder="Contact Number (10 digits)"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.coordinates.latitude || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) || 0 }
            })}
            className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.coordinates.longitude || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) || 0 }
            })}
            className="bg-white text-slate-900 placeholder-slate-400 border border-slate-400 p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <input
          type="time"
          placeholder="Opening Time"
          value={formData.operatingHours.open}
          onChange={(e) => setFormData({ 
            ...formData, 
            operatingHours: { ...formData.operatingHours, open: e.target.value }
          })}
          className="bg-white text-slate-900 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="time"
          placeholder="Closing Time"
          value={formData.operatingHours.close}
          onChange={(e) => setFormData({ 
            ...formData, 
            operatingHours: { ...formData.operatingHours, close: e.target.value }
          })}
          className="bg-white text-slate-900 border border-slate-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="mt-6 flex gap-2 pt-4 border-t border-slate-600">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition disabled:opacity-50"
        >
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Station' : 'Create Station')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-medium transition"
        >
          Cancel
        </button>
        <span className="text-sm text-slate-400 self-center">* Required fields</span>
      </div>
    </form>
  );
}
