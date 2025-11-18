export type ChargerStatus = 'available' | 'occupied' | 'maintenance' | 'offline' | 'faulted';
export type ChargerType = 'AC' | 'DC' | 'DC_FAST';
export type ConnectorType = 'Type1' | 'Type2' | 'CCS1' | 'CCS2' | 'CHAdeMO' | 'Tesla';

export interface Connector {
  id: string;
  type: ConnectorType;
  maxPower: number;
  status: ChargerStatus;
  currentPower?: number;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Charger {
  id: string;
  chargerId: string;
  stationId: string;
  name: string;
  description?: string;
  type: ChargerType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  maxPower: number;
  connectors: Connector[];
  status: ChargerStatus;
  location: Location;
  installationDate: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  totalEnergyDelivered: number;
  totalSessions: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateChargerRequest {
  chargerId: string;
  stationId: string;
  name: string;
  description?: string;
  type: ChargerType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  maxPower: number;
  connectors: Omit<Connector, 'id' | 'status' | 'currentPower'>[];
  location: Location;
  installationDate: string;
}

export interface UpdateChargerRequest extends Partial<CreateChargerRequest> {
  id: string;
}

export interface ChargerValidationError {
  field: string;
  message: string;
}

export interface ChargerResponse {
  success: boolean;
  charger?: Charger;
  errors?: ChargerValidationError[];
  message?: string;
}

export interface ChargerListResponse {
  success: boolean;
  chargers: Charger[];
  total: number;
  message?: string;
}

export interface ChargerFilters {
  status?: ChargerStatus[];
  type?: ChargerType[];
  location?: string;
  manufacturer?: string;
  searchQuery?: string;
}

export interface OCPPCommand {
  chargerId: string;
  stationId: string;
  command: string;
  parameters?: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed';
  response?: any;
}

export interface ChargerStats {
  totalChargers: number;
  availableChargers: number;
  occupiedChargers: number;
  maintenanceChargers: number;
  offlineChargers: number;
  faultedChargers: number;
  totalEnergyDelivered: number;
  totalSessions: number;
  averageUtilization: number;
}
