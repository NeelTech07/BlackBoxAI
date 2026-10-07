'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSessions } from '@/lib/storage/sessions';
import { BlackBoxSession } from '@/types/blackbox';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { SessionsTable } from '@/components/dashboard/SessionsTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [sessions, setSessions] = useState<BlackBoxSession[]>([]);

  const refreshSessions = () => {
    setSessions(getSessions());
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Black Box Dashboard</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Review captured events, structure clinical information, and preserve hospital knowledge.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
            <PlusCircle className="w-4 h-4" />
            <span>START NEW BLACK BOX SESSION</span>
          </Button>
        </Link>
      </div>

      {/* Top Metrics Cards */}
      <MetricsGrid sessions={sessions} />

      {/* Sessions List Table */}
      <SessionsTable sessions={sessions} onRefresh={refreshSessions} />
    </div>
  );
}
