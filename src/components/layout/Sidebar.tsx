'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  UserGroupIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  DocumentChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { 
    name: 'Charger Management', 
    href: '/chargers',
    icon: BoltIcon,
    children: [
      { name: 'Live Monitoring', href: '/chargers/monitoring' },
      { name: 'Charger Control', href: '/chargers/control' },
      { name: 'Maintenance', href: '/chargers/maintenance' },
      { name: 'Add New Charger', href: '/chargers/add' },
    ]
  },
  {
    name: 'Location Map',
    href: '/locations',
    icon: GlobeAltIcon,
  },
  {
    name: 'Franchise Management',
    href: '/franchises',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'All Franchises', href: '/franchises' },
      { name: 'Onboarding', href: '/franchises/onboarding' },
      { name: 'Staff Management', href: '/franchises/staff' },
      { name: 'Performance', href: '/franchises/performance' },
    ]
  },
  {
    name: 'Partner Management',
    href: '/partners',
    icon: UserGroupIcon,
    children: [
      { name: 'Location Partners', href: '/partners/location' },
      { name: 'Smart Partners', href: '/partners/smart' },
      { name: 'Affiliate Partners', href: '/partners/affiliate' },
      { name: 'Onboarding', href: '/partners/onboarding' },
    ]
  },
  {
    name: 'Revenue & Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    children: [
      { name: 'Overview', href: '/analytics' },
      { name: 'Revenue Reports', href: '/analytics/revenue' },
      { name: 'Utilization', href: '/analytics/utilization' },
      { name: 'User Analytics', href: '/analytics/users' },
    ]
  },
  {
    name: 'Pricing Management',
    href: '/pricing',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Pricing Rules', href: '/pricing/rules' },
      { name: 'Dynamic Pricing', href: '/pricing/dynamic' },
      { name: 'Franchise Pricing', href: '/pricing/franchise' },
    ]
  },
  {
    name: 'Customer Support',
    href: '/support',
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: 'Tickets', href: '/support/tickets' },
      { name: 'Live Chat', href: '/support/chat' },
      { name: 'Knowledge Base', href: '/support/kb' },
      { name: 'Reports', href: '/support/reports' },
    ]
  },
  {
    name: 'Roaming & OCPI',
    href: '/roaming',
    icon: GlobeAltIcon,
    children: [
      { name: 'Partner Networks', href: '/roaming/partners' },
      { name: 'Roaming Sessions', href: '/roaming/sessions' },
      { name: 'Agreements', href: '/roaming/agreements' },
      { name: 'Settlement', href: '/roaming/settlement' },
    ]
  },
  {
    name: 'User Management',
    href: '/users',
    icon: UsersIcon,
    children: [
      { name: 'All Users', href: '/users' },
      { name: 'Add New User', href: '/users/add' },
      { name: 'KYC Verification', href: '/users/kyc' },
      { name: 'Blocked Users', href: '/users/blocked' },
    ]
  },
  {
    name: 'Vehicle Inventory',
    href: '/vehicles',
    icon: BoltIcon,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: DocumentChartBarIcon,
    children: [
      { name: 'Financial Reports', href: '/reports/financial' },
      { name: 'Operational Reports', href: '/reports/operational' },
      { name: 'Compliance Reports', href: '/reports/compliance' },
    ]
  },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isCurrentPath = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <BoltIcon className="h-8 w-8 text-primary-400" />
          <span className="ml-2 text-xl font-bold text-white">EV CMS</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    {!item.children ? (
                      <Link
                        href={item.href}
                        className={classNames(
                          isCurrentPath(item.href)
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            isCurrentPath(item.href)
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-white',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.name)}
                          className={classNames(
                            isCurrentPath(item.href)
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              isCurrentPath(item.href)
                                ? 'text-white'
                                : 'text-gray-400 group-hover:text-white',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          <span className="flex-1 text-left">{item.name}</span>
                          <svg
                            className={classNames(
                              expandedItems.includes(item.name) ? 'rotate-90' : '',
                              'ml-auto h-5 w-5 transition-transform'
                            )}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {expandedItems.includes(item.name) && (
                          <ul className="mt-1 space-y-1 pl-10">
                            {item.children.map((child) => (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  className={classNames(
                                    isCurrentPath(child.href)
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                    'block rounded-md py-2 px-3 text-sm leading-6'
                                  )}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
