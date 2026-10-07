'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSessions } from '@/lib/storage/sessions';
import { BlackBoxSession } from '@/types/blackbox';
import { SessionsTable } from '@/components/dashboard/SessionsTable';
import { AutoProcessingControl } from '@/components/dashboard/AutoProcessingControl';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<BlackBoxSession[]>([]);

  const refreshSessions = () => {
    setSessions(getSessions());
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Black Box Sessions</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Complete list of recorded clinical voice sessions stored locally.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>START SESSION</span>
          </Button>
        </Link>
      </div>

      <AutoProcessingControl sessions={sessions} onRefresh={refreshSessions} />

      <SessionsTable sessions={sessions} onRefresh={refreshSessions} />
    </div>
  );
}
