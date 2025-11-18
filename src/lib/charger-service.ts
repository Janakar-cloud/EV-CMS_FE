import {
  Charger,
  CreateChargerRequest,
  UpdateChargerRequest,
  ChargerResponse,
  ChargerListResponse,
  ChargerValidationError,
  ChargerStatus,
  ChargerType,
  ConnectorType,
  ChargerFilters,
  ChargerStats,
  OCPPCommand
} from '@/types/charger';

class ChargerStorage {
  private chargers: Charger[] = [];
  private nextId = 1;

  constructor() {
    const sampleChargers: Charger[] = [
      {
        id: '1',
        chargerId: 'CHG-001',
        stationId: 'STN-MAIN-01',
        name: 'Main Entrance Fast Charger',
        description: 'High-speed DC charger at main entrance',
        type: 'DC_FAST',
        manufacturer: 'ABB',
        model: 'Terra 184',
        serialNumber: 'ABB-TF184-2024-001',
        firmwareVersion: '2.1.4',
        maxPower: 184,
        connectors: [
          {
            id: 'conn-1-1',
            type: 'CCS2',
            maxPower: 184,
            status: 'available'
          },
          {
            id: 'conn-1-2', 
            type: 'CHAdeMO',
            maxPower: 50,
            status: 'available'
          }
        ],
        status: 'available',
        location: {
          address: '123 Electric Avenue',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
          latitude: 37.7749,
          longitude: -122.4194
        },
        installationDate: new Date('2024-01-15'),
        lastMaintenanceDate: new Date('2024-09-15'),
        nextMaintenanceDate: new Date('2024-12-15'),
        totalEnergyDelivered: 12450.5,
        totalSessions: 348,
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-09-15'),
        createdBy: 'admin001'
      },
      {
        id: '2',
        chargerId: 'CHG-002',
        stationId: 'STN-PARK-01',
        name: 'Parking Lot AC Charger',
        description: 'Level 2 AC charger in parking area',
        type: 'AC',
        manufacturer: 'ChargePoint',
        model: 'CT4021',
        serialNumber: 'CP-CT4021-2024-002',
        firmwareVersion: '3.2.1',
        maxPower: 22,
        connectors: [
          {
            id: 'conn-2-1',
            type: 'Type2',
            maxPower: 22,
            status: 'occupied',
            currentPower: 7.2
          }
        ],
        status: 'occupied',
        location: {
          address: '456 Charge Street',
          city: 'San Francisco', 
          state: 'CA',
          zipCode: '94103',
          country: 'USA',
          latitude: 37.7849,
          longitude: -122.4094
        },
        installationDate: new Date('2024-02-01'),
        lastMaintenanceDate: new Date('2024-08-20'),
        nextMaintenanceDate: new Date('2024-11-20'),
        totalEnergyDelivered: 8923.2,
        totalSessions: 567,
        isActive: true,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-10-20'),
        createdBy: 'franchise001'
      },
      {
        id: '3',
        chargerId: 'CHG-003',
        stationId: 'STN-MAIN-02',
        name: 'Backup Fast Charger',
        description: 'Secondary fast charger for high demand',
        type: 'DC_FAST',
        manufacturer: 'Tritium',
        model: 'PKM150',
        serialNumber: 'TRI-PKM150-2024-003',
        firmwareVersion: '1.8.2',
        maxPower: 150,
        connectors: [
          {
            id: 'conn-3-1',
            type: 'CCS1',
            maxPower: 150,
            status: 'maintenance'
          }
        ],
        status: 'maintenance',
        location: {
          address: '123 Electric Avenue',
          city: 'San Francisco',
          state: 'CA', 
          zipCode: '94102',
          country: 'USA',
          latitude: 37.7749,
          longitude: -122.4194
        },
        installationDate: new Date('2024-03-10'),
        lastMaintenanceDate: new Date('2024-10-15'),
        nextMaintenanceDate: new Date('2025-01-15'),
        totalEnergyDelivered: 6742.8,
        totalSessions: 189,
        isActive: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-10-15'),
        createdBy: 'admin001'
      }
    ];

    this.chargers = sampleChargers;
    this.nextId = 4;
  }

