'use client';

import React, { useState } from 'react';
import { Charger, CreateChargerRequest } from '@/types/charger';
import { AddChargerForm } from '@/components/chargers/AddChargerForm';
import { ChargerList } from '@/components/chargers/ChargerList';
import { chargerService } from '@/lib/charger-service';

type View = 'list' | 'add' | 'edit';

export default function ChargersPage() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddCharger = () => {
    setCurrentView('add');
    setSelectedCharger(null);
  };

  const handleEditCharger = (charger: Charger) => {
    setSelectedCharger(charger);
    setCurrentView('edit');
  };

  const handleChargerAdded = (charger: Charger) => {
    console.log('Charger added:', charger);
    setCurrentView('list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedCharger(null);
  };

  const renderHeader = () => {
    switch (currentView) {
      case 'add':
        return (
          <div className="mb-6">
            <nav className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => setCurrentView('list')}
                className="text-emerald-500 hover:text-emerald-400"
              >
                Chargers
              </button>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">Add New Charger</span>
            </nav>
          </div>
        );
      case 'edit':
        return (
          <div className="mb-6">
            <nav className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => setCurrentView('list')}
                className="text-blue-600 hover:text-blue-500"
              >
                Chargers
              </button>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">Edit Charger</span>
            </nav>
            {selectedCharger && (
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-white">
                  Edit {selectedCharger.name}
                </h1>
                <p className="text-sm text-slate-300">
                  Charger ID: {selectedCharger.chargerId} • Station ID: {selectedCharger.stationId}
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderHeader()}

        {currentView === 'list' && (
          <ChargerList
            key={refreshTrigger}
            onAddCharger={handleAddCharger}
            onEditCharger={handleEditCharger}
          />
        )}

        {currentView === 'add' && (
          <AddChargerForm
            onSuccess={handleChargerAdded}
            onCancel={handleCancel}
          />
        )}

        {currentView === 'edit' && selectedCharger && (
          <EditChargerForm
            charger={selectedCharger}
            onSuccess={(charger) => {
              console.log('Charger updated:', charger);
              setCurrentView('list');
              setRefreshTrigger(prev => prev + 1);
            }}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

// Edit Charger Form Component
function EditChargerForm({
  charger,
  onSuccess,
  onCancel,
}: {
  charger: Charger;
  onSuccess: (charger: Charger) => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateChargerRequest>>({
    chargerId: charger.chargerId,
    stationId: charger.stationId,
    name: charger.name,
    description: charger.description || '',
    type: charger.type,
    manufacturer: charger.manufacturer,
    model: charger.model,
    serialNumber: charger.serialNumber,
    maxPower: charger.maxPower,
    location: {
      address: charger.location.address,
      city: charger.location.city,
      state: charger.location.state,
      zipCode: charger.location.zipCode,
      country: charger.location.country,
      latitude: charger.location.latitude,
      longitude: charger.location.longitude,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await chargerService.updateCharger(charger.id, formData);
      if (result.success && result.charger) {
        onSuccess(result.charger);
      } else {
        setError(result.errors?.[0]?.message || 'Failed to update charger');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Edit Charger</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Charger ID</label>
            <input
              type="text"
              value={formData.chargerId || ''}
              onChange={(e) => setFormData({ ...formData, chargerId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
              disabled
            />
            <p className="text-xs text-slate-400 mt-1">Charger ID cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Station ID</label>
            <input
              type="text"
              value={formData.stationId || ''}
              onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
            <select
              value={formData.type || 'AC'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'AC' | 'DC' })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
        </div>

        {/* Hardware Info */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Hardware Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Max Power (kW)</label>
            <input
              type="number"
              value={formData.maxPower || 0}
              onChange={(e) => setFormData({ ...formData, maxPower: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg max-w-xs"
            />
          </div>
        </div>

        {/* Location Info */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Location</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={formData.location?.address || ''}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, address: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.location?.city || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, city: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={formData.location?.state || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, state: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.location?.zipCode || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, zipCode: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.location?.country || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, country: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-100 hover:bg-slate-700/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
