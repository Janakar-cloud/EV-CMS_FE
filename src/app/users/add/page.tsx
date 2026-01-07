'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import AddUserForm from '@/components/users/AddUserForm';

export default function AddUserPage() {
  const router = useRouter();

  const handleUserAdded = () => {
    router.push('/users');
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => router.push('/users')}
                  className="text-sm font-medium text-slate-400 hover:text-slate-200"
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
    </Layout>
  );
}
