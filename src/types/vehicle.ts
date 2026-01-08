// Vehicle Type Definitions

export interface Vehicle {
  _id?: string;
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number; // kWh
  connectorTypes?: string[];
  registrationNumber: string;
  nickname?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  vin?: string;
  color?: string;
  status?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
  connectorTypes?: string[];
  registrationNumber: string;
  isDefault?: boolean;
  nickname?: string;
  ownerId?: string;
  vin?: string;
  color?: string;
}

export interface UpdateVehicleRequest {
  make?: string;
  model?: string;
  batteryCapacity?: number;
}

export interface VehicleStats {
  totalSessions: number;
  totalEnergy: number; // kWh
  totalEnergyConsumed: number; // alias for totalEnergy
  totalCost: number;
  avgSessionDuration: number; // minutes
  co2Saved: number; // kg
  averageCostPerSession: number;
  averageEnergyPerSession: number;
  favoriteStation?: string;
  lastChargedDate?: string;
  monthlyStats?: {
    sessions: number;
    energyConsumed: number;
    cost: number;
  };
}

export interface VehicleSession {
  id: string;
  sessionId: string;
  chargerId: string;
  stationName: string;
  startTime: string;
  endTime: string;
  date: string; // alias for startTime, used by history page
  energyConsumed: number;
  cost: number;
  duration: number;
}
