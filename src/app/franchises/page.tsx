import Layout from '@/components/layout/Layout';

export default function FranchisesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Franchise Management</h1>
          <button className="btn btn-primary">
            Add New Franchise
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500">Total Franchises</div>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-green-600">+3 this month</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500">Active Franchises</div>
            <div className="text-2xl font-bold text-gray-900">21</div>
            <div className="text-sm text-green-600">87.5% active</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900">â‚¹45.2L</div>
            <div className="text-sm text-green-600">+12% this month</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500">Pending Approvals</div>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-yellow-600">Needs attention</div>
          </div>
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Franchise List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Franchise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chargers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Green Energy Solutions</div>
                    <div className="text-sm text-gray-500">Contact: Rajesh Kumar</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Bangalore, Karnataka
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    15 units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    â‚¹2.5L/month
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">View Details</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">PowerCharge India</div>
                    <div className="text-sm text-gray-500">Contact: Priya Sharma</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Mumbai, Maharashtra
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    8 units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    â‚¹1.8L/month
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">Review Application</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
