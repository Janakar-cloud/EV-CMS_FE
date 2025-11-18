'use client';

import { Fragment } from 'react';
import { BellIcon, Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'franchise_owner':
        return 'Franchise Owner';
      case 'partner':
        return 'Partner';
      default:
        return 'User';
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Brand Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {user?.fullName || 'User'}
                </span>
                <span className="ml-2 text-xs text-gray-500" aria-hidden="true">
                  ({getRoleDisplayName(user?.role || '')})
                </span>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600">{getRoleDisplayName(user?.role || '')}</p>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={classNames(
                        active ? 'bg-gray-50' : '',
                        'block px-3 py-2 text-sm leading-6 text-gray-900'
                      )}
                    >
                      <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                      Settings
                    </a>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={classNames(
                        active ? 'bg-gray-50' : '',
                        'w-full text-left block px-3 py-2 text-sm leading-6 text-gray-900'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}
