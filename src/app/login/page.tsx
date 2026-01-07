'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthPage from '@/components/auth/AuthPage';
import { useAuth } from '@/contexts/AuthContext';

const socialProviders = [
  { label: 'Continue with Google', logo: 'G' },
  { label: 'Continue with Apple', logo: '' },
];

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <section className="relative hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-black text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f172a,transparent_45%)]" />
          <div className="relative z-10 px-12 space-y-10 max-w-lg">
            <div className="flex items-center gap-3 text-sm uppercase text-slate-400 tracking-[0.2em]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/30">⚡</span>
              EV Charge Hub
            </div>
            <h1 className="text-4xl font-semibold leading-tight">
              Empowering the future of mobility
            </h1>
            <p className="text-lg text-slate-300">
              Manage your charging stations, payments, and fleet from a single pane of glass.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Partner Dashboard • v2.4.0 • OCPI Compliant</p>
              <p className="text-slate-300 italic">"Seamless, intelligent charging infrastructure management."</p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[url('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center opacity-70" />
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 tracking-[0.4em] uppercase">EV Charge Hub</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-100">Welcome Back</h1>
              <p className="mt-1 text-sm text-slate-400">Log in to manage your chargers, payments, and fleet.</p>
            </div>

            <div className="space-y-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-200 shadow-sm transition hover:bg-slate-700/50"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-lg text-slate-200">
                    {provider.logo}
                  </span>
                  {provider.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex-1 h-px bg-slate-700" />
              OR LOG IN WITH
              <span className="flex-1 h-px bg-slate-700" />
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
              <AuthPage className="space-y-6" />
            </div>

            <div className="text-sm text-slate-400 text-center">
              Need a backend check? Please confirm which login APIs are already available and whether any additional
              endpoints are needed for this flow.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
