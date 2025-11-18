'use client';

import { useEffect, useState } from 'react';
import {
  BoltIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface OverviewStats {
  totalChargers: number;
  activeChargers: number;
  totalUsers: number;
  todayRevenue: number;
  utilizationRate: number;
  activeSessions: number;
  trends: {
    chargers: number;
    users: number;
    revenue: number;
    utilization: number;
  };
}

const stats = [
  {
    name: 'Total Chargers',
    value: '245',
    change: '+12%',
    changeType: 'increase',
    icon: BoltIcon,
  },
  {
    name: 'Active Sessions',
    value: '87',
    change: '+4.5%',
    changeType: 'increase',
    icon: ChartBarIcon,
  },
  {
    name: 'Today\'s Revenue',
    value: 'â‚¹1,24,500',
    change: '+8.2%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Active Users',
    value: '12.4K',
    change: '+2.1%',
    changeType: 'increase',
    icon: UserGroupIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardOverview() {
  const [overviewData, setOverviewData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setTimeout(() => {
          setOverviewData({
            totalChargers: 245,
            activeChargers: 198,
            totalUsers: 12400,
            todayRevenue: 124500,
            utilizationRate: 78.5,
            activeSessions: 87,
            trends: {
              chargers: 12,
              users: 2.1,
              revenue: 8.2,
              utilization: 4.5,
            },
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-5">Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon
                  className="h-8 w-8 text-primary-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {item.value}
                    </div>
                    <div
                      className={classNames(
                        item.changeType === 'increase'
                          ? 'text-success-600'
                          : 'text-danger-600',
                        'ml-2 flex items-baseline text-sm font-semibold'
                      )}
                    >
                      {item.changeType === 'increase' ? (
                        <ArrowUpIcon
                          className="self-center flex-shrink-0 h-4 w-4 text-success-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArrowDownIcon
                          className="self-center flex-shrink-0 h-4 w-4 text-danger-500"
                          aria-hidden="true"
                        />
                      )}
                      <span className="sr-only">
                        {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                      </span>
                      {item.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Quick Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">78.5%</p>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="78.5, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Network Status</p>
              <div className="mt-2 flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-success-400 rounded-full"></div>
                  <span className="ml-1 text-sm text-gray-600">Online: 198</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-danger-400 rounded-full"></div>
                  <span className="ml-1 text-sm text-gray-600">Offline: 47</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Peak Hours</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">6:00 PM - 9:00 PM</p>
              <p className="text-sm text-gray-500">Average: 142 sessions/hour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
