import React from 'react';
import { Vehicle } from '@/types';

export interface VehicleWithOwner extends Vehicle {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

interface VehicleListProps {
  vehicles: VehicleWithOwner[];
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles }) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No vehicles found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 backdrop-blur-sm rounded-lg overflow-hidden hover:border-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
        >
          {/* Vehicle Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 border-b border-emerald-500 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-sm text-emerald-100">{vehicle.nickname || 'No nickname'}</p>
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded text-xs font-bold text-white">
                {vehicle.year}
              </span>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="p-4 space-y-3">
            {/* Registration */}
            <div className="flex items-center justify-between py-2 border-b border-slate-600">
              <span className="text-sm font-semibold text-slate-200">Registration:</span>
              <span className="font-mono text-sm font-bold text-emerald-300">{vehicle.registrationNumber}</span>
            </div>

            {/* Battery */}
            <div className="flex items-center justify-between py-2 border-b border-slate-600">
              <span className="text-sm font-semibold text-slate-200">Battery:</span>
              <span className="text-sm font-bold text-emerald-300">{vehicle.batteryCapacity} kWh</span>
            </div>

            {/* Connectors */}
            <div className="flex items-center justify-between py-2 border-b border-slate-600">
              <span className="text-sm font-semibold text-slate-200">Connectors:</span>
              <div className="flex gap-2">
                {vehicle.connectorTypes?.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-xs font-bold text-cyan-300"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-slate-600/50 border border-slate-500 rounded p-3 mt-4">
              <p className="text-xs font-semibold text-slate-300 mb-2">Owner Information</p>
              <p className="text-sm font-bold text-white">{vehicle.ownerName}</p>
              <p className="text-xs text-slate-300">{vehicle.ownerEmail}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-700/50 border-t border-slate-600 p-4 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded transition-colors">
              View
            </button>
            <button className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold rounded transition-colors">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleList;
