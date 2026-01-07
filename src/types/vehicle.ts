// Vehicle Type Definitions

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number; // kWh
  registrationNumber: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
  registrationNumber: string;
}

export interface UpdateVehicleRequest {
  make?: string;
  model?: string;
  batteryCapacity?: number;
}

export interface VehicleStats {
  totalSessions: number;
  totalEnergy: number; // kWh
  totalCost: number;
  avgSessionDuration: number; // minutes
  co2Saved: number; // kg
}

export interface VehicleSession {
  id: string;
  sessionId: string;
  chargerId: string;
  stationName: string;
  startTime: string;
  endTime: string;
  energyConsumed: number;
  cost: number;
  duration: number;
}
