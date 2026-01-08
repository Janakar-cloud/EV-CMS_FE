import {
  ChargerGunMetrics,
  GunStatus,
  PowerModuleStatus,
  PowerMetrics,
  ThermalMetrics,
  EfficiencyMetrics,
  ChargingSession,
  ChargingEstimates,
  GunAlert,
  HistoricalDataPoint,
  GunMetricsResponse,
  GunMetricsListResponse,
  GunMonitoringFilters,
  MonitoringConfig,
  ChargingCommand,
  ChargingCommandResponse,
  EfficiencyLevel,
} from '@/types/gun-monitoring';

class GunMonitoringStorage {
  private gunMetrics: Map<string, ChargerGunMetrics> = new Map();
  private activeUpdates: Set<string> = new Set();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const sampleGuns: ChargerGunMetrics[] = [
      {
        gunId: 'gun-1-1',
        connectorId: 'conn-1-1',
        chargerId: 'CHG-001',
        stationId: 'STN-MAIN-01',
        status: 'charging',
        powerModuleStatus: 'operational',
        powerMetrics: {
          currentChargingWatts: 47500,
          maxOutputCapacity: 50000,
          inputPowerWatts: 48500,
          outputPowerWatts: 47500,
          voltage: 400,
          current: 118.75,
          powerFactor: 0.98,
          chargingRatePercentage: 95,
        },
        thermalMetrics: {
          powerModuleTemp: 45,
          connectorTemp: 28,
          cableTemp: 32,
          ambientTemp: 22,
          heatLoadPercentage: 65,
          coolingSystemStatus: 'normal',
          thermalEfficiency: 0.94,
        },
        efficiencyMetrics: {
          chargingEfficiency: 0.979,
          conversionEfficiency: 0.985,
          energyLoss: 1000,
          efficiencyLevel: 'excellent',
          efficiencyTrend: 'stable',
        },
        activeSession: {
          sessionId: 'session-001',
          vehicleId: 'Tesla-Model3-ABC123',
          vehicleBatteryCapacity: 75,
          currentBatteryLevel: 35,
          targetBatteryLevel: 80,
          sessionStartTime: new Date(Date.now() - 25 * 60 * 1000),
          energyDelivered: 19.8,
          targetEnergyAmount: 33.75,
          costPerKwh: 0.45,
          currentSessionCost: 8.91,
          sessionStatus: 'active',
        },
        estimates: {
          estimatedTimeToComplete: 18,
          timeToTargetLevel: 18,
          timeToFullCharge: 52,
          remainingEnergyNeeded: 13.95,
          estimatedCostToComplete: 6.28,
          chargingProgress: 58.7,
          averageChargingRate: 47.5,
        },
        alerts: [
          {
            id: 'alert-temp-001',
            type: 'temperature',
            severity: 'info',
            message: 'Power module operating at normal temperature range',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            acknowledged: true,
            autoResolve: true,
          },
        ],
        lastUpdated: new Date(),
        historicalData: this.generateHistoricalData(25),
      },
      {
        gunId: 'gun-1-2',
        connectorId: 'conn-1-2',
        chargerId: 'CHG-001',
        stationId: 'STN-MAIN-01',
        status: 'available',
        powerModuleStatus: 'operational',
        powerMetrics: {
          currentChargingWatts: 0,
          maxOutputCapacity: 50000,
          inputPowerWatts: 150,
          outputPowerWatts: 0,
          voltage: 0,
          current: 0,
          powerFactor: 1.0,
          chargingRatePercentage: 0,
        },
        thermalMetrics: {
          powerModuleTemp: 25,
          connectorTemp: 23,
          cableTemp: 23,
          ambientTemp: 22,
          heatLoadPercentage: 10,
          coolingSystemStatus: 'normal',
          thermalEfficiency: 1.0,
        },
        efficiencyMetrics: {
          chargingEfficiency: 1.0,
          conversionEfficiency: 1.0,
          energyLoss: 0,
          efficiencyLevel: 'excellent',
          efficiencyTrend: 'stable',
        },
        estimates: {
          chargingProgress: 0,
          averageChargingRate: 0,
        },
        alerts: [],
        lastUpdated: new Date(),
        historicalData: [],
      },
      {
        gunId: 'gun-2-1',
        connectorId: 'conn-2-1',
        chargerId: 'CHG-002',
        stationId: 'STN-PARK-01',
        status: 'charging',
        powerModuleStatus: 'operational',
        powerMetrics: {
          currentChargingWatts: 7200,
          maxOutputCapacity: 22000,
          inputPowerWatts: 7450,
          outputPowerWatts: 7200,
          voltage: 230,
          current: 31.3,
          powerFactor: 0.97,
          chargingRatePercentage: 32.7,
        },
        thermalMetrics: {
          powerModuleTemp: 38,
          connectorTemp: 26,
          cableTemp: 29,
          ambientTemp: 22,
          heatLoadPercentage: 35,
          coolingSystemStatus: 'normal',
          thermalEfficiency: 0.97,
        },
        efficiencyMetrics: {
          chargingEfficiency: 0.966,
          conversionEfficiency: 0.975,
          energyLoss: 250,
          efficiencyLevel: 'excellent',
          efficiencyTrend: 'stable',
        },
        activeSession: {
          sessionId: 'session-002',
          vehicleId: 'BMW-i4-XYZ789',
          vehicleBatteryCapacity: 83.9,
          currentBatteryLevel: 22,
          targetBatteryLevel: 85,
          sessionStartTime: new Date(Date.now() - 145 * 60 * 1000),
          energyDelivered: 17.2,
          targetEnergyAmount: 52.86,
          costPerKwh: 0.35,
          currentSessionCost: 6.02,
          sessionStatus: 'active',
        },
        estimates: {
          estimatedTimeToComplete: 295,
          timeToTargetLevel: 295,
          timeToFullCharge: 370,
          remainingEnergyNeeded: 35.66,
          estimatedCostToComplete: 12.48,
          chargingProgress: 32.5,
          averageChargingRate: 7.1,
        },
        alerts: [],
        lastUpdated: new Date(),
        historicalData: this.generateHistoricalData(145, 7.2),
      },
      {
        gunId: 'gun-3-1',
        connectorId: 'conn-3-1',
        chargerId: 'CHG-003',
        stationId: 'STN-MAIN-02',
        status: 'fault',
        powerModuleStatus: 'fault',
        powerMetrics: {
          currentChargingWatts: 0,
          maxOutputCapacity: 150000,
          inputPowerWatts: 200,
          outputPowerWatts: 0,
          voltage: 0,
          current: 0,
          powerFactor: 0,
          chargingRatePercentage: 0,
        },
        thermalMetrics: {
          powerModuleTemp: 75,
          connectorTemp: 45,
          cableTemp: 48,
          ambientTemp: 22,
          heatLoadPercentage: 95,
          coolingSystemStatus: 'fault',
          thermalEfficiency: 0.5,
        },
        efficiencyMetrics: {
          chargingEfficiency: 0,
          conversionEfficiency: 0,
          energyLoss: 0,
          efficiencyLevel: 'critical',
          efficiencyTrend: 'degrading',
        },
        estimates: {
          chargingProgress: 0,
          averageChargingRate: 0,
        },
        alerts: [
          {
            id: 'alert-temp-critical-001',
            type: 'temperature',
            severity: 'critical',
            message: 'Power module temperature exceeds safe operating limits',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            acknowledged: false,
            autoResolve: false,
          },
          {
            id: 'alert-cooling-fault-001',
            type: 'safety',
            severity: 'emergency',
            message: 'Cooling system failure detected - charger shut down',
            timestamp: new Date(Date.now() - 12 * 60 * 1000),
            acknowledged: false,
            autoResolve: false,
          },
          {
            id: 'alert-power-module-001',
            type: 'power',
            severity: 'critical',
            message: 'Power module fault - charging disabled',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            acknowledged: false,
            autoResolve: false,
          },
        ],
        lastUpdated: new Date(),
        historicalData: [],
      },
    ];

