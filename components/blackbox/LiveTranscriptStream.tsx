'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptSegment } from '@/types/blackbox';
import { Mic, ShieldCheck } from 'lucide-react';

interface LiveTranscriptStreamProps {
  segments: TranscriptSegment[];
  currentPartial?: string;
  isListening: boolean;
}

export function LiveTranscriptStream({
  segments,
  currentPartial,
  isListening,
}: LiveTranscriptStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [segments, currentPartial]);

  return (
    <div className="w-full flex flex-col gap-3 h-full justify-between">
      {/* Transcript Scroll Container */}
      <div
        ref={containerRef}
        className="h-72 sm:h-80 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent rounded-xl bg-stone-950/90 p-4 border border-stone-800"
      >
        {segments.length === 0 && !currentPartial ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <Mic className="w-8 h-8 mb-2 opacity-40 text-emerald-400" />
            <p className="text-xs font-medium text-stone-300">No voice events captured yet.</p>
            <p className="text-[11px] text-stone-500 mt-1">
              Click <span className="text-emerald-400 font-semibold uppercase">START BLACK BOX</span> to stream real-time speech.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {segments.map((seg) => (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-stone-900 border border-stone-800 shadow-sm group hover:border-emerald-500/40"
              >
                <span className="font-mono text-[11px] font-bold text-emerald-400 shrink-0 pt-0.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60">
                  {seg.timestamp}
                </span>
                <div className="flex-1 text-xs text-stone-200 font-medium leading-relaxed">
                  "{seg.text}"
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Live Partial Segment */}
        {currentPartial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-200"
          >
            <span className="font-mono text-[10px] font-bold text-emerald-400 shrink-0 pt-0.5 px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/60 animate-pulse">
              LIVE
            </span>
            <div className="flex-1 text-xs font-medium italic">
              "{currentPartial}..."
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="px-3 py-1.5 text-[11px] text-stone-500 font-mono flex items-center justify-between border-t border-stone-800/60">
        <span>Segments Captured: {segments.length}</span>
      </div>
    </div>
  );
}
