'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { formatTime } from '@/lib/time-utils';
import { BoltIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { chargerService } from '@/lib/charger-service';
import { Charger } from '@/types/charger';

interface OCPPCommand {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'stop' | 'reset' | 'reboot' | 'unlock' | 'cache' | 'firmware';
  status: 'idle' | 'sending' | 'success' | 'error';
  color: string;
}

export default function ChargerControlPage() {
  const [selectedCharger, setSelectedCharger] = useState<string>('');
  const [commands, setCommands] = useState<OCPPCommand[]>([
    {
      id: 'start',
      name: 'Start Charging',
      description: 'Begin charging session on selected connector',
      type: 'start',
      status: 'idle',
      color: 'btn-success'
    },
    {
      id: 'stop',
      name: 'Stop Charging',
      description: 'Terminate active charging session',
      type: 'stop',
      status: 'idle',
      color: 'btn-warning'
    },
    {
      id: 'reset',
      name: 'Reset Charger',
      description: 'Soft reset of charger system',
      type: 'reset',
      status: 'idle',
      color: 'btn-secondary'
    },
    {
      id: 'reboot',
      name: 'Reboot Charger',
      description: 'Hard reboot of charger hardware',
      type: 'reboot',
      status: 'idle',
      color: 'btn-danger'
    }
  ]);

  const [commandHistory, setCommandHistory] = useState<Array<{
    id: string;
    command: string;
    charger: string;
    timestamp: Date;
    status: 'success' | 'error';
    response?: string;
  }>>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargersLoading, setChargersLoading] = useState(true);
  const [chargersError, setChargersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChargers = async () => {
      setChargersLoading(true);
      try {
        const data = await chargerService.getAllChargers();
        setChargers(data.chargers);
        setChargersError(null);
        setSelectedCharger(prev => prev || data.chargers[0]?.id || '');
      } catch (err) {
        setChargersError('Unable to load chargers from the backend');
      } finally {
        setChargersLoading(false);
      }
    };

    fetchChargers();
  }, []);

  const executeOCPPCommand = async (commandId: string) => {
    if (!selectedCharger) {
      alert('Please select a charger first');
      return;
    }

    const command = commands.find(c => c.id === commandId);
    if (!command) return;

    setCommands(prev => prev.map(c => 
      c.id === commandId ? { ...c, status: 'sending' } : c
    ));

    try {
      const { ocppService } = await import('@/lib/ocpp-service');
      
      const result = await ocppService.executeCommand({
        chargerId: selectedCharger,
        command: command.name,
        connectorId: 1
      });

      if (result.success) {
        setCommands(prev => prev.map(c => 
          c.id === commandId ? { ...c, status: 'success' } : c
        ));

        const selectedChargerName = getChargerDisplayName(selectedCharger);
        setCommandHistory(prev => [
          {
            id: result.messageId,
            command: command.name,
            charger: selectedChargerName,
            timestamp: new Date(),
            status: 'success',
            response: result.message || `${command.name} executed successfully`
          },
          ...prev.slice(0, 9)
        ]);

        setTimeout(() => {
          setCommands(prev => prev.map(c => 
            c.id === commandId ? { ...c, status: 'idle' } : c
          ));
        }, 3000);
      } else {
        throw new Error(result.message || 'Command execution failed');
      }
    } catch (error: any) {
      setCommands(prev => prev.map(c => 
        c.id === commandId ? { ...c, status: 'error' } : c
      ));

        const selectedChargerName = getChargerDisplayName(selectedCharger);
      setCommandHistory(prev => [
        {
          id: Date.now().toString(),
          command: command.name,
          charger: selectedChargerName,
          timestamp: new Date(),
          status: 'error',
          response: error.message || `Failed to execute ${command.name}`
        },
        ...prev.slice(0, 9)
      ]);

      setTimeout(() => {
        setCommands(prev => prev.map(c => 
          c.id === commandId ? { ...c, status: 'idle' } : c
        ));
      }, 3000);
    }
  };

  const getCommandIcon = (status: OCPPCommand['status']) => {
    switch (status) {
      case 'sending':
        return <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <BoltIcon className="h-4 w-4" />;
    }
  };

  const getChargerDisplayName = (chargerId: string) => {
    return chargers.find((charger) => charger.id === chargerId)?.name || 'Unknown charger';
  };

  const getChargerStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-emerald-950/50 border border-emerald-800 text-emerald-400';
      case 'occupied':
        return 'bg-yellow-950/50 border border-yellow-800 text-yellow-400';
      case 'maintenance':
        return 'bg-orange-950/50 border border-orange-800 text-orange-400';
      case 'offline':
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
      case 'fault':
      case 'faulted':
        return 'bg-red-950/50 border border-red-800 text-red-400';
      case 'reserved':
        return 'bg-blue-950/50 border border-blue-800 text-blue-400';
      default:
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">OCPP Control Panel</h1>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-400">OCPP Service Online</span>
          </div>
        </div>

        {/* Charger Selection */}
        <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Select Charger</h2>
          {chargersLoading ? (
            <div className="py-8 text-sm text-slate-400 text-center">Loading chargers...</div>
          ) : chargersError ? (
            <div className="py-4 text-sm text-red-400 text-center">{chargersError}</div>
          ) : chargers.length === 0 ? (
            <div className="py-4 text-sm text-slate-400 text-center">No chargers found in the backend.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chargers.map((charger) => (
                <div
                  key={charger.id}
                  onClick={() => setSelectedCharger(charger.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCharger === charger.id
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-100">
                      {charger.stationId ? `${charger.stationId} • ${charger.name}` : charger.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getChargerStatusBadgeClass(charger.status)}`}>
                      {charger.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {charger.location.city || 'Unknown location'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* OCPP Commands */}
        <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">OCPP Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => executeOCPPCommand('start')}
              disabled={!selectedCharger}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/50"
            >
              <span>⚡ Start Charging</span>
            </button>
            <button
              onClick={() => executeOCPPCommand('stop')}
              disabled={!selectedCharger}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-lg shadow-orange-900/50"
            >
              <span>⏹️ Stop Charging</span>
            </button>
            <button
              onClick={() => executeOCPPCommand('reset')}
              disabled={!selectedCharger}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/50"
            >
              <span>🔄 Reset Charger</span>
            </button>
            <button
              onClick={() => executeOCPPCommand('reboot')}
              disabled={!selectedCharger}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/50"
            >
              <span>🔌 Reboot Charger</span>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {commands.map((command) => (
              <div key={`desc-${command.id}`} className="text-slate-300">
                <strong className="text-slate-100">{command.name}:</strong> <span className="text-slate-400">{command.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Commands */}
        <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Advanced Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-100">Unlock Connector</h3>
              <p className="text-sm text-slate-400 mt-1">Manually unlock stuck connector</p>
              <button 
                onClick={() => executeOCPPCommand('unlock')}
                disabled={!selectedCharger}
                className="btn btn-primary mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Execute Unlock
              </button>
            </div>
            <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-100">Clear Cache</h3>
              <p className="text-sm text-slate-400 mt-1">Clear charger authorization cache</p>
              <button 
                onClick={() => executeOCPPCommand('cache')}
                disabled={!selectedCharger}
                className="btn btn-primary mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Clear Cache
              </button>
            </div>
            <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-100">Update Firmware</h3>
              <p className="text-sm text-slate-400 mt-1">Push firmware update to charger</p>
              <button 
                onClick={() => executeOCPPCommand('firmware')}
                disabled={!selectedCharger}
                className="btn btn-primary mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Update Firmware
              </button>
            </div>
          </div>
        </div>

        {/* Command History */}
        <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Command History</h2>
          <div className="overflow-hidden">
            <div className="space-y-3">
              {commandHistory.length === 0 ? (
                <div className="py-8 text-sm text-slate-400 text-center">No commands executed yet</div>
              ) : (
                commandHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full ${
                        entry.status === 'success' ? 'bg-emerald-950/50 border border-emerald-800' : 'bg-red-950/50 border border-red-800'
                      }`}>
                        {entry.status === 'success' ? (
                          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-100">{entry.command}</div>
                        <div className="text-sm text-slate-400">{entry.charger}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-200">{entry.response}</div>
                      <div className="text-xs text-slate-300">
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
