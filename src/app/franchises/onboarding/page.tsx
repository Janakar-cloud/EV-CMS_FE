'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import OnboardingForm from '@/components/franchise/OnboardingForm';

export default function FranchiseOnboardingPage() {
  const [submitted, setSubmitted] = useState<any | null>(null);

  return (
    <Layout>
      {/* Background with EV Theme */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95"></div>

        {/* EV Charging Icon Pattern - Large */}
        <svg
          className="absolute right-0 top-0 h-96 w-96 text-emerald-500 opacity-10"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="2" />
          <path
            d="M200 100 L200 300 M100 200 L300 200"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="200"
            cy="200"
            r="80"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10,10"
          />
        </svg>

        {/* EV Car Icon - Bottom Left */}
        <svg
          className="absolute bottom-20 left-10 h-80 w-80 text-cyan-400 opacity-5"
          viewBox="0 0 400 300"
          fill="none"
        >
          <rect
            x="50"
            y="150"
            width="300"
            height="120"
            rx="20"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle cx="120" cy="270" r="30" stroke="currentColor" strokeWidth="3" />
          <circle cx="280" cy="270" r="30" stroke="currentColor" strokeWidth="3" />
          <rect x="80" y="170" width="60" height="50" rx="5" fill="currentColor" opacity="0.2" />
          <rect x="260" y="170" width="60" height="50" rx="5" fill="currentColor" opacity="0.2" />
          <path d="M200 155 L220 120 Q230 110 240 115" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Charging Cable - Top Left */}
        <svg
          className="opacity-8 absolute left-20 top-40 h-64 w-64 text-blue-400"
          viewBox="0 0 200 300"
          fill="none"
        >
          <path
            d="M100 20 Q120 80 100 140 Q80 160 100 220 L100 280"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="280" r="20" stroke="currentColor" strokeWidth="3" />
          <circle cx="100" cy="20" r="15" stroke="currentColor" strokeWidth="2" />
          <path
            d="M85 140 L115 140 M85 220 L115 220"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg
            className="h-full w-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#0891b2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute right-1/4 top-1/4 h-2 w-2 animate-pulse rounded-full bg-emerald-400 opacity-30"></div>
        <div
          className="absolute left-1/3 top-1/3 h-3 w-3 animate-pulse rounded-full bg-cyan-400 opacity-20"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 h-2 w-2 animate-pulse rounded-full bg-blue-400 opacity-25"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Section with EV Theme Background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg
              className="h-full w-full"
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0891b2" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.1 }} />
                </linearGradient>
              </defs>
              <rect width="1000" height="500" fill="url(#bgGradient)" />
              <rect width="1000" height="500" fill="url(#grid)" />
              {/* EV Charging Icon Pattern */}
              <g opacity="0.15" stroke="#10b981" strokeWidth="2">
                <circle cx="100" cy="100" r="30" />
                <path d="M 100 70 L 100 130 M 70 100 L 130 100" />
                <circle cx="800" cy="350" r="40" />
                <path d="M 800 310 L 800 390 M 760 350 L 840 350" />
                <rect x="400" y="80" width="60" height="100" rx="10" />
                <path d="M 430 120 L 430 140 M 430 160 L 430 180" />
              </g>
            </svg>
          </div>

          <div className="relative z-10">
            <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-100">
              Franchise / Partner Onboarding
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-300">
              <span className="h-4 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
              Provide entity, site, banking, hardware and compliance details.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-5 backdrop-blur-sm">
          {!submitted && <OnboardingForm onSubmit={data => setSubmitted(data)} />}
          {submitted && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">Submission Received</h2>
              <p className="text-xs text-slate-400">Demo mode - data stored in memory only</p>
              <pre className="max-h-48 overflow-auto rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300">
                {JSON.stringify(submitted, null, 2)}
              </pre>
              <button
                className="mt-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-900 transition-all hover:shadow-lg hover:shadow-emerald-500/50"
                onClick={() => setSubmitted(null)}
              >
                Submit Another
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
