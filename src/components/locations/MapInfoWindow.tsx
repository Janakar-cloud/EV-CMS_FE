import React, { useEffect, useRef } from 'react';
import { Charger } from '@/types';

interface MapInfoWindowProps {
  map: google.maps.Map;
  charger: Charger;
  onClose: () => void;
}

const MapInfoWindow: React.FC<MapInfoWindowProps> = ({ map, charger, onClose }) => {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!infoWindowRef.current) {
      const content = createInfoWindowContent(charger);

      const infoWindow = new google.maps.InfoWindow({
        content,
        position: {
          lat: charger.location.latitude,
          lng: charger.location.longitude,
        },
        maxWidth: 320,
      });

      infoWindow.open(map);
      infoWindowRef.current = infoWindow;

      infoWindow.addListener('closeclick', onClose);
    }

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, [map, charger, onClose]);

  const createInfoWindowContent = (charger: Charger) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'available': return 'text-green-600 bg-green-100';
        case 'occupied': return 'text-yellow-600 bg-yellow-100';
        case 'fault': return 'text-red-600 bg-red-100';
        case 'offline': return 'text-gray-600 bg-gray-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const getConnectorIcon = (type: string) => {
      switch (type) {
        case 'CCS2': return '⚡';
        case 'CHAdeMO': return 'ðŸ”Œ';
        case 'Type2': return 'ðŸ”Œ';
        default: return 'ðŸ”Œ';
      }
    };

    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900 text-lg">${charger.name}</h3>
            <p class="text-sm text-gray-600">${charger.location.address}</p>
            <p class="text-xs text-gray-500">${charger.location.city}, ${charger.location.state}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}">
            ${charger.status.charAt(0).toUpperCase() + charger.status.slice(1)}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500">Power</p>
            <p class="font-semibold">${charger.power} kW</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Utilization</p>
            <p class="font-semibold">${charger.utilization}%</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Uptime</p>
            <p class="font-semibold">${charger.uptime}%</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Temperature</p>
            <p class="font-semibold">${charger.temperature || 'N/A'}°C</p>
          </div>
        </div>

        <div class="border-t pt-3">
          <h4 class="font-medium text-gray-900 mb-2">Gun Status</h4>
          <div class="space-y-2">
            ${charger.connectors.map(connector => `
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div class="flex items-center space-x-2">
                  <span class="text-lg">${getConnectorIcon(connector.type)}</span>
                  <div>
                    <p class="text-sm font-medium">${connector.type}</p>
                    <p class="text-xs text-gray-500">${connector.power} kW</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connector.status)}">
                  ${connector.status.charAt(0).toUpperCase() + connector.status.slice(1)}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        ${charger.maintenance.alerts.length > 0 ? `
          <div class="border-t pt-3 mt-3">
            <h4 class="font-medium text-red-600 mb-2">⚠️ Active Alerts</h4>
            <div class="space-y-1">
              ${charger.maintenance.alerts.map(alert => `
                <p class="text-xs text-red-600">${alert.message}</p>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="border-t pt-3 mt-3">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p class="text-gray-500">Last Seen</p>
              <p class="font-medium">${new Date(charger.lastSeen).toLocaleString()}</p>
            </div>
            <div>
              <p class="text-gray-500">Network</p>
              <p class="font-medium ${charger.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}">
                ${charger.networkStatus.charAt(0).toUpperCase() + charger.networkStatus.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div class="flex space-x-2 mt-4">
          <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
            View Details
          </button>
          <button class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
            Remote Control
          </button>
        </div>
      </div>
    `;
  };

  return null; // This component doesn't render anything directly
};

export default MapInfoWindow;
