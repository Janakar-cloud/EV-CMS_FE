import { API_CONFIG } from '@/config/constants';

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
  private wsConnection: WebSocket | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.OCPP_URL;
  }

  public static getInstance(): OCPPService {
    if (!OCPPService.instance) {
      OCPPService.instance = new OCPPService();
    }
    return OCPPService.instance;
  }

  async executeCommand(request: OCPPCommandRequest): Promise<OCPPCommandResponse> {
    console.log(`Executing OCPP command: ${request.command} on charger: ${request.chargerId}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const scenarios = this.getCommandScenarios(request.command);
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      success: scenario.success,
      messageId: this.generateMessageId(),
      status: scenario.status,
      message: scenario.message,
      data: scenario.data
    };
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

  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(`ws://localhost:8080/ocpp/ws`);
        
        this.wsConnection.onopen = () => {
          console.log('OCPP WebSocket connected');
          resolve();
        };
        
        this.wsConnection.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('OCPP WebSocket message:', data);
        };
        
        this.wsConnection.onerror = (error) => {
          console.error('OCPP WebSocket error:', error);
          reject(error);
        };
        
        this.wsConnection.onclose = () => {
          console.log('OCPP WebSocket disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  async getChargerStatus(chargerId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      chargerId,
      status: ['Available', 'Occupied', 'Faulted', 'Offline'][Math.floor(Math.random() * 4)],
      connectors: [
        {
          connectorId: 1,
          status: 'Available',
          currentPower: 0,
          maxPower: 150
        }
      ],
      lastHeartbeat: new Date(),
      firmwareVersion: '2.1.5',
      model: 'DC-Fast-150'
    };
  }

  async getAvailableChargers(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { id: '1', name: 'Phoenix Mall - DC01', status: 'Available', location: 'Bangalore' },
      { id: '2', name: 'Tech Park - AC01', status: 'Occupied', location: 'Bangalore' },
      { id: '3', name: 'Highway Plaza - DC02', status: 'Faulted', location: 'Bangalore' },
      { id: '4', name: 'Mall Road - AC02', status: 'Available', location: 'Bangalore' },
      { id: '5', name: 'Airport Terminal - DC03', status: 'Available', location: 'Bangalore' }
    ];
  }
}

export const ocppService = OCPPService.getInstance();
