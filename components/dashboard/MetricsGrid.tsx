'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BlackBoxSession } from '@/types/blackbox';
import { FileText, Cpu, Hash, AlertCircle } from 'lucide-react';

interface MetricsGridProps {
  sessions: BlackBoxSession[];
}

export function MetricsGrid({ sessions }: MetricsGridProps) {
  const totalSessions = sessions.length;
  
  const totalEvents = sessions.reduce((acc, s) => acc + (s.events?.length || 0), 0);
  
  const totalWords = sessions.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  
  const unprocessedSessions = sessions.filter(
    (s) => s.status === 'needs_processing' || s.status === 'recording'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card variant="default" className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-forest-900/10 text-forest-900 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-stone-500 font-medium">Total Sessions</span>
          <h3 className="text-2xl font-bold text-stone-900 font-mono mt-0.5">{totalSessions}</h3>
        </div>
      </Card>

      <Card variant="default" className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-800/10 text-teal-800 flex items-center justify-center shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-stone-500 font-medium">Captured Events</span>
          <h3 className="text-2xl font-bold text-stone-900 font-mono mt-0.5">{totalEvents}</h3>
        </div>
      </Card>

      <Card variant="default" className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
          <Hash className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-stone-500 font-medium">Words Recorded</span>
          <h3 className="text-2xl font-bold text-stone-900 font-mono mt-0.5">{totalWords}</h3>
        </div>
      </Card>

      <Card variant="default" className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-stone-500 font-medium">Unprocessed Sessions</span>
          <h3 className="text-2xl font-bold text-amber-900 font-mono mt-0.5">{unprocessedSessions}</h3>
        </div>
      </Card>
    </div>
  );
}
