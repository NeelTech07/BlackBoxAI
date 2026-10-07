'use client';

import React from 'react';
import { PrototypeBanner } from '@/components/ui/PrototypeBanner';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-forest-900 selection:text-white">
      <PrototypeBanner />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
