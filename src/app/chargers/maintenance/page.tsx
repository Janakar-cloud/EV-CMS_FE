import Layout from '@/components/layout/Layout';

export default function ChargerMaintenancePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <button className="btn btn-primary">
            Schedule Maintenance
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduled Maintenance */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Maintenance</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-sm font-medium text-blue-900">Phoenix Mall DC01</div>
                <div className="text-xs text-blue-700">Due: Tomorrow 9:00 AM</div>
                <div className="text-xs text-blue-600">Routine inspection</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="text-sm font-medium text-yellow-900">Tech Park AC01</div>
                <div className="text-xs text-yellow-700">Due: Next Week</div>
                <div className="text-xs text-yellow-600">Filter replacement</div>
              </div>
            </div>
          </div>

          {/* Maintenance History */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Maintenance</h2>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <div className="text-sm font-medium text-green-900">Highway Plaza DC02</div>
                <div className="text-xs text-green-700">Completed: 2 days ago</div>
                <div className="text-xs text-green-600">Connector repair</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <div className="text-sm font-medium text-gray-900">Mall Road AC02</div>
                <div className="text-xs text-gray-700">Completed: 1 week ago</div>
                <div className="text-xs text-gray-600">Software update</div>
              </div>
            </div>
          </div>

          {/* Maintenance Stats */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Maintenance Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Uptime This Month</span>
                  <span className="font-medium">98.5%</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '98.5%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Pending Tasks</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Completed This Month</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