    sampleGuns.forEach(gun => {
      this.gunMetrics.set(gun.gunId, gun);
    });
  }

  private generateHistoricalData(minutes: number, basePower: number = 47.5): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const now = Date.now();

    for (let i = minutes; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 1000);
      const powerVariation = (Math.random() - 0.5) * 0.1 * basePower;
      const chargingWatts = Math.max(0, basePower * 1000 + powerVariation * 1000);
      const efficiency = Math.min(1, Math.max(0.8, 0.97 + (Math.random() - 0.5) * 0.03));
      const tempVariation = (Math.random() - 0.5) * 5;
      const temperature = Math.max(20, 35 + tempVariation);
      const heatLoad = Math.min(100, Math.max(0, (chargingWatts / 1000) * 1.2 + tempVariation));

      data.push({
        timestamp,
        chargingWatts,
        efficiency,
        temperature,
        heatLoad,
      });
    }

    return data;
  }

  startRealTimeUpdates(gunId: string) {
    if (this.activeUpdates.has(gunId)) return;

    this.activeUpdates.add(gunId);

    const updateInterval = setInterval(() => {
      this.simulateRealTimeUpdate(gunId);
    }, 5000);

    this.updateIntervals.set(gunId, updateInterval);
  }

  stopRealTimeUpdates(gunId: string) {
    if (!this.activeUpdates.has(gunId)) return;

    this.activeUpdates.delete(gunId);

    const interval = this.updateIntervals.get(gunId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(gunId);
    }
  }

  private simulateRealTimeUpdate(gunId: string) {
    const gun = this.gunMetrics.get(gunId);
    if (!gun || gun.status !== 'charging') return;

    const powerVariation = (Math.random() - 0.5) * 0.05;
    const tempVariation = (Math.random() - 0.5) * 2;
    const efficiencyVariation = (Math.random() - 0.5) * 0.01;

    gun.powerMetrics.currentChargingWatts *= 1 + powerVariation;
    gun.powerMetrics.outputPowerWatts = gun.powerMetrics.currentChargingWatts;
    gun.powerMetrics.inputPowerWatts =
      gun.powerMetrics.currentChargingWatts / gun.efficiencyMetrics.chargingEfficiency;
    gun.powerMetrics.chargingRatePercentage =
      (gun.powerMetrics.currentChargingWatts / gun.powerMetrics.maxOutputCapacity) * 100;

    gun.thermalMetrics.powerModuleTemp += tempVariation;
    gun.thermalMetrics.connectorTemp += tempVariation * 0.5;
    gun.thermalMetrics.heatLoadPercentage = Math.min(
      100,
      (gun.powerMetrics.currentChargingWatts / 1000) * 1.5
    );

    gun.efficiencyMetrics.chargingEfficiency = Math.min(
      1,
      Math.max(0.85, gun.efficiencyMetrics.chargingEfficiency + efficiencyVariation)
    );
    gun.efficiencyMetrics.energyLoss =
      gun.powerMetrics.inputPowerWatts - gun.powerMetrics.outputPowerWatts;

    if (gun.activeSession) {
      const sessionDurationMinutes =
        (Date.now() - gun.activeSession.sessionStartTime.getTime()) / (1000 * 60);
      const energyDelivered =
        (gun.powerMetrics.currentChargingWatts / 1000) * (sessionDurationMinutes / 60);
      gun.activeSession.energyDelivered = energyDelivered;
      gun.activeSession.currentSessionCost = energyDelivered * gun.activeSession.costPerKwh;

      if (gun.activeSession.targetEnergyAmount) {
        gun.estimates.chargingProgress =
          (energyDelivered / gun.activeSession.targetEnergyAmount) * 100;
        gun.estimates.remainingEnergyNeeded = Math.max(
          0,
          gun.activeSession.targetEnergyAmount - energyDelivered
        );
        gun.estimates.estimatedTimeToComplete =
          (gun.estimates.remainingEnergyNeeded / (gun.powerMetrics.currentChargingWatts / 1000)) *
          60; // minutes
        gun.estimates.estimatedCostToComplete =
          gun.estimates.remainingEnergyNeeded * gun.activeSession.costPerKwh;
      }
    }

    gun.historicalData.push({
      timestamp: new Date(),
      chargingWatts: gun.powerMetrics.currentChargingWatts,
      efficiency: gun.efficiencyMetrics.chargingEfficiency,
      temperature: gun.thermalMetrics.powerModuleTemp,
      heatLoad: gun.thermalMetrics.heatLoadPercentage,
    });

    if (gun.historicalData.length > 100) {
      gun.historicalData = gun.historicalData.slice(-100);
    }

    gun.lastUpdated = new Date();

    this.checkAndGenerateAlerts(gun);
  }

  private checkAndGenerateAlerts(gun: ChargerGunMetrics) {
    const now = new Date();

    if (gun.thermalMetrics.powerModuleTemp > 70) {
      const existingAlert = gun.alerts.find(
        alert =>
          alert.type === 'temperature' && alert.severity === 'critical' && !alert.acknowledged
      );

      if (!existingAlert) {
        gun.alerts.push({
          id: `alert-temp-${Date.now()}`,
          type: 'temperature',
          severity: 'critical',
          message: `Power module temperature high: ${gun.thermalMetrics.powerModuleTemp.toFixed(1)}Â°C`,
          timestamp: now,
          acknowledged: false,
          autoResolve: false,
        });
      }
    }

    if (gun.efficiencyMetrics.chargingEfficiency < 0.85) {
      const existingAlert = gun.alerts.find(
        alert => alert.type === 'efficiency' && alert.severity === 'warning' && !alert.acknowledged
      );

      if (!existingAlert) {
        gun.alerts.push({
          id: `alert-eff-${Date.now()}`,
          type: 'efficiency',
          severity: 'warning',
          message: `Charging efficiency below optimal: ${(gun.efficiencyMetrics.chargingEfficiency * 100).toFixed(1)}%`,
          timestamp: now,
          acknowledged: false,
          autoResolve: true,
        });
      }
    }

    if (gun.thermalMetrics.heatLoadPercentage > 85) {
      const existingAlert = gun.alerts.find(
        alert => alert.type === 'temperature' && alert.severity === 'warning' && !alert.acknowledged
      );

      if (!existingAlert) {
        gun.alerts.push({
          id: `alert-heat-${Date.now()}`,
          type: 'temperature',
          severity: 'warning',
          message: `High heat load detected: ${gun.thermalMetrics.heatLoadPercentage.toFixed(1)}%`,
          timestamp: now,
          acknowledged: false,
          autoResolve: true,
        });
      }
    }
  }

  getGunMetrics(gunId: string): ChargerGunMetrics | undefined {
    return this.gunMetrics.get(gunId);
  }

  getAllGunMetrics(): ChargerGunMetrics[] {
    return Array.from(this.gunMetrics.values());
  }

  getChargerGunMetrics(chargerId: string): ChargerGunMetrics[] {
    return this.getAllGunMetrics().filter(gun => gun.chargerId === chargerId);
  }

  filterGunMetrics(filters: GunMonitoringFilters): ChargerGunMetrics[] {
    let filtered = this.getAllGunMetrics();

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(gun => filters.status!.includes(gun.status));
    }

    if (filters.powerModuleStatus && filters.powerModuleStatus.length > 0) {
      filtered = filtered.filter(gun => filters.powerModuleStatus!.includes(gun.powerModuleStatus));
    }

    if (filters.efficiencyLevel && filters.efficiencyLevel.length > 0) {
      filtered = filtered.filter(gun =>
        filters.efficiencyLevel!.includes(gun.efficiencyMetrics.efficiencyLevel)
      );
    }

    if (filters.chargerId) {
      filtered = filtered.filter(gun => gun.chargerId === filters.chargerId);
    }

    if (filters.stationId) {
      filtered = filtered.filter(gun => gun.stationId === filters.stationId);
    }

    if (filters.hasActiveSession !== undefined) {
      filtered = filtered.filter(gun =>
        filters.hasActiveSession ? !!gun.activeSession : !gun.activeSession
      );
    }

    if (filters.hasAlerts !== undefined) {
      filtered = filtered.filter(gun =>
        filters.hasAlerts ? gun.alerts.length > 0 : gun.alerts.length === 0
      );
    }

    if (filters.minPower !== undefined) {
      filtered = filtered.filter(
        gun => gun.powerMetrics.currentChargingWatts >= filters.minPower! * 1000
      );
    }

    if (filters.maxPower !== undefined) {
      filtered = filtered.filter(
        gun => gun.powerMetrics.currentChargingWatts <= filters.maxPower! * 1000
      );
    }

    return filtered;
  }

  executeCommand(command: ChargingCommand): ChargingCommandResponse {
    const gun = this.gunMetrics.get(command.gunId);
    if (!gun) {
      return {
        success: false,
        commandId: '',
        error: 'Gun not found',
      };
    }

    const commandId = `cmd-${Date.now()}`;

    switch (command.command) {
      case 'start':
        if (gun.status === 'available') {
          gun.status = 'charging';
          this.startRealTimeUpdates(command.gunId);
          return {
            success: true,
            commandId,
            message: 'Charging started successfully',
          };
        }
        return {
          success: false,
          commandId,
          error: 'Gun not available for charging',
        };

      case 'stop':
        if (gun.status === 'charging') {
          gun.status = 'available';
          gun.activeSession = undefined;
          this.stopRealTimeUpdates(command.gunId);
          return {
            success: true,
            commandId,
            message: 'Charging stopped successfully',
          };
        }
        return {
          success: false,
          commandId,
          error: 'Gun not currently charging',
        };

      case 'setLimit':
        if (gun.status === 'charging' && command.parameters?.powerLimit) {
          gun.powerMetrics.maxOutputCapacity = command.parameters.powerLimit * 1000;
          return {
            success: true,
            commandId,
            message: 'Power limit updated successfully',
          };
        }
        return {
          success: false,
          commandId,
          error: 'Cannot set limit - gun not charging or invalid parameters',
        };

      default:
        return {
          success: false,
          commandId,
          error: 'Unknown command',
        };
    }
  }
}

