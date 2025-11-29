/**
 * Correct OCPP Integration Example
 * 
 * ✅ CORRECT: Uses REST API (port 5000) for charger operations
 * ✅ CORRECT: Uses Socket.IO (port 5000) for real-time updates
 * ❌ WRONG: Never connects directly to OCPP WebSocket (port 8080)
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
   * ✅ CORRECT: Fetch chargers via REST API
   */
  const loadChargers = async () => {
    setLoading(true);
    try {
      const data = await ocppService.getAvailableChargers();
      setChargers(data);
      console.log('✅ Loaded chargers via REST API:', data);
    } catch (error) {
      console.error('❌ Error loading chargers:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ CORRECT: Execute command via REST API
   */
  const executeCommand = async (chargerId: string, command: string) => {
    setLoading(true);
    setCommandResult('');
    try {
      const result = await ocppService.executeCommand({
        chargerId,
        command,
        connectorId: 1
      });
      
      const message = result.success 
        ? `✅ ${command} - ${result.message}`
        : `❌ ${command} - ${result.message}`;
      
      setCommandResult(message);
      console.log('Command result:', result);
      
      // Reload chargers to see updated status
      setTimeout(loadChargers, 1000);
    } catch (error) {
      console.error('❌ Command error:', error);
      setCommandResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Socket.IO: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {isConnected 
            ? '✅ Real-time updates active via Socket.IO (port 5000)'
            : '❌ Not connected to real-time updates'}
        </p>
      </div>

      {/* Charger List */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chargers</h2>
          <button
            onClick={loadChargers}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {chargers.length === 0 ? (
          <p className="text-gray-500">No chargers found. Make sure backend is running on port 5000.</p>
        ) : (
          <div className="space-y-2">
            {chargers.map(charger => (
              <div
                key={charger.id}
                className={`border rounded p-4 cursor-pointer transition ${
                  selectedCharger === charger.chargerId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCharger(charger.chargerId)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{charger.name}</h3>
                    <p className="text-sm text-gray-600">ID: {charger.chargerId}</p>
                    <p className="text-sm text-gray-600">Location: {charger.location}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
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
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Remote Commands:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Start Charging');
                        }}
                        disabled={loading}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300"
                      >
                        Start Charging
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Stop Charging');
                        }}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300"
                      >
                        Stop Charging
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Reset Charger');
                        }}
                        disabled={loading}
                        className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:bg-gray-300"
                      >
                        Reset
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeCommand(charger.chargerId, 'Unlock Connector');
                        }}
                        disabled={loading}
                        className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:bg-gray-300"
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
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm font-mono">{commandResult}</p>
          </div>
        )}
      </div>

      {/* Real-time Updates */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Real-time Updates</h2>
          <button
            onClick={clearNotifications}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet. Real-time events will appear here.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded border-l-4 ${
                  notification.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : notification.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : notification.type === 'error'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charger Status Updates */}
      {chargerUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Status Updates</h2>
          <div className="space-y-2">
            {chargerUpdates.slice(0, 5).map((update, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                <span className="font-semibold">{update.chargerId}</span>
                {' → '}
                <span className="capitalize">{update.status}</span>
                {' '}
                <span className="text-gray-500">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">✅ Correct Integration Pattern</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Uses REST API (port 5000) for charger operations</li>
          <li>• Uses Socket.IO (port 5000) for real-time updates</li>
          <li>• Never connects directly to OCPP WebSocket (port 8080)</li>
          <li>• Backend handles OCPP protocol with charging stations</li>
        </ul>
      </div>

      {/* Browser Console Test Commands */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">🧪 Test in Browser Console</h3>
        <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
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
