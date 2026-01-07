'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import settingsService, { SystemSettings, UpdateSettingsRequest, DEFAULT_SETTINGS } from '@/lib/settings-service';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    setSaving(true);
    setError(null);
    try {
      const reset = await settingsService.resetToDefaults();
      setSettings(reset);
      setSuccess('Settings reset to defaults!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-400 rounded-lg">
            {success}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Settings */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-slate-100 mb-4">System Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900/50 text-slate-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Default Currency</label>
                <select 
                  value={settings.defaultCurrency}
                  onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900/50 text-slate-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-3 py-2"
                >
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Time Zone</label>
                <select 
                  value={settings.defaultTimezone}
                  onChange={(e) => updateSetting('defaultTimezone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Session Timeout (minutes)</label>
                <select 
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-slate-100 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Email Alerts</span>
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">SMS Notifications</span>
                <input 
                  type="checkbox" 
                  checked={settings.smsNotifications}
                  onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Push Notifications</span>
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications}
                  onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Maintenance Alerts</span>
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceAlerts}
                  onChange={(e) => updateSetting('maintenanceAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Revenue Reports</span>
                <input 
                  type="checkbox" 
                  checked={settings.revenueReports}
                  onChange={(e) => updateSetting('revenueReports', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-slate-100 mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Two-Factor Auth</span>
                <input 
                  type="checkbox" 
                  checked={settings.twoFactorAuth}
                  onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Min Password Length</label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Password Expires (days)</label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={settings.passwordExpireDays}
                  onChange={(e) => updateSetting('passwordExpireDays', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Max Login Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-slate-100 mb-4">Charging Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Auto-Start Charging</span>
                <input 
                  type="checkbox" 
                  checked={settings.autoStartCharging}
                  onChange={(e) => updateSetting('autoStartCharging', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Max Session Duration (minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="1440"
                  value={settings.maxSessionDuration}
                  onChange={(e) => updateSetting('maxSessionDuration', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Idle Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.idleTimeout}
                  onChange={(e) => updateSetting('idleTimeout', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-slate-100 mb-4">Business Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => updateSetting('commissionRate', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Min Wallet Topup (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={settings.minWalletTopup}
                    onChange={(e) => updateSetting('minWalletTopup', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Max Wallet Topup (₹)</label>
                  <input
                    type="number"
                    min="100"
                    value={settings.maxWalletTopup}
                    onChange={(e) => updateSetting('maxWalletTopup', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button 
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-100 hover:bg-slate-700/50 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
