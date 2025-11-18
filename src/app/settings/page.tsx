import Layout from '@/components/layout/Layout';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>INR (Indian Rupee)</option>
                  <option>USD (US Dollar)</option>
                  <option>EUR (Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>Asia/Kolkata (IST)</option>
                  <option>UTC</option>
                  <option>America/New_York</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Timeout</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>8 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email Alerts</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Maintenance Alerts</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Revenue Reports</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <div className="mt-2">
                  <button className="btn btn-primary">
                    Enable 2FA
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Access</label>
                <div className="mt-2 space-y-2">
                  <button className="btn btn-secondary w-full">
                    Generate API Key
                  </button>
                  <button className="btn btn-secondary w-full">
                    View Audit Logs
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Policy</label>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <div>â€¢ Minimum 8 characters</div>
                  <div>â€¢ Include uppercase & lowercase</div>
                  <div>â€¢ Include numbers & symbols</div>
                  <div>â€¢ Password expires every 90 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button className="btn btn-secondary">
            Reset to Defaults
          </button>
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </Layout>
  );
}
