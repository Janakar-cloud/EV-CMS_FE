export type PricingModel = 'static' | 'slab' | 'hybrid' | 'time-of-use' | 'dynamic';

export interface SlabTier {
  uptoKWh: number | null;
  perKWh: number;
}

export interface TimeWindow {
  window: string;
  multiplier?: number;
  perKWhOverride?: number;
}

export interface IdleFee {
  graceMinutes: number;
  perMinute: number;
  capPerSession?: number;
}

export interface Limits {
  maxMinutes?: number;
  maxKWh?: number;
  softStopSoC?: number;
}

export interface SegmentAdjustment {
  segment: 'guest' | 'registered' | 'fleet' | 'employee' | 'resident';
  kWhDiscount?: number; // kWh discount
  percentageDiscount?: number;
}

export interface LocationModifier {
  zone?: 'highway' | 'cbd' | 'campus' | 'residential' | 'industrial';
  multiplier?: number;
}

export type ScopeLevel = 'global' | 'site' | 'charger' | 'connector';

export interface PricingScope {
  level: ScopeLevel;
  id?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  scope: PricingScope;
  validity: {
    from: string;
    to: string | null;
    days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  };
  base: {
    model: PricingModel;
    perKWh?: number;
    perMinute?: number;
    minBill?: number;
  };
  slabs?: SlabTier[];
  tou?: TimeWindow[];
  idleFee?: IdleFee;
  limits?: Limits;
  segments?: SegmentAdjustment[];
  location?: LocationModifier;
  taxes?: { gstPercent: number };
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface PricingCalculation {
  energyCost: number;
  serviceFee: number;
  parkingFee?: number;
  tax: number;
  taxRate: number;
  discount?: number;
  totalAmount: number;
  breakdown?: {
    baseRate: number;
    isPeakHour?: boolean;
    appliedRule?: string;
  };
}
