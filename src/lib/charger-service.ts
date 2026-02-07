import apiClient, { type AxiosError } from './api-client';
import {
  Charger,
  CreateChargerRequest,
  ChargerResponse,
  ChargerListResponse,
  ChargerValidationError,
  ChargerStatus,
  ChargerFilters,
  ChargerStats,
} from '@/types/charger';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

const toDate = (value: any): Date => {
  if (!value) return new Date(0);
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
};

const normalizeCharger = (raw: any): Charger => {
  const connectorsRaw: any[] = Array.isArray(raw?.connectors) ? raw.connectors : [];

  return {
    id: String(raw?.id ?? raw?._id ?? raw?.chargerId ?? ''),
    chargerId: String(raw?.chargerId ?? raw?.charger_id ?? raw?.id ?? raw?._id ?? ''),
    stationId: String(raw?.stationId ?? raw?.station_id ?? raw?.locationId ?? ''),
    name: String(raw?.name ?? raw?.displayName ?? raw?.chargerId ?? ''),
    description: raw?.description ?? undefined,
    type: (raw?.type ?? 'AC') as any,
    manufacturer: String(raw?.manufacturer ?? raw?.make ?? ''),
    model: String(raw?.model ?? ''),
    serialNumber: String(raw?.serialNumber ?? raw?.serial_number ?? ''),
    firmwareVersion: String(raw?.firmwareVersion ?? raw?.firmware_version ?? ''),
    maxPower: Number(raw?.maxPower ?? raw?.max_power ?? raw?.power ?? 0),
    connectors: connectorsRaw.map((c, idx) => ({
      id: String(c?.id ?? c?._id ?? c?.connectorId ?? idx),
      type: (c?.type ?? 'Type2') as any,
      maxPower: Number(c?.maxPower ?? c?.max_power ?? c?.power ?? 0),
      status: (c?.status ?? raw?.status ?? 'available') as any,
      currentPower: c?.currentPower ?? c?.current_power ?? undefined,
    })),
    status: (raw?.status ?? 'available') as any,
    location: {
      address: String(raw?.location?.address ?? raw?.address ?? ''),
      city: String(raw?.location?.city ?? raw?.city ?? ''),
      state: String(raw?.location?.state ?? raw?.state ?? ''),
      zipCode: String(
        raw?.location?.zipCode ?? raw?.location?.postalCode ?? raw?.zipCode ?? raw?.postalCode ?? ''
      ),
      country: String(raw?.location?.country ?? raw?.country ?? ''),
      latitude: raw?.location?.latitude ?? raw?.coordinates?.latitude ?? raw?.lat ?? undefined,
      longitude: raw?.location?.longitude ?? raw?.coordinates?.longitude ?? raw?.lng ?? undefined,
    },
    installationDate: toDate(
      raw?.installationDate ?? raw?.installation_date ?? raw?.createdAt ?? raw?.created_at
    ),
    lastMaintenanceDate: raw?.lastMaintenanceDate ? toDate(raw.lastMaintenanceDate) : undefined,
    nextMaintenanceDate: raw?.nextMaintenanceDate ? toDate(raw.nextMaintenanceDate) : undefined,
    totalEnergyDelivered: Number(
      raw?.totalEnergyDelivered ?? raw?.total_energy_delivered ?? raw?.energyDelivered ?? 0
    ),
    totalSessions: Number(raw?.totalSessions ?? raw?.total_sessions ?? raw?.sessions ?? 0),
    isActive: Boolean(raw?.isActive ?? raw?.active ?? true),
    createdAt: toDate(raw?.createdAt ?? raw?.created_at),
    updatedAt: toDate(raw?.updatedAt ?? raw?.updated_at),
    createdBy: String(raw?.createdBy ?? raw?.created_by ?? ''),
  };
};

const buildValidationErrors = (error: unknown): ChargerValidationError[] => {
  const axiosError = error as AxiosError<any> | undefined;
  const data = axiosError?.response?.data as any;

  const errors: ChargerValidationError[] = [];

  const fieldErrors = data?.errors ?? data?.data?.errors;
  if (Array.isArray(fieldErrors)) {
    for (const e of fieldErrors) {
      if (e?.field && e?.message) {
        errors.push({ field: String(e.field), message: String(e.message) });
      }
    }
  }

  const details = data?.details ?? data?.data?.details;
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    for (const [field, message] of Object.entries(details)) {
      if (typeof message === 'string') {
        errors.push({ field, message });
      }
    }
  }

  if (errors.length === 0) {
    const message = data?.message ?? (axiosError as any)?.message ?? 'Validation failed';
    errors.push({ field: 'form', message: String(message) });
  }

  return errors;
};

