'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-100">Something went wrong!</h1>
        <p className="text-slate-400 mt-2">
          An unexpected error occurred. Our team has been notified and is working to fix the issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-medium text-red-800">Error Details:</p>
            <p className="text-sm text-red-700 mt-1 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-slate-100 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-12 text-sm text-slate-400">
          <p>If this problem persists, please contact <a href="mailto:support@evcms.com" className="text-blue-600 hover:underline">support@evcms.com</a></p>
        </div>
      </div>
    </div>
  );
}
