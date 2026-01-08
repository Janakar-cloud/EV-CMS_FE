export interface ChargingSession {
  id: string;
  startTime: string;
  endTime?: string | null;
  status: 'active' | 'completed' | 'stopped' | 'failed' | string;
  energyConsumed: number;
  totalCost: number;
  currentSoc?: number;
  initialSoc?: number;
  finalSoc?: number;
  station: {
    name: string;
    address: string;
  };
  connector: {
    type: string;
    power: number;
    status: string;
    pricing?: {
      basePrice?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CDR {
  sessionId: string;
  cdrId: string;
  startTime: string;
  endTime: string;
  initialSoc?: number;
  finalSoc?: number;
  energyConsumed: number;
  paymentStatus: string;
  station: {
    name: string;
    address: string;
  };
  vehicle: {
    make: string;
    model: string;
    registrationNumber: string;
  };
  connector: {
    type: string;
    power: number;
  };
  cost: {
    energyCost: number;
    serviceFee: number;
    tax: number;
    totalAmount: number;
  };
  [key: string]: any;
}
