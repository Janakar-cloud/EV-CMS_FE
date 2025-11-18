import React from 'react';
import { Vehicle } from '@/types';


export interface VehicleWithOwner extends Vehicle {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

export const mockVehicles: VehicleWithOwner[] = [
  {
    id: 'v1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    batteryCapacity: 75,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA01AB1234',
    nickname: 'My Tesla',
    ownerId: 'u1',
    ownerName: 'Rajesh Kumar',
    ownerEmail: 'rajesh.kumar@email.com',
  },
  {
    id: 'v2',
    make: 'Tata',
    model: 'Nexon EV',
    year: 2024,
    batteryCapacity: 40,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA02CD5678',
    nickname: 'Family Car',
    ownerId: 'u2',
    ownerName: 'Priya Sharma',
    ownerEmail: 'priya.sharma@email.com',
  },
  {
    id: 'v3',
    make: 'Mahindra',
    model: 'XUV400',
    year: 2023,
    batteryCapacity: 39,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA03EF9012',
    ownerId: 'u3',
    ownerName: 'Amit Patel',
    ownerEmail: 'amit.patel@email.com',
  },
  {
    id: 'v4',
    make: 'Hyundai',
    model: 'Kona Electric',
    year: 2024,
    batteryCapacity: 67,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA04GH3456',
    nickname: 'Work Vehicle',
    ownerId: 'u4',
    ownerName: 'Sneha Reddy',
    ownerEmail: 'sneha.reddy@email.com',
  },
  {
    id: 'v5',
    make: 'MG',
    model: 'ZS EV',
    year: 2023,
    batteryCapacity: 50,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA05IJ7890',
    ownerId: 'u5',
    ownerName: 'Vikram Singh',
    ownerEmail: 'vikram.singh@email.com',
  },
  {
    id: 'v6',
    make: 'BYD',
    model: 'Atto 3',
    year: 2024,
    batteryCapacity: 60,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA06KL1234',
    nickname: 'City Cruiser',
    ownerId: 'u6',
    ownerName: 'Anjali Gupta',
    ownerEmail: 'anjali.gupta@email.com',
  },
  {
    id: 'v7',
    make: 'Kia',
    model: 'EV6',
    year: 2023,
    batteryCapacity: 77,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA07MN5678',
    ownerId: 'u7',
    ownerName: 'Rohit Verma',
    ownerEmail: 'rohit.verma@email.com',
  },
  {
    id: 'v8',
    make: 'Toyota',
    model: 'bZ4X',
    year: 2024,
    batteryCapacity: 71,
    connectorTypes: ['CHAdeMO'],
    registrationNumber: 'KA08OP9012',
    nickname: 'Adventure EV',
    ownerId: 'u8',
    ownerName: 'Meera Joshi',
    ownerEmail: 'meera.joshi@email.com',
  },
  {
    id: 'v9',
    make: 'Audi',
    model: 'Q4 e-tron',
    year: 2023,
    batteryCapacity: 82,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA09QR3456',
    ownerId: 'u9',
    ownerName: 'Arun Nair',
    ownerEmail: 'arun.nair@email.com',
  },
  {
    id: 'v10',
    make: 'BMW',
    model: 'iX3',
    year: 2024,
    batteryCapacity: 80,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA10ST7890',
    nickname: 'Luxury Ride',
    ownerId: 'u10',
    ownerName: 'Kavita Desai',
    ownerEmail: 'kavita.desai@email.com',
  },
  {
    id: 'v11',
    make: 'Nissan',
    model: 'Leaf',
    year: 2022,
    batteryCapacity: 40,
    connectorTypes: ['CHAdeMO'],
    registrationNumber: 'KA11UV1234',
    ownerId: 'u11',
    ownerName: 'Suresh Iyer',
    ownerEmail: 'suresh.iyer@email.com',
  },
  {
    id: 'v12',
    make: 'Volkswagen',
    model: 'ID.4',
    year: 2023,
    batteryCapacity: 77,
    connectorTypes: ['CCS2'],
    registrationNumber: 'KA12WX5678',
    nickname: 'Family SUV',
    ownerId: 'u12',
    ownerName: 'Poonam Agarwal',
    ownerEmail: 'poonam.agarwal@email.com',
  },
];

interface VehicleListProps {
  vehicles: VehicleWithOwner[];
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles }) => {
  const getConnectorIcon = (connectorType: string) => {
    switch (connectorType) {
      case 'CCS2':
        return 'âš¡';
      case 'CHAdeMO':
        return 'ðŸ”Œ';
      case 'Type2':
        return 'ðŸ”Œ';
      default:
        return 'ðŸ”Œ';
    }
  };

  const getConnectorBadgeColor = (connectorType: string) => {
    switch (connectorType) {
      case 'CCS2':
        return 'bg-purple-100 text-purple-800';
      case 'CHAdeMO':
        return 'bg-blue-100 text-blue-800';
      case 'Type2':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Battery
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Connectors
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registration
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {vehicle.make.charAt(0)}{vehicle.model.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    {vehicle.nickname && (
                      <div className="text-sm text-gray-500">"{vehicle.nickname}"</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{vehicle.ownerName}</div>
                <div className="text-sm text-gray-500">{vehicle.ownerEmail}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{vehicle.batteryCapacity} kWh</div>
                <div className="text-sm text-gray-500">Capacity</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {vehicle.connectorTypes.map((connector, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConnectorBadgeColor(connector)}`}
                    >
                      <span className="mr-1">{getConnectorIcon(connector)}</span>
                      {connector}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vehicle.registrationNumber || 'Not registered'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="View Details"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-900 p-1"
                    title="Edit Vehicle"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
