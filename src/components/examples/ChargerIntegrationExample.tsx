/**
 * Correct OCPP Integration Example
 *
 * CORRECT: Uses REST API (port 5000) for charger operations
 * CORRECT: Uses Socket.IO (port 5000) for real-time updates
 * WRONG: Never connects directly to OCPP WebSocket (port 8080)
 *
 * Architecture:
 * Browser → REST API (5000) → OCPP Service (8080) → Charger
 * Browser ← Socket.IO (5000) ← Real-time events ← OCPP Service
 */

'use client';

import { useState, useEffect } from 'react';
import { ocppService } from '@/lib/ocpp-service';
import { useChargerSocket } from '@/hooks/useChargerSocket';

interface Charger {
  id: string;
  chargerId: string;
  name: string;
  status: string;
  location: string;
}

export default function ChargerIntegrationExample() {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<string>('');

  // Socket.IO for real-time updates
  const { isConnected, chargerUpdates, notifications, clearNotifications } = useChargerSocket();

  // Load chargers on mount
  useEffect(() => {
    loadChargers();
  }, []);

  /**
   * CORRECT: Fetch chargers via REST API
   */
  const loadChargers = async () => {
    setLoading(true);
    try {
      const data = await ocppService.getAvailableChargers();
      setChargers(data);
      console.log('Loaded chargers via REST API:', data);
    } catch (error) {
      console.error('Error loading chargers:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CORRECT: Execute command via REST API
   */
  const executeCommand = async (chargerId: string, command: string) => {
    setLoading(true);
    setCommandResult('');
    try {
      const result = await ocppService.executeCommand({
        chargerId,
        command,
        connectorId: 1,
      });

      const message = result.success
        ? `${command} - ${result.message}`
        : `${command} - ${result.message}`;

      setCommandResult(message);
      console.log('Command result:', result);

      // Reload chargers to see updated status
      setTimeout(loadChargers, 1000);
    } catch (error) {
      console.error('Command error:', error);
      setCommandResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Connection Status */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold">Connection Status</h2>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Socket.IO: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {isConnected
            ? 'Real-time updates active via Socket.IO (port 5000)'
            : 'Not connected to real-time updates'}
        </p>
      </div>

      {/* Charger List */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chargers</h2>
          <button
            onClick={loadChargers}
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {chargers.length === 0 ? (
          <p className="text-gray-500">
            No chargers found. Make sure backend is running on port 5000.
          </p>
        ) : (
          <div className="space-y-2">
            {chargers.map(charger => (
              <div
                key={charger.id}
                className={`cursor-pointer rounded border p-4 transition ${
                  selectedCharger === charger.chargerId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCharger(charger.chargerId)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{charger.name}</h3>
                    <p className="text-sm text-gray-600">ID: {charger.chargerId}</p>
                    <p className="text-sm text-gray-600">Location: {charger.location}</p>
                  </div>
                  <span
                    className={`rounded px-3 py-1 text-sm ${
                      charger.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : charger.status === 'occupied'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {charger.status}
                  </span>
                </div>

                {selectedCharger === charger.chargerId && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-sm font-semibold">Remote Commands:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Start Charging');
                        }}
                        disabled={loading}
                        className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 disabled:bg-gray-300"
                      >
                        Start Charging
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Stop Charging');
                        }}
                        disabled={loading}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 disabled:bg-gray-300"
                      >
                        Stop Charging
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Reset Charger');
                        }}
                        disabled={loading}
                        className="rounded bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600 disabled:bg-gray-300"
                      >
                        Reset
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Unlock Connector');
                        }}
                        disabled={loading}
                        className="rounded bg-purple-500 px-3 py-1 text-sm text-white hover:bg-purple-600 disabled:bg-gray-300"
                      >
                        Unlock
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {commandResult && (
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3">
            <p className="font-mono text-sm">{commandResult}</p>
          </div>
        )}
      </div>

      {/* Real-time Updates */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Real-time Updates</h2>
          <button
            onClick={clearNotifications}
            className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">
            No notifications yet. Real-time events will appear here.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`rounded border-l-4 p-3 ${
                  notification.type === 'success'
                    ? 'border-green-500 bg-green-50'
                    : notification.type === 'warning'
                      ? 'border-yellow-500 bg-yellow-50'
                      : notification.type === 'error'
                        ? 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                }`}
              >
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charger Status Updates */}
      {chargerUpdates.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">Recent Status Updates</h2>
          <div className="space-y-2">
            {chargerUpdates.slice(0, 5).map((update, idx) => (
              <div key={idx} className="rounded bg-gray-50 p-2 text-sm">
                <span className="font-semibold">{update.chargerId}</span>
                {' → '}
                <span className="capitalize">{update.status}</span>{' '}
                <span className="text-gray-500">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Notes */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">Correct Integration Pattern</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Uses REST API (port 5000) for charger operations</li>
          <li>• Uses Socket.IO (port 5000) for real-time updates</li>
          <li>• Never connects directly to OCPP WebSocket (port 8080)</li>
          <li>• Backend handles OCPP protocol with charging stations</li>
        </ul>
      </div>

      {/* Browser Console Test Commands */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">Test in Browser Console</h3>
        <pre className="overflow-x-auto rounded bg-white p-3 text-xs">
          {`// Test authentication
const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@evcms.com',
    password: 'password123'
  })
});
const { data } = await loginResponse.json();
localStorage.setItem('token', data.token);

// Test charger listing
const chargersResponse = await fetch('http://localhost:5000/api/v1/chargers', {
  headers: { 'Authorization': \`Bearer \${data.token}\` }
});
const chargers = await chargersResponse.json();
console.log('Chargers:', chargers);`}
        </pre>
      </div>
    </div>
  );
}