  private validateCharger(chargerData: CreateChargerRequest): ChargerValidationError[] {
    const errors: ChargerValidationError[] = [];

    if (!chargerData.chargerId || chargerData.chargerId.trim().length < 3) {
      errors.push({
        field: 'chargerId',
        message: 'Charger ID must be at least 3 characters long'
      });
    }

    if (!chargerData.stationId || chargerData.stationId.trim().length < 3) {
      errors.push({
        field: 'stationId', 
        message: 'Station ID must be at least 3 characters long'
      });
    }

    if (!chargerData.name || chargerData.name.trim().length < 3) {
      errors.push({
        field: 'name',
        message: 'Charger name must be at least 3 characters long'
      });
    }

    if (!chargerData.manufacturer || chargerData.manufacturer.trim().length < 2) {
      errors.push({
        field: 'manufacturer',
        message: 'Manufacturer is required'
      });
    }

    if (!chargerData.model || chargerData.model.trim().length < 2) {
      errors.push({
        field: 'model',
        message: 'Model is required'
      });
    }

    if (!chargerData.serialNumber || chargerData.serialNumber.trim().length < 5) {
      errors.push({
        field: 'serialNumber',
        message: 'Serial number must be at least 5 characters long'
      });
    }

    if (!chargerData.maxPower || chargerData.maxPower <= 0) {
      errors.push({
        field: 'maxPower',
        message: 'Maximum power must be greater than 0'
      });
    }

    if (!chargerData.connectors || chargerData.connectors.length === 0) {
      errors.push({
        field: 'connectors',
        message: 'At least one connector is required'
      });
    }

    if (!chargerData.location.address || chargerData.location.address.trim().length < 5) {
      errors.push({
        field: 'location.address',
        message: 'Address is required'
      });
    }

    if (!chargerData.location.city || chargerData.location.city.trim().length < 2) {
      errors.push({
        field: 'location.city',
        message: 'City is required'
      });
    }

    if (this.isChargerIdTaken(chargerData.chargerId)) {
      errors.push({
        field: 'chargerId',
        message: 'Charger ID already exists. Please choose a different ID.'
      });
    }

    if (this.isStationIdTaken(chargerData.stationId)) {
      errors.push({
        field: 'stationId',
        message: 'Station ID already exists. Please choose a different ID.'
      });
    }

    return errors;
  }

  isChargerIdTaken(chargerId: string): boolean {
    return this.chargers.some(charger => 
      charger.chargerId.toLowerCase() === chargerId.toLowerCase()
    );
  }

  isStationIdTaken(stationId: string): boolean {
    return this.chargers.some(charger => 
      charger.stationId.toLowerCase() === stationId.toLowerCase()
    );
  }

