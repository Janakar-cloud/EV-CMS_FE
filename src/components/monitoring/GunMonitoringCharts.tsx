'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { ChargerGunMetrics } from '@/types/gun-monitoring';

interface PowerUsageTrendsProps {
  gunMetrics: ChargerGunMetrics;
}

export const PowerUsageTrends: React.FC<PowerUsageTrendsProps> = ({ gunMetrics }) => {
  const generatePowerData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      const baseWatts = gunMetrics.powerMetrics.currentChargingWatts;
      const variance = Math.random() * 2000 - 1000;
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        power: Math.max(0, baseWatts + variance),
        efficiency: gunMetrics.efficiencyMetrics.chargingEfficiency + (Math.random() * 10 - 5),
        voltage: gunMetrics.powerMetrics.voltage + (Math.random() * 20 - 10),
        current: gunMetrics.powerMetrics.current + (Math.random() * 10 - 5),
      });
    }
    
    return data;
  };

  const data = generatePowerData();

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(0)}W`, 'Power']}
            labelFormatter={(value) => `Time: ${value}`}
          />
          <Line 
            type="monotone" 
            dataKey="power" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface EfficiencyAnalysisProps {
  gunMetrics: ChargerGunMetrics;
}

export const EfficiencyAnalysis: React.FC<EfficiencyAnalysisProps> = ({ gunMetrics }) => {
  const efficiencyData = [
    {
      metric: 'Charging Efficiency',
      current: gunMetrics.efficiencyMetrics.chargingEfficiency,
      target: 95,
    },
    {
      metric: 'Conversion Efficiency', 
      current: gunMetrics.efficiencyMetrics.conversionEfficiency,
      target: 92,
    },
    {
      metric: 'Thermal Efficiency',
      current: gunMetrics.thermalMetrics.thermalEfficiency * 100,
      target: 88,
    },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="metric" 
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Bar dataKey="current" fill="#10b981" name="Current" />
          <Bar dataKey="target" fill="#e5e7eb" name="Target" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TemperatureMonitoringProps {
  gunMetrics: ChargerGunMetrics;
}

export const TemperatureMonitoring: React.FC<TemperatureMonitoringProps> = ({ gunMetrics }) => {
  const generateTempData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000); // 10-minute intervals
      const baseTemp = gunMetrics.thermalMetrics.connectorTemp;
      const variance = Math.random() * 4 - 2; // Â±2Â°C variance
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: baseTemp + variance,
        heatLoad: gunMetrics.thermalMetrics.heatLoadPercentage + (Math.random() * 10 - 5),
        ambientTemp: gunMetrics.thermalMetrics.ambientTemp + (Math.random() * 2 - 1),
      });
    }
    
    return data;
  };

  const data = generateTempData();

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            label={{ value: 'Temperature (Â°C)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}Â°C`, 
              name === 'temperature' ? 'Gun Temp' : 
              name === 'ambientTemp' ? 'Ambient' : 'Heat Load'
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stackId="1"
            stroke="#ef4444" 
            fill="#fee2e2"
            name="temperature"
          />
          <Area 
            type="monotone" 
            dataKey="ambientTemp" 
            stackId="2"
            stroke="#6b7280" 
            fill="#f3f4f6"
            name="ambientTemp"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SessionAnalyticsProps {
  gunMetrics: ChargerGunMetrics;
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ gunMetrics }) => {
  const session = gunMetrics.activeSession;
  
  if (!session) {
    return (
      <div className="h-48 flex items-center justify-center">
        <span className="text-gray-500">No active session</span>
      </div>
    );
  }

  const targetEnergy = session.targetEnergyAmount || 50; // Default to 50 kWh if not set
  const sessionData = [
    { name: 'Completed', value: session.energyDelivered, color: '#10b981' },
    { name: 'Remaining', value: Math.max(0, targetEnergy - session.energyDelivered), color: '#e5e7eb' },
  ];

  const progressPercentage = (session.energyDelivered / targetEnergy) * 100;

  return (
    <div className="h-48">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <div className="font-medium">{session.energyDelivered.toFixed(1)} kWh delivered</div>
          <div className="text-gray-500">of {targetEnergy} kWh target</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">{progressPercentage.toFixed(1)}%</div>
          <div className="text-gray-500">Complete</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={sessionData}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={450}
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {sessionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)} kWh`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
