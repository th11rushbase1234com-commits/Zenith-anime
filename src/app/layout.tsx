'use client';

import React, { useEffect, Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ZenithNavbar } from '@/components/ZenithNavbar';
import { usePathname, useRouter } from 'next/navigation';

function NavigationManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const showNavbar = pathname !== '/login';

  useEffect(() => {
    // Global Command Reset: Force top of page on any route change or navigation event
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    // Force reset to home on page reload regardless of current path to ensure clean archival state
    const navigationEntries = window.performance.getEntriesByType('navigation');
    const isReload = navigationEntries.length > 0 && (navigationEntries[0] as PerformanceNavigationTiming).type === 'reload';

    if (isReload && window.location.pathname !== '/') {
      window.location.replace('/');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && (
        <Suspense fallback={<div className="h-16 bg-background border-b border-white/5" />}>
          <ZenithNavbar />
        </Suspense>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
          <NavigationManager>
            {children}
          </NavigationManager>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
