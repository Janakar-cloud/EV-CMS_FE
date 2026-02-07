import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/socket';
import DevModeBanner from '@/components/debug/DevModeBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EV CMS - Brand Admin Dashboard',
  description: 'Complete management system for EV charging networks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <DevModeBanner />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
