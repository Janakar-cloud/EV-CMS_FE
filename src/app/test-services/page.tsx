'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { serviceInitializer, type SystemHealthCheck } from '@/lib/service-initializer';

export default function ServiceTestPage() {
  const [health, setHealth] = useState<SystemHealthCheck | null>(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await serviceInitializer.testAllServices();
      setHealth(result);
      serviceInitializer.printHealthCheck(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
      case 'error':
        return 'text-red-400 bg-red-950/50 border-red-800';
      case 'degraded':
        return 'text-yellow-400 bg-yellow-950/50 border-yellow-800';
      default:
        return 'text-slate-400 bg-slate-800/50 border-slate-700';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-100">
            🔍 Service Health Check
          </h1>

          <div className="mb-6">
            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/50"
            >
              {loading ? '⏳ Testing Services...' : '▶️ Run Health Check'}
            </button>
          </div>

          {health && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className={`p-4 rounded-lg border ${getStatusColor(health.overallStatus)}`}>
                <h2 className="text-xl font-semibold mb-2">
                  Overall Status: {health.overallStatus.toUpperCase()}
                </h2>
                <p className="text-sm opacity-75">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Backend Status */}
              <div className="border border-slate-700 bg-slate-800/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-slate-100">Backend API</h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{health.backend.name}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      health.backend.status
                    )}`}
                  >
                    {health.backend.status === 'healthy' ? '✅ Healthy' : '❌ Error'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{health.backend.message}</p>
                {health.backend.responseTime && (
                  <p className="text-xs text-slate-300 mt-1">
                    Response time: {health.backend.responseTime}ms
                  </p>
                )}
              </div>

              {/* Service Status */}
              {health.services.length > 0 && (
                <div className="border border-slate-700 bg-slate-800/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-slate-100">
                    Services ({health.services.length} tested)
                  </h3>
                  <div className="space-y-2">
                    {health.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-700/50 rounded"
                      >
                        <div className="flex-1">
                          <span className="text-slate-200 font-medium">{service.name}</span>
                          <p className="text-sm text-slate-400">{service.message}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {service.responseTime && (
                            <span className="text-xs text-slate-300">
                              {service.responseTime}ms
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              service.status
                            )}`}
                          >
                            {service.status === 'healthy' ? '✅' : '❌'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {health.overallStatus !== 'healthy' && (
                <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    ⚠️ Recommendations
                  </h3>
                  <ul className="text-sm text-yellow-300/90 space-y-1">
                    {health.backend.status === 'error' && (
                      <>
                        <li>• Start the backend server on port 5000</li>
                        <li>• Check MongoDB connection</li>
                        <li>• Verify backend environment variables</li>
                      </>
                    )}
                    {health.overallStatus === 'degraded' && (
                      <li>• Some services are unavailable - check backend routes</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  🔗 Quick Links
                </h3>
                <div className="space-y-1 text-sm text-emerald-300/90">
                  <p>
                    • Backend Health:{' '}
                    <a
                      href="http://localhost:5000/health"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-emerald-200"
                    >
                      http://localhost:5000/health
                    </a>
                  </p>
                  <p>• Frontend: http://localhost:3001</p>
                  <p>• OCPP Service: ws://localhost:8080</p>
                  <p>• OCPI Service: http://localhost:8081</p>
                </div>
              </div>
            </div>
          )}

          {!health && !loading && (
            <div className="text-center text-slate-400 py-12">
              <p className="text-lg">Click "Run Health Check" to test all services</p>
              <p className="text-sm mt-2 text-slate-300">This will verify backend connectivity and service availability</p>
            </div>
          )}
        </div>

        {/* Service List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold mb-4 text-slate-100">
            📦 Available Services (27 Total)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'api-client',
              'auth-service',
              'charger-service',
              'connector-service',
              'session-service',
              'vehicle-service',
              'user-service',
              'station-service',
              'billing-service ⭐',
              'wallet-service ⭐',
              'location-service ⭐',
              'support-service ⭐',
              'payment-service',
              'pricing-service',
              'booking-service',
              'notification-service',
              'maintenance-service',
              'partner-service',
              'analytics-service',
              'dashboard-service',
              'admin-service',
              'franchise-service',
              'roaming-service',
              'settings-service',
              'socket-service',
              'gun-monitoring-service',
              'ocpp-service',
            ].map((service) => (
              <div key={service} className="bg-slate-900/40 border border-slate-700/50 p-3 rounded">
                <span className="text-sm text-slate-300">✓ {service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
