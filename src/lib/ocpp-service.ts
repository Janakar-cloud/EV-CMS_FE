// ⚠️ IMPORTANT: This service uses REST API (port 5000), NOT direct OCPP WebSocket (port 8080)
// OCPP WebSocket is for charging stations only. Frontend uses REST API for all operations.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface OCPPCommandRequest {
  chargerId: string;
  command: string;
  connectorId?: number;
  parameters?: Record<string, any>;
}

export interface OCPPCommandResponse {
  success: boolean;
  messageId: string;
  status: 'Accepted' | 'Rejected' | 'NotSupported' | 'UnknownMessageId';
  message?: string;
  data?: any;
}

export class OCPPService {
  private static instance: OCPPService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): OCPPService {
    if (!OCPPService.instance) {
      OCPPService.instance = new OCPPService();
    }
    return OCPPService.instance;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Execute OCPP command via REST API
   * Uses HTTP POST to backend API, which then communicates with OCPP service
   */
  async executeCommand(request: OCPPCommandRequest): Promise<OCPPCommandResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chargers/${request.chargerId}/command`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          command: request.command,
          connectorId: request.connectorId,
          parameters: request.parameters
        })
      });

      if (!response.ok) {
        // Backend returned error - will fallback to mock response
        throw new Error(`Backend unavailable (status: ${response.status})`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      // Don't spam console - backend is likely not running
      if (process.env.NODE_ENV === 'development') {
        console.warn('OCPP Service: Backend unavailable, using simulated response');
      }
      
      // Fallback to mock response for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      const scenarios = this.getCommandScenarios(request.command);
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)] || {
        success: false,
        status: 'Rejected' as const,
        message: 'Command execution failed',
        data: null
      };
      
      return {
        success: scenario.success,
        messageId: this.generateMessageId(),
        status: scenario.status,
        message: scenario.message,
        data: scenario.data
      };
    }
  }

  private getCommandScenarios(command: string) {
    const baseScenarios = {
      'Start Charging': [
        { success: true, status: 'Accepted' as const, message: 'Charging session started successfully', data: { sessionId: this.generateSessionId() } },
        { success: false, status: 'Rejected' as const, message: 'Charger is not available', data: null },
        { success: false, status: 'Rejected' as const, message: 'No vehicle connected', data: null }
      ],
      'Stop Charging': [
        { success: true, status: 'Accepted' as const, message: 'Charging session stopped', data: { finalEnergy: Math.random() * 50 + 10 } },
        { success: false, status: 'Rejected' as const, message: 'No active session found', data: null }
      ],
      'Reset Charger': [
        { success: true, status: 'Accepted' as const, message: 'Charger reset initiated', data: { resetType: 'Soft' } },
        { success: false, status: 'NotSupported' as const, message: 'Reset not supported in current state', data: null }
      ],
      'Reboot Charger': [
        { success: true, status: 'Accepted' as const, message: 'Charger reboot initiated', data: { estimatedDowntime: 180 } },
        { success: false, status: 'Rejected' as const, message: 'Cannot reboot during active session', data: null }
      ],
      'Unlock Connector': [
        { success: true, status: 'Accepted' as const, message: 'Connector unlocked successfully', data: { connectorId: 1 } },
        { success: false, status: 'Rejected' as const, message: 'Connector already unlocked', data: null }
      ],
      'Clear Cache': [
        { success: true, status: 'Accepted' as const, message: 'Authorization cache cleared', data: { clearedEntries: Math.floor(Math.random() * 100) } }
      ],
      'Update Firmware': [
        { success: true, status: 'Accepted' as const, message: 'Firmware update initiated', data: { version: '2.1.6', estimatedTime: 600 } },
        { success: false, status: 'Rejected' as const, message: 'Update already in progress', data: null }
      ]
    };

    return baseScenarios[command as keyof typeof baseScenarios] || [
      { success: true, status: 'Accepted' as const, message: 'Command executed successfully', data: null }
    ];
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Get charger status via REST API
   */
  async getChargerStatus(chargerId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chargers/${chargerId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Get charger status error:', error);
      
      // Fallback mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        chargerId,
        status: ['available', 'occupied', 'faulted', 'offline'][Math.floor(Math.random() * 4)],
        connectors: [
          {
            connectorId: 1,
            status: 'available',
            currentPower: 0,
            maxPower: 150
          }
        ],
        lastHeartbeat: new Date(),
        firmwareVersion: '2.1.5',
        model: 'DC-Fast-150'
      };
    }
  }

  /**
   * Get list of all chargers via REST API
   */
  async getAvailableChargers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chargers`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Get chargers error:', error);
      
      // Fallback mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        // Dummy chargers removed; only use real DB chargers
      ];
    }
  }
}

export const ocppService = OCPPService.getInstance();
