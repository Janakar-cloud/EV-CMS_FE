/**
 * Service Initializer & Health Check
 * Tests all services and verifies backend connectivity
 */

import apiClient from './api-client';
import authService from './auth-service';
import chargerService from './charger-service';
import { connectorService } from './connector-service';
import sessionService from './session-service';
import vehicleService from './vehicle-service';
import billingService from './billing-service';
import walletService from './wallet-service';
import locationService from './location-service';
import notificationService from './notification-service';
import maintenanceService from './maintenance-service';
import supportService from './support-service';
import userService from './user-service';
import stationService from './station-service';
import paymentService from './payment-service';
import pricingService from './pricing-service';
import bookingService from './booking-service';
import partnerService from './partner-service';
import analyticsService from './analytics-service';
import dashboardService from './dashboard-service';
import adminService from './admin-service';
import franchiseService from './franchise-service';
import roamingService from './roaming-service';
import settingsService from './settings-service';

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'error' | 'untested';
  message?: string;
  responseTime?: number;
}

export interface SystemHealthCheck {
  backend: ServiceStatus;
  services: ServiceStatus[];
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'down';
}

class ServiceInitializer {
  /**
   * Check backend health
   */
  async checkBackendHealth(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const data = await apiClient.get('/health');
      const responseTime = Date.now() - start;

      if (data.success && data.mongodb === 'connected') {
        return {
          name: 'Backend API',
          status: 'healthy',
          message: `Connected (${responseTime}ms)`,
          responseTime,
        };
      } else {
        return {
          name: 'Backend API',
          status: 'error',
          message: 'Backend unhealthy or MongoDB disconnected',
        };
      }
    } catch (error: any) {
      return {
        name: 'Backend API',
        status: 'error',
        message: error.message || 'Cannot connect to backend',
      };
    }
  }

  /**
   * Test all services
   */
  async testAllServices(): Promise<SystemHealthCheck> {
    console.log('Starting service health check...');

    const backendStatus = await this.checkBackendHealth();
    const services: ServiceStatus[] = [];

    // If backend is down, skip service tests
    if (backendStatus.status === 'error') {
      console.error('Backend is down. Skipping service tests.');
      return {
        backend: backendStatus,
        services: [],
        timestamp: new Date().toISOString(),
        overallStatus: 'down',
      };
    }

    // Test each service (non-authenticated endpoints)
    const serviceTests = [
      // Core services
      {
        name: 'Charger Service',
        test: async () => {
          try {
            await chargerService.getAllChargers();
            return { success: true, message: 'Connected' };
          } catch (error: any) {
            // 401 means endpoint exists but needs auth - that's OK
            if (error.response?.status === 401) {
              return { success: true, message: 'Endpoint exists (requires auth)' };
            }
            throw error;
          }
        },
      },
      {
        name: 'Session Service',
        test: async () => {
          try {
            await sessionService.getSessions();
            return { success: true, message: 'Connected' };
          } catch (error: any) {
            if (error.response?.status === 401) {
              return { success: true, message: 'Endpoint exists (requires auth)' };
            }
            throw error;
          }
        },
      },
      {
        name: 'Station Service',
        test: async () => {
          try {
            await stationService.listStations();
            return { success: true, message: 'Connected' };
          } catch (error: any) {
            if (error.response?.status === 401) {
              return { success: true, message: 'Endpoint exists (requires auth)' };
            }
            throw error;
          }
        },
      },
      {
        name: 'Dashboard Service',
        test: async () => {
          try {
            await dashboardService.getTodayStats();
            return { success: true, message: 'Connected' };
          } catch (error: any) {
            if (error.response?.status === 401) {
              return { success: true, message: 'Endpoint exists (requires auth)' };
            }
            throw error;
          }
        },
      },
    ];

    // Run tests
    for (const serviceTest of serviceTests) {
      const start = Date.now();
      try {
        const result = await serviceTest.test();
        const responseTime = Date.now() - start;
        services.push({
          name: serviceTest.name,
          status: 'healthy',
          message: result.message,
          responseTime,
        });
        console.log(`${serviceTest.name}: ${result.message} (${responseTime}ms)`);
      } catch (error: any) {
        services.push({
          name: serviceTest.name,
          status: 'error',
          message: error.message || 'Test failed',
        });
        console.error(`${serviceTest.name}: ${error.message}`);
      }
    }

    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const overallStatus =
      healthyCount === services.length ? 'healthy' : healthyCount > 0 ? 'degraded' : 'down';

    return {
      backend: backendStatus,
      services,
      timestamp: new Date().toISOString(),
      overallStatus,
    };
  }

  /**
   * Print health check results
   */
  printHealthCheck(health: SystemHealthCheck) {
    console.log('\n===== SYSTEM HEALTH CHECK =====');
    console.log(`Timestamp: ${health.timestamp}`);
    console.log(
      `Backend: ${health.backend.status === 'healthy' ? 'OK' : 'ERROR'} ${health.backend.message}`
    );
    console.log(`\nServices (${health.services.length} tested):`);

    health.services.forEach(service => {
      console.log(
        `${service.status === 'healthy' ? 'OK' : 'ERROR'} ${service.name}: ${service.message}${
          service.responseTime ? ` (${service.responseTime}ms)` : ''
        }`
      );
    });

    console.log(`\nOverall Status: ${health.overallStatus.toUpperCase()}`);
    console.log('================================\n');
  }

  /**
   * Get all available services
   */
  getAllServices() {
    return {
      // Core
      apiClient,
      authService,
      chargerService,
      connectorService,
      sessionService,
      vehicleService,
      userService,
      stationService,

      // Billing & Payments
      billingService,
      walletService,
      paymentService,
      pricingService,

      // Operations
      locationService,
      notificationService,
      maintenanceService,
      supportService,
      bookingService,

      // Advanced
      partnerService,
      analyticsService,
      dashboardService,
      adminService,
      franchiseService,
      roamingService,
      settingsService,
    };
  }

  /**
   * Initialize all services (for dev/testing)
   */
  async initialize() {
    console.log('Initializing EV CMS Services...\n');

    const health = await this.testAllServices();
    this.printHealthCheck(health);

    if (health.overallStatus === 'down') {
      console.error('System is DOWN. Please start the backend server.');
      console.log('\nBackend startup instructions:');
      console.log('   1. Navigate to backend directory');
      console.log('   2. Run: npm run dev');
      console.log('   3. Backend should start on: http://localhost:5000\n');
      return false;
    }

    if (health.overallStatus === 'degraded') {
      console.warn('System is DEGRADED. Some services are unavailable.');
    }

    if (health.overallStatus === 'healthy') {
      console.log('All systems operational!');
    }

    console.log('\nAvailable Services:');
    const services = this.getAllServices();
    Object.keys(services).forEach(name => {
      console.log(`   • ${name}`);
    });

    return true;
  }
}

export const serviceInitializer = new ServiceInitializer();
export default serviceInitializer;
