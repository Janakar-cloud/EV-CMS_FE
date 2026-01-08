'use client';

import React, { useState, useEffect, useCallback } from 'react';
import stationService, { StationFilters } from '@/lib/station-service';
import type { Station } from '@/types/station';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Station Inventory</h2>
          <p className="mt-1 text-slate-300">Manage and monitor all charging stations</p>
        </div>
        <button
          onClick={() => {
            setEditingStation(null);
            setShowForm(!showForm);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
        >
          {showForm ? 'Cancel' : '+ Add Station'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4 text-red-300">
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
          <div className="py-12 text-center text-slate-300">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No stations found</div>
        ) : (
          stations.map((station, index) => (
            <div
              key={station.id || `station-${index}`}
              className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-6 transition hover:border-slate-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{station.name}</h3>
                  <p className="mt-1 text-slate-300">
                    {station.address || 'No address'}
                    {station.city ? `, ${station.city}` : ''}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded bg-slate-700/50 p-3">
                      <p className="text-slate-400">Available Connectors</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {station.connectors?.filter(c => c.status === 'available').length || 0}/
                        {station.connectors?.length || 0}
                      </p>
                    </div>
                    <div className="rounded bg-slate-700/50 p-3">
                      <p className="text-slate-400">Operating Hours</p>
                      <p className="font-semibold text-slate-200">
                        {station.operatingHours?.open || 'N/A'} -{' '}
                        {station.operatingHours?.close || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(station)}
                    className="rounded bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(station.id)}
                    className="rounded bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-700"
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
    pincode: station?.pincode || '',
    location: {
      type: 'Point' as const,
      coordinates: station?.location?.coordinates || ([76.9558, 11.0168] as [number, number]),
    },
    amenities: station?.amenities || ([] as string[]),
    operatingHours: {
      open: station?.operatingHours?.open || '06:00',
      close: station?.operatingHours?.close || '22:00',
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
    if (!formData.pincode.trim()) {
      setValidationError('Pincode is required');
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
          pincode: formData.pincode,
          location: formData.location,
          amenities: formData.amenities,
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
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {isEditing ? 'Edit Station' : 'Add New Station'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 transition hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {validationError && (
        <div className="mb-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-300">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Station Name *"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Address *"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="City *"
          value={formData.city}
          onChange={e => setFormData({ ...formData, city: e.target.value })}
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="State *"
          value={formData.state}
          onChange={e => setFormData({ ...formData, state: e.target.value })}
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Pincode *"
          value={formData.pincode}
          onChange={e => setFormData({ ...formData, pincode: e.target.value })}
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.location.coordinates[1] || ''}
            onChange={e =>
              setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  coordinates: [formData.location.coordinates[0], parseFloat(e.target.value) || 0],
                },
              })
            }
            className="flex-1 rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.location.coordinates[0] || ''}
            onChange={e =>
              setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  coordinates: [parseFloat(e.target.value) || 0, formData.location.coordinates[1]],
                },
              })
            }
            className="flex-1 rounded border border-slate-400 bg-white p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <input
          type="time"
          placeholder="Opening Time"
          value={formData.operatingHours.open}
          onChange={e =>
            setFormData({
              ...formData,
              operatingHours: { ...formData.operatingHours, open: e.target.value },
            })
          }
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="time"
          placeholder="Closing Time"
          value={formData.operatingHours.close}
          onChange={e =>
            setFormData({
              ...formData,
              operatingHours: { ...formData.operatingHours, close: e.target.value },
            })
          }
          className="rounded border border-slate-400 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="mt-6 flex gap-2 border-t border-slate-600 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
              ? 'Update Station'
              : 'Create Station'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-slate-600 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          Cancel
        </button>
        <span className="self-center text-sm text-slate-400">* Required fields</span>
      </div>
    </form>
  );
}
