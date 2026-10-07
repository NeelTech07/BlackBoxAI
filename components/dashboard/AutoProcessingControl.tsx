'use client';

import React, { useState } from 'react';
import { BlackBoxSession } from '@/types/blackbox';
import { updateSession } from '@/lib/storage/sessions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Cpu, RefreshCw, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface AutoProcessingControlProps {
  sessions: BlackBoxSession[];
  onRefresh: () => void;
}

export function AutoProcessingControl({ sessions, onRefresh }: AutoProcessingControlProps) {
  const [schedule, setSchedule] = useState<'hourly' | '3hours' | '6hours' | 'daily' | 'manual'>('3hours');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccessMsg, setProcessSuccessMsg] = useState<string | null>(null);

  const unprocessedSessions = sessions.filter((s) => s.status === 'needs_processing');

  const handleProcessNow = async () => {
    if (unprocessedSessions.length === 0) return;
    setIsProcessing(true);
    setProcessSuccessMsg(null);

    let processedCount = 0;

    for (const session of unprocessedSessions) {
      try {
        const fullText = session.segments.map((s) => s.text).join(' ');
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: fullText,
            segments: session.segments,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          updateSession({
            id: session.id,
            events: data.events || [],
            episodes: data.episodes || [],
            executiveSummary: data.executiveSummary,
            requiresAttention: data.requiresAttention || [],
            status: 'processed',
          });
          processedCount++;
        }
      } catch (err) {
        console.error(`Failed auto-processing for session ${session.id}:`, err);
      }
    }

    setIsProcessing(false);
    setProcessSuccessMsg(`Successfully processed ${processedCount} session${processedCount !== 1 ? 's' : ''}!`);
    onRefresh();

    setTimeout(() => {
      setProcessSuccessMsg(null);
    }, 4000);
  };

  return (
    <Card variant="default" className="p-5 border border-stone-200/80 bg-white rounded-2xl shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-forest-900/10 text-forest-900 flex items-center justify-center shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900 text-sm">Auto-Processing Engine Queue</h3>
            {unprocessedSessions.length > 0 ? (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {unprocessedSessions.length} Pending Analysis
              </span>
            ) : (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Queue Clear
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Automated episodic clinical story reconstruction and CARE MEMORY aggregation.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Schedule Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[11px] font-medium text-stone-500">Schedule:</span>
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-stone-800 outline-none cursor-pointer"
          >
            <option value="hourly">Every 1 hour</option>
            <option value="3hours">Every 3 hours</option>
            <option value="6hours">Every 6 hours</option>
            <option value="daily">Daily</option>
            <option value="manual">Manual only</option>
          </select>
        </div>

        {/* Process Now Trigger */}
        <Button
          variant="primary"
          size="sm"
          disabled={isProcessing || unprocessedSessions.length === 0}
          onClick={handleProcessNow}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-2 px-4 shadow-subtle shrink-0"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Queue...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>PROCESS NOW ({unprocessedSessions.length})</span>
            </>
          )}
        </Button>
      </div>

      {processSuccessMsg && (
        <div className="w-full text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{processSuccessMsg}</span>
        </div>
      )}
    </Card>
  );
}
