export type GunStatus = 
  | 'available' 
  | 'charging' 
  | 'idle' 
  | 'fault' 
  | 'maintenance' 
  | 'reserved' 
  | 'finishing';

export type PowerModuleStatus = 
  | 'operational' 
  | 'degraded' 
  | 'fault' 
  | 'offline' 
  | 'overheating';

export type EfficiencyLevel = 'excellent' | 'good' | 'average' | 'poor' | 'critical';

export interface PowerMetrics {
  currentChargingWatts: number;
  
  maxOutputCapacity: number;
  
  inputPowerWatts: number;
  
  outputPowerWatts: number;
  
  voltage: number;
  
  current: number;
  
  powerFactor: number;
  
  chargingRatePercentage: number;
}

export interface ThermalMetrics {
  powerModuleTemp: number;
  
  connectorTemp: number;
  
  cableTemp: number;
  
  ambientTemp: number;
  
  heatLoadPercentage: number;
  
  coolingSystemStatus: 'normal' | 'high' | 'critical' | 'fault';
  
  thermalEfficiency: number;
}

export interface EfficiencyMetrics {
  chargingEfficiency: number;
  
  conversionEfficiency: number;
  
  energyLoss: number;
  
  efficiencyLevel: EfficiencyLevel;
  
  efficiencyTrend: 'improving' | 'degrading' | 'stable';
}

export interface ChargingSession {
  sessionId: string;
  
  vehicleId?: string;
  vehicleBatteryCapacity?: number;
  currentBatteryLevel?: number;
  targetBatteryLevel?: number;
  
  sessionStartTime: Date;
  estimatedEndTime?: Date;
  actualEndTime?: Date;
  
  energyDelivered: number;
  targetEnergyAmount?: number;
  
  costPerKwh: number;
  currentSessionCost: number;
  
  sessionStatus: 'active' | 'paused' | 'completed' | 'terminated' | 'error';
}

export interface ChargingEstimates {
  estimatedTimeToComplete?: number;
  
  timeToTargetLevel?: number;
  
  timeToFullCharge?: number;
  
  remainingEnergyNeeded?: number;
  
  estimatedCostToComplete?: number;
  
  chargingProgress: number;
  
  averageChargingRate: number;
}

export interface ChargerGunMetrics {
  gunId: string;
  connectorId: string;
  chargerId: string;
  stationId: string;
  
  status: GunStatus;
  powerModuleStatus: PowerModuleStatus;
  
  powerMetrics: PowerMetrics;
  thermalMetrics: ThermalMetrics;
  efficiencyMetrics: EfficiencyMetrics;
  
  activeSession?: ChargingSession;
  
  estimates: ChargingEstimates;
  
  alerts: GunAlert[];
  
  lastUpdated: Date;
  
  historicalData: HistoricalDataPoint[];
}

export interface GunAlert {
  id: string;
  type: 'temperature' | 'efficiency' | 'power' | 'safety' | 'maintenance';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  autoResolve: boolean;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  chargingWatts: number;
  efficiency: number;
  temperature: number;
  heatLoad: number;
}

export interface GunMonitoringFilters {
  status?: GunStatus[];
  powerModuleStatus?: PowerModuleStatus[];
  efficiencyLevel?: EfficiencyLevel[];
  minPower?: number;
  maxPower?: number;
  chargerId?: string;
  stationId?: string;
  hasActiveSession?: boolean;
  hasAlerts?: boolean;
}

export interface MonitoringConfig {
  metricsUpdateInterval: number;
  alertCheckInterval: number;
  
  temperatureWarning: number;
  temperatureCritical: number;
  efficiencyWarning: number;
  efficiencyCritical: number;
  heatLoadWarning: number;
  heatLoadCritical: number;
  
  enableTemperatureAlerts: boolean;
  enableEfficiencyAlerts: boolean;
  enablePowerAlerts: boolean;
}

export interface GunMetricsResponse {
  success: boolean;
  metrics?: ChargerGunMetrics;
  error?: string;
}

export interface GunMetricsListResponse {
  success: boolean;
  metrics: ChargerGunMetrics[];
  total: number;
  error?: string;
}

export interface GunMetricsUpdate {
  gunId: string;
  timestamp: Date;
  updates: Partial<ChargerGunMetrics>;
}

export interface ChargingCommand {
  command: 'start' | 'stop' | 'pause' | 'resume' | 'setLimit';
  gunId: string;
  parameters?: {
    powerLimit?: number;
    currentLimit?: number;
    targetPercentage?: number;
    targetEnergy?: number;
  };
}

export interface ChargingCommandResponse {
  success: boolean;
  commandId: string;
  message?: string;
  error?: string;
}
