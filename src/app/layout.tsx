'use client';

import React, { useEffect, Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ZenithNavbar } from '@/components/ZenithNavbar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function NavigationManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const showNavbar = pathname !== '/login';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, searchParams]);

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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
          <Suspense fallback={null}>
            <NavigationManager>
              {children}
            </NavigationManager>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
