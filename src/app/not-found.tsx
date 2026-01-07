'use client';

import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-slate-300">404</h1>
        <h2 className="text-3xl font-bold text-slate-100 mt-4">Page Not Found</h2>
        <p className="text-slate-400 mt-2 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been removed, 
          renamed, or is temporarily unavailable.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-slate-100 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-12 text-sm text-slate-400">
          <p>Need help? Contact support at <a href="mailto:support@evcms.com" className="text-blue-600 hover:underline">support@evcms.com</a></p>
        </div>
      </div>
    </div>
  );
}