  createCharger(chargerData: CreateChargerRequest, createdBy: string): ChargerResponse {
    const errors = this.validateCharger(chargerData);
    
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    const newCharger: Charger = {
      id: this.nextId.toString(),
      chargerId: chargerData.chargerId.trim(),
      stationId: chargerData.stationId.trim(),
      name: chargerData.name.trim(),
      description: chargerData.description?.trim(),
      type: chargerData.type,
      manufacturer: chargerData.manufacturer.trim(),
      model: chargerData.model.trim(),
      serialNumber: chargerData.serialNumber.trim(),
      firmwareVersion: chargerData.firmwareVersion.trim(),
      maxPower: chargerData.maxPower,
      connectors: chargerData.connectors.map((conn, index) => ({
        id: `conn-${this.nextId}-${index + 1}`,
        type: conn.type,
        maxPower: conn.maxPower,
        status: 'available'
      })),
      status: 'available',
      location: chargerData.location,
      installationDate: new Date(chargerData.installationDate),
      totalEnergyDelivered: 0,
      totalSessions: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    this.chargers.push(newCharger);
    this.nextId++;

    return {
      success: true,
      charger: newCharger,
      message: 'Charger added successfully'
    };
  }

  getAllChargers(): Charger[] {
    return [...this.chargers];
  }

  getChargerById(id: string): Charger | undefined {
    return this.chargers.find(charger => charger.id === id);
  }

  getChargerByChargerId(chargerId: string): Charger | undefined {
    return this.chargers.find(charger => 
      charger.chargerId.toLowerCase() === chargerId.toLowerCase()
    );
  }

  filterChargers(filters: ChargerFilters): Charger[] {
    let filtered = [...this.chargers];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(charger => filters.status!.includes(charger.status));
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(charger => filters.type!.includes(charger.type));
    }

    if (filters.manufacturer) {
      filtered = filtered.filter(charger => 
        charger.manufacturer.toLowerCase().includes(filters.manufacturer!.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(charger => 
        charger.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        charger.location.address.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(charger =>
        charger.chargerId.toLowerCase().includes(query) ||
        charger.stationId.toLowerCase().includes(query) ||
        charger.name.toLowerCase().includes(query) ||
        charger.manufacturer.toLowerCase().includes(query) ||
        charger.model.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  getChargerStats(): ChargerStats {
    const totalChargers = this.chargers.length;
    const statusCounts = this.chargers.reduce((acc, charger) => {
      acc[charger.status] = (acc[charger.status] || 0) + 1;
      return acc;
    }, {} as Record<ChargerStatus, number>);

    const totalEnergyDelivered = this.chargers.reduce((sum, charger) => 
      sum + charger.totalEnergyDelivered, 0
    );

    const totalSessions = this.chargers.reduce((sum, charger) => 
      sum + charger.totalSessions, 0
    );

    return {
      totalChargers,
      availableChargers: statusCounts.available || 0,
      occupiedChargers: statusCounts.occupied || 0,
      maintenanceChargers: statusCounts.maintenance || 0,
      offlineChargers: statusCounts.offline || 0,
      faultedChargers: statusCounts.faulted || 0,
      totalEnergyDelivered,
      totalSessions,
      averageUtilization: totalChargers > 0 ? 
        ((statusCounts.occupied || 0) / totalChargers) * 100 : 0
    };
  }

  updateChargerStatus(id: string, status: ChargerStatus): ChargerResponse {
    const chargerIndex = this.chargers.findIndex(charger => charger.id === id);
    
    if (chargerIndex === -1) {
      return {
        success: false,
        errors: [{ field: 'id', message: 'Charger not found' }]
      };
    }

    this.chargers[chargerIndex] = {
      ...this.chargers[chargerIndex],
      status,
      updatedAt: new Date()
    };

    return {
      success: true,
      charger: this.chargers[chargerIndex],
      message: 'Charger status updated successfully'
    };
  }
}

export const chargerStorage = new ChargerStorage();

export const chargerService = {
  createCharger: async (chargerData: CreateChargerRequest, createdBy: string): Promise<ChargerResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(chargerStorage.createCharger(chargerData, createdBy));
      }, 800);
    });
  },

  getAllChargers: async (): Promise<ChargerListResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const chargers = chargerStorage.getAllChargers();
        resolve({
          success: true,
          chargers,
          total: chargers.length
        });
      }, 300);
    });
  },

  filterChargers: async (filters: ChargerFilters): Promise<ChargerListResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const chargers = chargerStorage.filterChargers(filters);
        resolve({
          success: true,
          chargers,
          total: chargers.length
        });
      }, 400);
    });
  },

  getChargerById: async (id: string): Promise<ChargerResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const charger = chargerStorage.getChargerById(id);
        if (charger) {
          resolve({
            success: true,
            charger
          });
        } else {
          resolve({
            success: false,
            errors: [{ field: 'id', message: 'Charger not found' }]
          });
        }
      }, 200);
    });
  },

  checkChargerIdAvailability: async (chargerId: string): Promise<{ available: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAvailable = !chargerStorage.isChargerIdTaken(chargerId);
        resolve({ available: isAvailable });
      }, 200);
    });
  },

  checkStationIdAvailability: async (stationId: string): Promise<{ available: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAvailable = !chargerStorage.isStationIdTaken(stationId);
        resolve({ available: isAvailable });
      }, 200);
    });
  },

  getChargerStats: async (): Promise<ChargerStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(chargerStorage.getChargerStats());
      }, 200);
    });
  },

  updateChargerStatus: async (id: string, status: ChargerStatus): Promise<ChargerResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(chargerStorage.updateChargerStatus(id, status));
      }, 300);
    });
  }
};
