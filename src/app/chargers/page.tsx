'use client';

import React, { useState } from 'react';
import { Charger } from '@/types/charger';
import { AddChargerForm } from '@/components/chargers/AddChargerForm';
import { ChargerList } from '@/components/chargers/ChargerList';

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
                className="text-blue-600 hover:text-blue-500"
              >
                Chargers
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Add New Charger</span>
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
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Edit Charger</span>
            </nav>
            {selectedCharger && (
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit {selectedCharger.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Charger ID: {selectedCharger.chargerId} â€¢ Station ID: {selectedCharger.stationId}
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
    <div className="min-h-screen bg-gray-50">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Edit Functionality Coming Soon</h3>
              <p className="mt-1 text-sm text-gray-500">
                Charger editing capabilities will be implemented in the next phase.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
