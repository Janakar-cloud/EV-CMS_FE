'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { chargerService } from '@/lib/charger-service';
import { Charger } from '@/types/charger';

// Demo chargers for testing
const DEMO_CHARGERS: Charger[] = [
  {
    id: 'demo_1',
    chargerId: 'CH-DELHI-001',
    stationId: 'station_delhi_01',
    name: 'Delhi Downtown Charger 1',
    description: 'Fast charging station',
    type: 'DC',
    manufacturer: 'Tesla',
    model: 'Supercharger',
    serialNumber: 'SN001',
    firmwareVersion: '1.0.0',
    maxPower: 150,
    connectors: [],
    status: 'available',
    location: {
      address: '123 Main St, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      latitude: 28.6139,
      longitude: 77.209,
    },
    installationDate: new Date('2024-01-01'),
    totalEnergyDelivered: 1000,
    totalSessions: 50,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'admin',
  },
  {
    id: 'demo_2',
    chargerId: 'CH-MUMBAI-001',
    stationId: 'station_mumbai_01',
    name: 'Mumbai Highway Charger',
    description: 'Highway charging station',
    type: 'AC',
    manufacturer: 'ABB',
    model: 'Terra AC',
    serialNumber: 'SN002',
    firmwareVersion: '2.0.0',
    maxPower: 50,
    connectors: [],
    status: 'occupied',
    location: {
      address: '456 Highway Rd, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      latitude: 19.076,
      longitude: 72.8777,
    },
    installationDate: new Date('2024-02-01'),
    totalEnergyDelivered: 500,
    totalSessions: 30,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'admin',
  },
  {
    id: 'demo_3',
    chargerId: 'CH-BANGALORE-001',
    stationId: 'station_bangalore_01',
    name: 'Bangalore Tech Park',
    description: 'Tech park charging station',
    type: 'DC',
    manufacturer: 'Siemens',
    model: 'eMobility',
    serialNumber: 'SN003',
    firmwareVersion: '1.5.0',
    maxPower: 100,
    connectors: [],
    status: 'offline',
    location: {
      address: '789 Tech Park, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    installationDate: new Date('2024-03-01'),
    totalEnergyDelivered: 200,
    totalSessions: 15,
    isActive: false,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'admin',
  },
];

export function DashboardChargerMap() {
  const [chargers, setChargers] = useState<Charger[]>(DEMO_CHARGERS);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const onCenterChanged = useCallback(() => {
    if (mapRef) {
      const center = mapRef.getCenter();
      if (center) {
        setMapCenter({ lat: center.lat(), lng: center.lng() });
      }
    }
  }, [mapRef]);

  const onZoomChanged = useCallback(() => {
    if (mapRef) {
      const zoom = mapRef.getZoom();
      if (zoom !== undefined) {
        setMapZoom(zoom);
      }
    }
  }, [mapRef]);

  useEffect(() => {
    // Load chargers from API
    loadChargers();

    // Check if API key is available
    if (process.env.GOOGLE_MAPS_API_KEY) {
      setApiKeyReady(true);
    } else {
      console.warn('Google Maps API key not configured. Using demo chargers.');
      setApiKeyReady(false);
    }
  }, []);

  const loadChargers = async () => {
    try {
      const response = await chargerService.getAllChargers();
      if (response.success && response.chargers && response.chargers.length > 0) {
        setChargers(response.chargers);
      } else {
        console.log('No chargers from API, using demo chargers');
        setChargers(DEMO_CHARGERS);
      }
    } catch (error) {
      console.error('Error loading chargers:', error);
      setChargers(DEMO_CHARGERS);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (charger: Charger): string => {
    switch (charger.status) {
      case 'available':
        return '#10B981'; // Green
      case 'occupied':
        return '#F59E0B'; // Amber
      case 'offline':
        return '#EF4444'; // Red
      case 'maintenance':
        return '#3B82F6'; // Blue
      case 'faulted':
        return '#DC2626'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'available':
        return 'A';
      case 'occupied':
        return 'O';
      case 'offline':
        return 'X';
      case 'maintenance':
        return 'M';
      case 'faulted':
        return 'F';
      default:
        return '?';
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Live Charger Map
            </p>
            <p className="text-xs text-slate-500">All charger locations in real-time</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/80 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Live
          </span>
        </div>
        <div className="flex h-96 animate-pulse items-center justify-center rounded-2xl bg-slate-800">
          <span className="text-slate-400">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Live Charger Map
          </p>
          <p className="text-xs text-slate-500">All charger locations in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">
            {chargers.length} charger{chargers.length !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/80 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Live
          </span>
        </div>
      </div>

      {chargers.length === 0 ? (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
          No chargers available
        </div>
      ) : (
        <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={onMapLoad}
            onCenterChanged={onCenterChanged}
            onZoomChanged={onZoomChanged}
            options={{
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: false,
              styles: [
                {
                  featureType: 'all',
                  elementType: 'all',
                  stylers: [{ saturation: -100 }],
                },
                {
                  featureType: 'water',
                  elementType: 'all',
                  stylers: [{ color: '#1a1a2e' }],
                },
                {
                  featureType: 'landscape',
                  elementType: 'all',
                  stylers: [{ color: '#0f1419' }],
                },
              ],
            }}
          >
            {chargers.map(charger => (
              <Marker
                key={charger.id}
                position={{
                  lat: charger.location?.latitude || 0,
                  lng: charger.location?.longitude || 0,
                }}
                title={charger.name}
                icon={{
                  url: `data:image/svg+xml;base64,${btoa(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="${getMarkerColor(charger)}" stroke="white" stroke-width="2"/>
                      <text x="16" y="20" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${getStatusIcon(charger.status)}</text>
                    </svg>
                  `)}`,
                  scaledSize: { width: 32, height: 32, equals: () => true } as any,
                }}
                onClick={() => setSelectedCharger(charger)}
              />
            ))}

            {selectedCharger && (
              <InfoWindow
                position={{
                  lat: selectedCharger.location?.latitude || 0,
                  lng: selectedCharger.location?.longitude || 0,
                }}
                onCloseClick={() => setSelectedCharger(null)}
              >
                <div className="max-w-xs rounded bg-white p-3">
                  <h3 className="mb-2 text-sm font-bold text-slate-900">{selectedCharger.name}</h3>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <strong>Power:</strong> {selectedCharger.maxPower} kW
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedCharger.type}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className="font-semibold capitalize">{selectedCharger.status}</span>
                    </p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
          <span>Offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
}
