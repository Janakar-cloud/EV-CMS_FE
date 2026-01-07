// Booking Type Definitions

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  stationId: string;
  stationName?: string;
  connectorId: string;
  vehicleId: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  scheduledTime: string;
  startTime?: string;
  endTime?: string;
  estimatedDuration: number; // minutes
  duration?: number; // actual minutes
  energyConsumed?: number; // kWh
  initialSoC?: number;
  finalSoC?: number;
  cost: BookingCost;
  rating?: BookingRating;
  cancellationReason?: string;
  logs: BookingLog[];
  createdAt: string;
  updatedAt?: string;
}

export interface BookingCost {
  energyCost: number;
  reservationFee: number;
  parkingFee: number;
  platformFee: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
}

export interface BookingRating {
  score: number;
  review?: string;
  images?: string[];
  ratedAt: string;
}

export interface BookingLog {
  event: string;
  timestamp: string;
}

export interface CreateBookingRequest {
  stationId: string;
  connectorId: string;
  vehicleId: string;
  scheduledTime: string;
  estimatedDuration: number;
}

export interface CompleteBookingRequest {
  energyConsumed: number;
  finalSoC: number;
  rating?: {
    score: number;
    review?: string;
    images?: string[];
  };
}

export interface CancelBookingRequest {
  reason: string;
}
