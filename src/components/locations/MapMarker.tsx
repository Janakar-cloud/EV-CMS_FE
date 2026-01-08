import React, { useEffect, useRef } from 'react';
import type { Charger } from '@/types/charger';

interface MapMarkerProps {
  map: google.maps.Map;
  charger: Charger;
  onClick: () => void;
  isSelected: boolean;
}

const MapMarker: React.FC<MapMarkerProps> = ({ map, charger, onClick, isSelected }) => {
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!markerRef.current) {
      const getMarkerIcon = (charger: Charger) => {
        const isDC = charger.connectors.some(c => c.type === 'CCS2' || c.type === 'CHAdeMO');
        const baseSize = isDC ? 40 : 32; // DC chargers are larger markers

        let color = '#10B981'; // green for available
        if (charger.status === 'occupied')
          color = '#F59E0B'; // yellow
        else if (charger.status === 'faulted')
          color = '#EF4444'; // red
        else if (charger.status === 'offline') color = '#6B7280'; // gray

        const svg = `
          <svg width="${baseSize}" height="${baseSize}" viewBox="0 0 ${baseSize} ${baseSize}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${baseSize / 2}" cy="${baseSize / 2}" r="${baseSize / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="${baseSize / 2}" y="${baseSize / 2 + 1}" text-anchor="middle" fill="white" font-size="${baseSize / 3}" font-weight="bold">
              ${isDC ? '⚡' : '🔌'}
            </text>
          </svg>
        `;

        return {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(baseSize, baseSize),
          anchor: new google.maps.Point(baseSize / 2, baseSize),
        };
      };

      const lat = charger.location.latitude;
      const lng = charger.location.longitude;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        icon: getMarkerIcon(charger),
        title: `${charger.name} - ${charger.status}`,
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
      });

      marker.addListener('click', onClick);
      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [map, charger, onClick]);

  useEffect(() => {
    if (markerRef.current && isSelected) {
      markerRef.current.setAnimation(google.maps.Animation.BOUNCE);
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.setAnimation(null);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else if (markerRef.current) {
      markerRef.current.setAnimation(null);
    }
  }, [isSelected]);

  return null; // This component doesn't render anything directly
};

export default MapMarker;
