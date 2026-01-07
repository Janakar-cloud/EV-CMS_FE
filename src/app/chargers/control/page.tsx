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

  const getCommandButtonClass = (command: OCPPCommand) => {
    const baseClass = `btn ${command.color} flex items-center justify-center space-x-2`;
    
    switch (command.status) {
      case 'sending':
        return `${baseClass} opacity-75 cursor-not-allowed`;
      case 'success':
        return `${baseClass} bg-green-600 text-white`;
      case 'error':
        return `${baseClass} bg-red-600 text-white`;
      default:
        return baseClass;
    }
  };

  const getChargerDisplayName = (chargerId: string) => {
    return chargers.find((charger) => charger.id === chargerId)?.name || 'Unknown charger';
  };

  const getChargerStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'offline':
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
      case 'fault':
      case 'faulted':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">OCPP Control Panel</h1>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-emerald-400">OCPP Service Online</span>
          </div>
        </div>

        {/* Charger Selection */}
        <div className="card p-6 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
          <h2 className="text-lg font-bold text-white mb-4">Select Charger</h2>
          {chargersLoading ? (
            <div className="py-8 text-sm text-slate-400 text-center">Loading chargers...</div>
          ) : chargersError ? (
            <div className="py-4 text-sm text-red-600 text-center">{chargersError}</div>
          ) : chargers.length === 0 ? (
            <div className="py-4 text-sm text-slate-300 text-center">No chargers found in the backend.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chargers.map((charger) => (
                <div
                  key={charger.id}
                  onClick={() => setSelectedCharger(charger.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCharger === charger.id
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-slate-600 hover:border-emerald-500 bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {charger.stationId ? `${charger.stationId} • ${charger.name}` : charger.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getChargerStatusBadgeClass(charger.status)}`}>
                      {charger.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 truncate">
                    {charger.location.city || 'Unknown location'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* OCPP Commands */}
        <div className="card p-6 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
          <h2 className="text-lg font-bold text-white mb-4">OCPP Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commands.map((command) => (
              <button
                key={command.id}
                onClick={() => executeOCPPCommand(command.id)}
                disabled={command.status === 'sending' || !selectedCharger}
                className={getCommandButtonClass(command)}
              >
                {getCommandIcon(command.status)}
                <span>{command.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm">
            {commands.map((command) => (
              <div key={`desc-${command.id}`} className="mb-2">
                <strong className="text-slate-200">{command.name}:</strong> <span className="text-slate-300">{command.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Commands */}
        <div className="card p-6 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
          <h2 className="text-lg font-bold text-white mb-4">Advanced Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-500 bg-slate-700/50 rounded-lg">
              <h3 className="font-bold text-white">Unlock Connector</h3>
              <p className="text-sm text-slate-300 mt-1">Manually unlock stuck connector</p>
              <button 
                onClick={() => executeOCPPCommand('unlock')}
                disabled={!selectedCharger}
                className="btn btn-primary mt-2 w-full"
              >
                Execute Unlock
              </button>
            </div>
            <div className="p-4 border border-slate-500 bg-slate-700/50 rounded-lg">
              <h3 className="font-bold text-white">Clear Cache</h3>
              <p className="text-sm text-slate-300 mt-1">Clear charger authorization cache</p>
              <button 
                onClick={() => executeOCPPCommand('cache')}
                disabled={!selectedCharger}
                className="btn btn-primary mt-2 w-full"
              >
                Clear Cache
              </button>
            </div>
            <div className="p-4 border border-slate-500 bg-slate-700/50 rounded-lg">
              <h3 className="font-bold text-white">Update Firmware</h3>
              <p className="text-sm text-slate-300 mt-1">Push firmware update to charger</p>
              <button 
                onClick={() => executeOCPPCommand('firmware')}
                disabled={!selectedCharger}
                className="btn btn-primary mt-2 w-full"
              >
                Update Firmware
              </button>
            </div>
          </div>
        </div>

        {/* Command History */}
        <div className="card p-6 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
          <h2 className="text-lg font-bold text-white mb-4">Command History</h2>
          <div className="overflow-hidden">
            <div className="space-y-3">
              {commandHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full ${
                      entry.status === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {entry.status === 'success' ? (
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{entry.command}</div>
                      <div className="text-sm text-slate-300">{entry.charger}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-200">{entry.response}</div>
                    <div className="text-xs text-slate-400">
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