const computeStatsFromChargers = (chargers: Charger[]): ChargerStats => {
  const totalChargers = chargers.length;
  const statusCounts = chargers.reduce(
    (acc, charger) => {
      const key = charger.status as ChargerStatus;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<ChargerStatus, number>
  );

  const totalEnergyDelivered = chargers.reduce(
    (sum, charger) => sum + (charger.totalEnergyDelivered ?? 0),
    0
  );
  const totalSessions = chargers.reduce((sum, charger) => sum + (charger.totalSessions ?? 0), 0);

  return {
    totalChargers,
    availableChargers: statusCounts.available || 0,
    occupiedChargers: statusCounts.occupied || 0,
    maintenanceChargers: statusCounts.maintenance || 0,
    offlineChargers: statusCounts.offline || 0,
    faultedChargers: statusCounts.faulted || 0,
    totalEnergyDelivered,
    totalSessions,
    averageUtilization:
      totalChargers > 0 ? ((statusCounts.occupied || 0) / totalChargers) * 100 : 0,
  };
};

async function tryRequest<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export const chargerService = {
  createCharger: async (
    chargerData: CreateChargerRequest,
    createdBy: string
  ): Promise<ChargerResponse> => {
    try {
      const payload = await apiClient.post('/chargers', {
        ...chargerData,
        createdBy,
      });

      const unwrapped = unwrap<any>(payload);
      const chargerRaw =
        unwrapped?.charger ?? unwrapped?.data?.charger ?? unwrapped?.data ?? unwrapped;
      const charger = normalizeCharger(chargerRaw);

      return {
        success: true,
        charger,
        message: unwrapped?.message ?? 'Charger created',
      };
    } catch (error) {
      return {
        success: false,
        errors: buildValidationErrors(error),
      };
    }
  },

  getAllChargers: async (): Promise<ChargerListResponse> => {
    const payload = await apiClient.get('/chargers');
    const unwrapped = unwrap<any>(payload);

    const list = (unwrapped?.chargers ?? unwrapped?.items ?? unwrapped?.data ?? unwrapped) as any[];
    const chargers = (Array.isArray(list) ? list : []).map(normalizeCharger);
    const total = Number(unwrapped?.total ?? chargers.length);

    return {
      success: true,
      chargers,
      total,
      message: unwrapped?.message,
    };
  },

  filterChargers: async (filters: ChargerFilters): Promise<ChargerListResponse> => {
    const params: Record<string, any> = {};

    if (filters.searchQuery) params.q = filters.searchQuery;
    if (filters.location) params.location = filters.location;
    if (filters.manufacturer) params.manufacturer = filters.manufacturer;
    if (filters.status?.length) params.status = filters.status.join(',');
    if (filters.type?.length) params.type = filters.type.join(',');

    const payload = await apiClient.get('/chargers', { params });
    const unwrapped = unwrap<any>(payload);

    const list = (unwrapped?.chargers ?? unwrapped?.items ?? unwrapped?.data ?? unwrapped) as any[];
    const chargers = (Array.isArray(list) ? list : []).map(normalizeCharger);
    const total = Number(unwrapped?.total ?? chargers.length);

    return {
      success: true,
      chargers,
      total,
      message: unwrapped?.message,
    };
  },

  getChargerById: async (id: string): Promise<ChargerResponse> => {
    try {
      const payload = await apiClient.get(`/chargers/${id}`);
      const unwrapped = unwrap<any>(payload);
      const chargerRaw = unwrapped?.charger ?? unwrapped?.data ?? unwrapped;

      return {
        success: true,
        charger: normalizeCharger(chargerRaw),
      };
    } catch {
      return {
        success: false,
        errors: [{ field: 'id', message: 'Charger not found' }],
      };
    }
  },

  checkChargerIdAvailability: async (chargerId: string): Promise<{ available: boolean }> => {
    const byParam = await tryRequest(() => apiClient.get('/chargers', { params: { chargerId } }));
    const unwrapped = byParam ? unwrap<any>(byParam) : null;
    const list = unwrapped
      ? (unwrapped?.chargers ?? unwrapped?.items ?? unwrapped?.data ?? unwrapped)
      : null;
    if (Array.isArray(list)) {
      const taken = list.some(
        c => String(c?.chargerId ?? c?.charger_id ?? '').toLowerCase() === chargerId.toLowerCase()
      );
      return { available: !taken };
    }

    const all = await chargerService.getAllChargers();
    const taken = all.chargers.some(c => c.chargerId.toLowerCase() === chargerId.toLowerCase());
    return { available: !taken };
  },

  checkStationIdAvailability: async (stationId: string): Promise<{ available: boolean }> => {
    const byParam = await tryRequest(() => apiClient.get('/chargers', { params: { stationId } }));
    const unwrapped = byParam ? unwrap<any>(byParam) : null;
    const list = unwrapped
      ? (unwrapped?.chargers ?? unwrapped?.items ?? unwrapped?.data ?? unwrapped)
      : null;
    if (Array.isArray(list)) {
      const taken = list.some(
        c => String(c?.stationId ?? c?.station_id ?? '').toLowerCase() === stationId.toLowerCase()
      );
      return { available: !taken };
    }

    const all = await chargerService.getAllChargers();
    const taken = all.chargers.some(c => c.stationId.toLowerCase() === stationId.toLowerCase());
    return { available: !taken };
  },

  getChargerStats: async (): Promise<ChargerStats> => {
    const statsPayload = await tryRequest(() => apiClient.get('/chargers/stats'));
    if (statsPayload) {
      const unwrapped = unwrap<any>(statsPayload);
      const stats = unwrapped?.stats ?? unwrapped?.data ?? unwrapped;
      if (stats && typeof stats === 'object') {
        return {
          totalChargers: Number(stats.totalChargers ?? stats.total ?? 0),
          availableChargers: Number(stats.availableChargers ?? stats.available ?? 0),
          occupiedChargers: Number(stats.occupiedChargers ?? stats.occupied ?? 0),
          maintenanceChargers: Number(stats.maintenanceChargers ?? stats.maintenance ?? 0),
          offlineChargers: Number(stats.offlineChargers ?? stats.offline ?? 0),
          faultedChargers: Number(stats.faultedChargers ?? stats.faulted ?? 0),
          totalEnergyDelivered: Number(stats.totalEnergyDelivered ?? stats.energyDelivered ?? 0),
          totalSessions: Number(stats.totalSessions ?? stats.sessions ?? 0),
          averageUtilization: Number(stats.averageUtilization ?? stats.utilization ?? 0),
        };
      }
    }

    const all = await chargerService.getAllChargers();
    return computeStatsFromChargers(all.chargers);
  },

  updateChargerStatus: async (id: string, status: ChargerStatus): Promise<ChargerResponse> => {
    const attempt1 = await tryRequest(() => apiClient.patch(`/chargers/${id}/status`, { status }));
    const attempt2 = attempt1
      ? attempt1
      : await tryRequest(() => apiClient.put(`/chargers/${id}/status`, { status }));
    const attempt3 = attempt2
      ? attempt2
      : await tryRequest(() => apiClient.patch(`/chargers/${id}`, { status }));

    if (!attempt3) {
      return {
        success: false,
        errors: [{ field: 'status', message: 'Failed to update charger status' }],
      };
    }

    const unwrapped = unwrap<any>(attempt3);
    const chargerRaw = unwrapped?.charger ?? unwrapped?.data ?? unwrapped;

    return {
      success: true,
      charger: normalizeCharger(chargerRaw),
      message: unwrapped?.message ?? 'Charger status updated',
    };
  },

  updateCharger: async (
    id: string,
    chargerData: Partial<CreateChargerRequest>
  ): Promise<ChargerResponse> => {
    try {
      const payload = await apiClient.put(`/chargers/${id}`, chargerData);
      const unwrapped = unwrap<any>(payload);
      const chargerRaw =
        unwrapped?.charger ?? unwrapped?.data?.charger ?? unwrapped?.data ?? unwrapped;

      return {
        success: true,
        charger: normalizeCharger(chargerRaw),
        message: unwrapped?.message ?? 'Charger updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        errors: buildValidationErrors(error),
      };
    }
  },

  deleteCharger: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const payload = await apiClient.delete(`/chargers/${id}`);
      const unwrapped = unwrap<any>(payload);
      return {
        success: true,
        message: unwrapped?.message ?? 'Charger deleted successfully',
      };
    } catch (error) {
      const axiosError = error as AxiosError<any> | undefined;
      const message = axiosError?.response?.data?.message ?? 'Failed to delete charger';
      return {
        success: false,
        message,
      };
    }
  },
};

export default chargerService;
