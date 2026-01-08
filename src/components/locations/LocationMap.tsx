import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import type { Charger } from '@/types/charger';
import MapMarker from './MapMarker';
import MapInfoWindow from './MapInfoWindow';

// Mock data removed - LocationMap component should receive chargers as props

interface LocationMapProps {
  className?: string;
  statusFilter?: string;
  powerTypeFilter?: string;
  searchQuery?: string;
  chargers?: Charger[]; // Accept chargers as props from parent
}

const LocationMap: React.FC<LocationMapProps> = ({
  className = '',
  statusFilter = 'all',
  powerTypeFilter = 'all',
  searchQuery = '',
  chargers = [], // Default to empty array
}) => {
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('LocationMap: API Key present:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    console.log('LocationMap: API Key value:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  const filteredChargers = React.useMemo(() => {
    return chargers.filter(charger => {
      if (statusFilter !== 'all' && charger.status !== statusFilter) {
        return false;
      }

      if (powerTypeFilter !== 'all') {
        const hasMatchingConnector = charger.connectors.some(connector => {
          if (powerTypeFilter === 'ac') {
            return connector.type === 'Type2';
          } else if (powerTypeFilter === 'dc') {
            return connector.type === 'CCS2' || connector.type === 'CHAdeMO';
          }
          return false;
        });
        if (!hasMatchingConnector) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = charger.name.toLowerCase().includes(query);
        const matchesAddress = charger.location.address.toLowerCase().includes(query);
        const matchesCity = charger.location.city.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [chargers, statusFilter, powerTypeFilter, searchQuery]);

  const onMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);

      const bounds = new google.maps.LatLngBounds();
      filteredChargers.forEach(charger => {
        const lat = charger.location.latitude;
        const lng = charger.location.longitude;
        if (typeof lat === 'number' && typeof lng === 'number') {
          bounds.extend({ lat, lng });
        }
      });

      if (filteredChargers.length === 0) {
        mapInstance.setCenter({ lat: 12.9716, lng: 77.5946 });
        mapInstance.setZoom(12);
      } else {
        mapInstance.fitBounds(bounds);
      }

      const listener = google.maps.event.addListener(mapInstance, 'idle', () => {
        if (filteredChargers.length > 1) {
          mapInstance.fitBounds(bounds);
          google.maps.event.removeListener(listener);
        }
      });
    },
    [filteredChargers]
  );

  const handleMarkerClick = useCallback((charger: Charger) => {
    setSelectedCharger(charger);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedCharger(null);
  }, []);

  const renderMap = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading map...</span>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="flex h-full flex-col">
            <div className="flex h-1/2 items-center justify-center">
              <div className="p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Map failed to load</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
                    ? 'Google Maps API key is not configured. Please add a valid API key to your .env.local file.'
                    : 'Please check your internet connection and try again.'}
                </p>
                {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ===
                    'YOUR_GOOGLE_MAPS_API_KEY_HERE') && (
                  <div className="mt-4 text-left">
                    <p className="mb-2 text-xs text-gray-600">To get a Google Maps API key:</p>
                    <ol className="list-inside list-decimal space-y-1 text-xs text-gray-600">
                      <li>
                        Go to{' '}
                        <a
                          href="https://console.cloud.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Google Cloud Console
                        </a>
                      </li>
                      <li>Create a new project or select existing one</li>
                      <li>Enable the &quot;Maps JavaScript API&quot;</li>
                      <li>Create credentials (API Key)</li>
                      <li>
                        Add the key to your .env.local file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Fallback: Show charger data in table format */}
            <div className="h-1/2 overflow-auto border-t border-gray-200">
              <div className="p-4">
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Charger Locations (Table View)
                </h4>
                <div className="space-y-2">
                  {filteredChargers.map(charger => (
                    <div key={charger.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{charger.name}</h5>
                          <p className="text-xs text-gray-600">
                            {charger.location.address}, {charger.location.city}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              charger.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : charger.status === 'occupied'
                                  ? 'bg-blue-100 text-blue-800'
                                  : charger.status === 'faulted'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {charger.status}
                          </span>
                          <span className="text-xs text-gray-500">{charger.maxPower}kW</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                        <span>
                          Available:{' '}
                          {charger.connectors.filter(c => c.status === 'available').length}
                        </span>
                        <span>
                          Occupied: {charger.connectors.filter(c => c.status === 'occupied').length}
                        </span>
                        <span>
                          Faulted: {charger.connectors.filter(c => c.status === 'faulted').length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case Status.SUCCESS:
        return (
          <GoogleMap
            onLoad={onMapLoad}
            chargers={filteredChargers}
            onMarkerClick={handleMarkerClick}
            selectedCharger={selectedCharger}
            onInfoWindowClose={handleInfoWindowClose}
          />
        );
    }
  };

  return (
    <div className={`h-full w-full ${className}`}>
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? (
        <div className="flex h-full flex-col">
          <div className="flex h-1/2 items-center justify-center bg-gray-100">
            <div className="p-6 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">Development Mode</h3>
              <p className="mb-4 text-sm text-gray-600">
                Google Maps API key not configured. Showing charger data in table format.
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
                <h4 className="mb-2 text-sm font-medium text-blue-900">
                  To enable interactive map:
                </h4>
                <ol className="list-inside list-decimal space-y-1 text-xs text-blue-800">
                  <li>
                    Get API key from{' '}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-600"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Enable &quot;Maps JavaScript API&quot;</li>
                  <li>Update NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Charger table view */}
          <div className="h-1/2 overflow-auto border-t border-gray-200">
            <div className="p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-900">Charger Locations</h4>
              <div className="space-y-2">
                {filteredChargers.map(charger => (
                  <div
                    key={charger.id}
                    className="rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{charger.name}</h5>
                        <p className="text-xs text-gray-600">
                          {charger.location.address}, {charger.location.city}
                        </p>
                        <p className="text-xs text-gray-500">
                          Lat: {charger.location.latitude?.toFixed(4) ?? 'N/A'}, Lng:{' '}
                          {charger.location.longitude?.toFixed(4) ?? 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              charger.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : charger.status === 'occupied'
                                  ? 'bg-blue-100 text-blue-800'
                                  : charger.status === 'faulted'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {charger.status}
                          </span>
                          <p className="mt-1 text-xs text-gray-500">{charger.maxPower}kW</p>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>
                            Available:{' '}
                            {charger.connectors.filter(c => c.status === 'available').length}
                          </div>
                          <div>
                            Occupied:{' '}
                            {charger.connectors.filter(c => c.status === 'occupied').length}
                          </div>
                          <div>
                            Faulted: {charger.connectors.filter(c => c.status === 'faulted').length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Wrapper
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={['places', 'geometry']}
          render={renderMap}
          callback={status => {
            console.log('Google Maps API Status:', status);
            if (status === Status.FAILURE) {
              console.error('Google Maps failed to load. Check API key and network connection.');
            }
          }}
        />
      )}
    </div>
  );
};

interface GoogleMapProps {
  onLoad: (map: google.maps.Map) => void;
  chargers: Charger[];
  onMarkerClick: (charger: Charger) => void;
  selectedCharger: Charger | null;
  onInfoWindowClose: () => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLoad,
  chargers,
  onMarkerClick,
  selectedCharger,
  onInfoWindowClose,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 12.9716, lng: 77.5946 }, // Bangalore center
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      };

      const mapInstance = new google.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);
      onLoad(mapInstance);
    }
  }, [map, onLoad]);

  return (
    <div ref={mapRef} className="h-full w-full">
      {map &&
        chargers.map(charger => (
          <MapMarker
            key={charger.id}
            map={map}
            charger={charger}
            onClick={() => onMarkerClick(charger)}
            isSelected={selectedCharger?.id === charger.id}
          />
        ))}
      {map && selectedCharger && (
        <MapInfoWindow map={map} charger={selectedCharger} onClose={onInfoWindowClose} />
      )}
    </div>
  );
};

export default LocationMap;
