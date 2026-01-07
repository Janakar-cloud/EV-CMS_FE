'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import UserList from '@/components/users/UserList';
import AddUserForm from '@/components/users/AddUserForm';

type ViewMode = 'list' | 'add';

export default function UsersPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');

  const handleAddUser = () => {
    setCurrentView('add');
  };

  const handleUserAdded = () => {
    setCurrentView('list');
  };

  const handleCancel = () => {
    setCurrentView('list');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {currentView === 'list' && (
          <UserList onAddUser={handleAddUser} />
        )}
        
        {currentView === 'add' && (
          <div>
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <button
                      onClick={() => setCurrentView('list')}
                      className="text-sm font-medium text-slate-400 hover:text-slate-300"
                    >
                      Users
                    </button>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-slate-100">
                        Add New User
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            <AddUserForm 
              onUserAdded={handleUserAdded}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
