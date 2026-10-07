'use client';

import React, { useState, useEffect } from 'react';
import { getSessions } from '@/lib/storage/sessions';
import { BlackBoxSession } from '@/types/blackbox';
import { AutoProcessingControl } from '@/components/dashboard/AutoProcessingControl';
import { Settings, ShieldCheck, Database, Sliders } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  const [sessions, setSessions] = useState<BlackBoxSession[]>([]);

  const refreshSessions = () => {
    setSessions(getSessions());
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">System Settings</h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Configure local processing queues, storage defaults, and AI rules.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-Processing Queue Component */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Queue & Batch Processing</h3>
        <AutoProcessingControl sessions={sessions} onRefresh={refreshSessions} />
      </div>

      {/* Local Storage Info */}
      <Card variant="default" className="p-5 border border-stone-200/80 rounded-2xl bg-white space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-stone-900">Local Storage Privacy Guarantee</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          100% of recorded clinical sessions, transcripts, episodes, and CARE MEMORY patterns are stored client-side in browser local storage. No external patient cloud database is required.
        </p>
      </Card>
    </div>
  );
}