export const gunMonitoringStorage = new GunMonitoringStorage();

// API client for real backend calls
import { apiClient } from './api-client';

const GUN_METRICS_BASE = '/chargers';

export const gunMonitoringService = {
  getGunMetrics: async (gunId: string): Promise<GunMetricsResponse> => {
    try {
      // Try real API first
      const response = await apiClient.get(`${GUN_METRICS_BASE}/guns/metrics`);
      const data = response?.data ?? response;
      const allMetrics = Array.isArray(data) ? data : (data?.metrics ?? []);
      const metrics = allMetrics.find((m: any) => m.gunId === gunId);

      if (metrics) {
        return { success: true, metrics: { ...metrics, fromApi: true } };
      }
      throw new Error('Gun not found in API response');
    } catch (error) {
      // Fallback to mock data
      console.warn('Gun metrics API unavailable, using mock data');
      const metrics = gunMonitoringStorage.getGunMetrics(gunId);
      if (metrics) {
        return { success: true, metrics };
      }
      return { success: false, error: 'Gun not found' };
    }
  },

  getAllGunMetrics: async (): Promise<GunMetricsListResponse> => {
    try {
      // Try real API first: GET /api/v1/chargers/guns/metrics
      const response = await apiClient.get(`${GUN_METRICS_BASE}/guns/metrics`);
      const data = response?.data ?? response;
      const metrics = Array.isArray(data) ? data : (data?.metrics ?? data?.data ?? []);

      if (metrics.length > 0) {
        return {
          success: true,
          metrics: metrics.map((m: any) => ({ ...m, fromApi: true })),
          total: metrics.length,
        };
      }
      throw new Error('No metrics from API');
    } catch (error) {
      // Fallback to mock data
      console.warn('Gun metrics API unavailable, using mock data');
      const metrics = gunMonitoringStorage.getAllGunMetrics();
      return { success: true, metrics, total: metrics.length };
    }
  },

  getChargerGunMetrics: async (chargerId: string): Promise<GunMetricsListResponse> => {
    try {
      // Try real API first: GET /api/v1/chargers/:id/guns/metrics
      const response = await apiClient.get(`${GUN_METRICS_BASE}/${chargerId}/guns/metrics`);
      const data = response?.data ?? response;
      const metrics = Array.isArray(data) ? data : (data?.metrics ?? data?.data ?? []);

      if (metrics.length > 0) {
        return {
          success: true,
          metrics: metrics.map((m: any) => ({ ...m, fromApi: true })),
          total: metrics.length,
        };
      }
      throw new Error('No metrics from API');
    } catch (error) {
      // Fallback to mock data
      console.warn(`Charger ${chargerId} gun metrics API unavailable, using mock data`);
      const metrics = gunMonitoringStorage.getChargerGunMetrics(chargerId);
      return { success: true, metrics, total: metrics.length };
    }
  },

  filterGunMetrics: async (filters: GunMonitoringFilters): Promise<GunMetricsListResponse> => {
    try {
      // Try to get all metrics from API then filter locally
      const response = await apiClient.get(`${GUN_METRICS_BASE}/guns/metrics`, { params: filters });
      const data = response?.data ?? response;
      const metrics = Array.isArray(data) ? data : (data?.metrics ?? data?.data ?? []);

      if (metrics.length > 0) {
        return {
          success: true,
          metrics: metrics.map((m: any) => ({ ...m, fromApi: true })),
          total: metrics.length,
        };
      }
      throw new Error('No metrics from API');
    } catch (error) {
      // Fallback to mock data with local filtering
      console.warn('Gun metrics filter API unavailable, using mock data');
      const metrics = gunMonitoringStorage.filterGunMetrics(filters);
      return { success: true, metrics, total: metrics.length };
    }
  },

  executeCommand: async (command: ChargingCommand): Promise<ChargingCommandResponse> => {
    try {
      // Try real API first
      const response = await apiClient.post(`${GUN_METRICS_BASE}/${command.gunId}/command`, {
        command: command.command,
        parameters: command.parameters,
      });
      return response?.data ?? response;
    } catch (error) {
      // Fallback to mock command execution
      console.warn('Command API unavailable, using mock execution');
      return gunMonitoringStorage.executeCommand(command);
    }
  },

  startMonitoring: (gunId: string) => {
    gunMonitoringStorage.startRealTimeUpdates(gunId);
  },

  stopMonitoring: (gunId: string) => {
    gunMonitoringStorage.stopRealTimeUpdates(gunId);
  },
};
