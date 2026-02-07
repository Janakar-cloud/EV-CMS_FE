import apiClient from './api-client';

export interface StationVerification {
  id: string;
  stationId: string;
  name: string;
  address: string;
  city: string;
  ownerName: string;
  ownerEmail: string;
  documents: string[];
  status: string;
  submittedAt: string;
}

export interface StationDetail extends StationVerification {
  state?: string;
  connectors: { type: string; power: number; count: number }[];
}

export interface StationVerificationListResult {
  stations: StationVerification[];
}

class AdminStationsService {
  private static readonly API_BASE = '/admin/stations';

  async listPendingVerifications(): Promise<StationVerificationListResult> {
    const data = await apiClient.get<any>(`${AdminStationsService.API_BASE}/verification`, {
      params: { status: 'pending' },
    });
    const raw = data?.stations ?? data?.data ?? data ?? [];
    const stations: StationVerification[] = Array.isArray(raw) ? raw : [];
    return { stations };
  }

  async updateVerification(id: string, approved: boolean): Promise<void> {
    await apiClient.patch(`${AdminStationsService.API_BASE}/verification/${id}`, {
      status: approved ? 'approved' : 'rejected',
    });
  }

  async getStation(id: string): Promise<StationDetail> {
    const data = await apiClient.get<any>(`${AdminStationsService.API_BASE}/${id}`);
    return (data as StationDetail) ?? null;
  }

  async verifyStation(id: string, approved: boolean): Promise<void> {
    await apiClient.patch(`${AdminStationsService.API_BASE}/${id}/verify`, {
      status: approved ? 'approved' : 'rejected',
    });
  }
}

export const adminStationsService = new AdminStationsService();
export default adminStationsService;
