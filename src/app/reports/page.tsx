'use client';

import React, { useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';

const reportTypes = [
  { id: 'revenue', name: 'Revenue', icon: '💰' },
  { id: 'utilization', name: 'Utilization', icon: '⚡' },
  { id: 'transactions', name: 'Transactions', icon: '📑' },
  { id: 'commission', name: 'Commission', icon: '🧾' },
];

const summaryCards = [
  { label: 'Reports Today', value: '12', change: '+20%' },
  { label: 'Active Schedules', value: '5', change: 'Monthly Weekly' },
  { label: 'Data Exported', value: '2.4 GB', change: '+5% from last week' },
  { label: 'Failed Exports', value: '0', change: 'Last 7 days' },
];

const historyRows = [
  { name: 'Revenue_Aug23.csv', type: 'Revenue', generatedOn: 'Aug 24, 2023', size: '24 MB', status: 'Ready' },
  { name: 'Util_Report_W32.pdf', type: 'Utilization', generatedOn: 'Aug 23, 2023', size: '12 MB', status: 'Ready' },
  { name: 'Full_Txn_Dump_July.csv', type: 'Transactions', generatedOn: 'Just Now', size: '48 MB', status: 'Generating' },
  { name: 'Partner_Commission_Q2.pdf', type: 'Commission', generatedOn: 'Aug 21, 2023', size: '11 MB', status: 'Failed' },
];

const scheduledJobs = [
  { name: 'Weekly Revenue Summary', schedule: 'Runs every Monday at 09:00 AM IST', scope: 'All Stations' },
  { name: 'Monthly Utilization Report', schedule: 'Runs on 1st of every month', scope: 'All Stations' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reportTypes[0].id);
  const [dateRange, setDateRange] = useState({
    start: '2023-07-01',
    end: '2023-07-31',
  });
  const [partnerFilter, setPartnerFilter] = useState('All Partners');
  const [stationFilter, setStationFilter] = useState('All Stations');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [autoEmail, setAutoEmail] = useState(false);

  const summaryStat = useMemo(() => ({
    selected: selectedReport,
    since: dateRange.start,
  }), [selectedReport, dateRange]);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-300">Dashboard / Reports & Analytics</p>
            <h1 className="text-4xl font-bold text-white">Reports & Analytics</h1>
          </div>
          <button className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-100 hover:bg-slate-700/50">
            Help Guide
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {summaryCards.map((card, idx) => {
            const gradients = [
              'from-blue-600 to-blue-700',
              'from-emerald-600 to-emerald-700',
              'from-purple-600 to-purple-700',
              'from-amber-600 to-amber-700'
            ];
            const borderColors = [
              'border-blue-500',
              'border-emerald-500',
              'border-purple-500',
              'border-amber-500'
            ];
            return (
              <div key={card.label} className={`bg-gradient-to-br ${gradients[idx]} border ${borderColors[idx]} rounded-lg p-5`}>
                <p className="text-sm font-bold text-white/90">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-white/80 mt-1">{card.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <section className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Generate New Report</h2>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Report Type</p>
              <div className="grid grid-cols-2 gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={`px-4 py-3 border rounded-lg text-left text-sm font-medium ${
                      selectedReport === type.id ? 'border-emerald-600 bg-emerald-950/30 text-emerald-400' : 'border-slate-700 bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <span className="text-lg" role="img" aria-label={type.name}>
                      {type.icon}
                    </span>
                    <span className="ml-2">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col text-sm text-slate-400">
                <span className="mb-1">Start Date</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
                />
              </label>
              <label className="flex flex-col text-sm text-slate-400">
                <span className="mb-1">End Date</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
              </label>
            </div>
            <div>
              <label className="text-sm text-slate-400">Partner Scope</label>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option>All Partners</option>
                <option>Franchise Partners</option>
                <option>Smart Partners</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Station Scope</label>
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option>All Stations</option>
                <option>Urban Stations</option>
                <option>Highway Stations</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" checked={format === 'csv'} onChange={() => setFormat('csv')} />
                <span className="text-sm">CSV (Excel)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
                <span className="text-sm">PDF Document</span>
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={autoEmail} onChange={(e) => setAutoEmail(e.target.checked)} />
              Auto-send via email
            </label>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Generate Report
            </button>
          </section>

          <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Recent History</p>
                <h2 className="text-xl font-semibold text-slate-100">{summaryStat.selected} Reports</h2>
              </div>
              <div className="text-right text-sm text-slate-400">
                Since {summaryStat.since}
              </div>
            </div>
            <div className="space-y-3">
              {historyRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-200">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.type} · {row.generatedOn}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-400">{row.size}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        row.status === 'Ready'
                          ? 'bg-green-100 text-green-700'
                          : row.status === 'Generating'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {row.status}
                    </span>
                    <button className="text-blue-600 text-sm underline">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Scheduled Jobs</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {scheduledJobs.map((job) => (
              <div key={job.name} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                <h3 className="font-semibold text-slate-100">{job.name}</h3>
                <p className="text-sm text-slate-400 mt-2">{job.schedule}</p>
                <p className="text-sm text-slate-400">Scope: {job.scope}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
