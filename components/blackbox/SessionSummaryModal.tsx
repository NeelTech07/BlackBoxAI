'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, FileText, Hash, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BlackBoxSession, TranscriptSegment } from '@/types/blackbox';

interface SessionSummaryModalProps {
  isOpen: boolean;
  session: BlackBoxSession | null;
  segments?: TranscriptSegment[];
  duration?: number;
  onClose: () => void;
}

export function SessionSummaryModal({
  isOpen,
  session,
  segments = [],
  duration,
  onClose,
}: SessionSummaryModalProps) {
  if (!isOpen || !session) return null;

  // Use provided segments array from live audio hook or session fallback
  const activeSegments = segments.length > 0 ? segments : session.segments || [];
  const durationSec = duration !== undefined ? duration : session.durationSeconds || 0;
  const durationMin = Math.floor(durationSec / 60);
  const displaySec = durationSec % 60;

  const segmentCount = activeSegments.length;
  const wordCount = activeSegments.reduce(
    (acc, seg) => acc + seg.text.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">BLACK BOX SESSION COMPLETE</h3>
              <p className="text-xs text-stone-500 font-medium">Session recorded & saved to local storage</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> Duration
              </span>
              <span className="text-base font-bold text-stone-900 font-mono mt-0.5">
                {durationMin}m {displaySec}s
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                <FileText className="w-3.5 h-3.5 text-stone-400" /> Segments
              </span>
              <span className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                {segmentCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                <Hash className="w-3.5 h-3.5 text-stone-400" /> Words
              </span>
              <span className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                {wordCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Dismiss
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link href={`/dashboard/session/${session.id}`}>
              <Button variant="primary" className="gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold">
                <span>View Session</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
