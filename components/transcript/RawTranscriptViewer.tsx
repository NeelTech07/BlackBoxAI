'use client';

import React from 'react';
import { TranscriptSegment } from '@/types/blackbox';
import { FileText, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface RawTranscriptViewerProps {
  segments: TranscriptSegment[];
  highlightedText?: string | null;
  onSentenceClick?: (text: string) => void;
}

export function RawTranscriptViewer({
  segments,
  highlightedText,
  onSentenceClick,
}: RawTranscriptViewerProps) {
  return (
    <div className="w-full bg-white border border-stone-200/80 rounded-2xl shadow-subtle flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-stone-200/60 bg-stone-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-forest-900" />
          <h3 className="font-semibold text-stone-900 text-sm">RAW TRANSCRIPT</h3>
        </div>
        <span className="text-[11px] font-mono text-stone-400 font-medium">
          {segments.length} Timestamped Segments
        </span>
      </div>

      {/* Editor Content Container */}
      <div className="p-5 overflow-y-auto space-y-3 font-sans text-xs leading-relaxed max-h-[620px] scrollbar-thin">
        {segments.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <p>No transcript recorded for this session.</p>
          </div>
        ) : (
          segments.map((seg, idx) => {
            const isMatch =
              highlightedText &&
              (seg.text.toLowerCase().includes(highlightedText.toLowerCase()) ||
                highlightedText.toLowerCase().includes(seg.text.toLowerCase()));

            return (
              <div
                key={seg.id || idx}
                id={`transcript-seg-${idx}`}
                onClick={() => onSentenceClick && onSentenceClick(seg.text)}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer',
                  isMatch
                    ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/50 shadow-md scale-[1.01]'
                    : 'bg-white border-stone-200/70 hover:border-forest-900/30 hover:bg-stone-50/60'
                )}
              >
                <span className="font-mono text-[11px] font-bold text-stone-400 shrink-0 px-2 py-0.5 rounded bg-stone-100 border border-stone-200/60">
                  {seg.timestamp}
                </span>

                <div className="flex-1 text-stone-800 font-medium leading-relaxed">
                  "{seg.text}"
                </div>

                {isMatch && (
                  <div className="shrink-0 text-amber-700 flex items-center gap-1 font-mono text-[10px] uppercase font-bold bg-amber-100 px-2 py-0.5 rounded">
                    <Search className="w-3 h-3" /> Source Event
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
