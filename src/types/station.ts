// Station Type Definitions

export interface Station {
  id: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  city: string;
  state: string;
  pincode: string;
  status: 'active' | 'inactive' | 'maintenance';
  rating: number;
  totalReviews: number;
  amenities: string[];
  operatingHours: {
    open: string; // HH:mm
    close: string; // HH:mm
  };
  images: string[];
  connectors: StationConnector[];
  ownerId: string;
  ownerType: 'brand' | 'franchise';
  createdAt: string;
  updatedAt?: string;
}

export interface StationConnector {
  connectorId: string;
  type: 'Type2' | 'CCS' | 'CHAdeMO';
  power: number; // kW
  status: 'available' | 'occupied' | 'faulted' | 'unavailable';
  pricing: ConnectorPricing;
}

export interface ConnectorPricing {
  basePrice: number; // per kWh
  parkingFee: number;
  reservationFee: number;
}

export interface CreateStationRequest {
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  city: string;
  state: string;
  pincode: string;
  amenities?: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  images?: string[];
  connectors: Omit<StationConnector, 'status'>[];
}

export interface UpdateStationRequest {
  name?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  amenities?: string[];
  operatingHours?: {
    open: string;
    close: string;
  };
  images?: string[];
}

export interface NearbyStationsQuery {
  latitude: number;
  longitude: number;
  radius?: number; // meters, default 5000
}

export interface StationAvailability {
  available: number;
  connectors: StationConnector[];
}
