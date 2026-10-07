'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StructuredEvent } from '@/types/blackbox';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, MapPin, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import { clsx } from 'clsx';

interface EventTimelineProps {
  events: StructuredEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (evt: StructuredEvent) => void;
}

export function EventTimeline({ events, selectedEventId, onSelectEvent }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-stone-400">
        <p className="text-xs">No structured events parsed yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status: StructuredEvent['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Requested':
        return <Badge variant="warning">Requested</Badge>;
      case 'Observed':
        return <Badge variant="info">Observed</Badge>;
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full relative pl-6 border-l-2 border-stone-200/80 space-y-6">
      <AnimatePresence>
        {events.map((evt, idx) => {
          const isSelected = selectedEventId === evt.id;

          return (
            <motion.div
              key={evt.id || idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => onSelectEvent && onSelectEvent(evt)}
              className={clsx(
                'relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer group',
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40 shadow-md'
                  : 'bg-white border-stone-200/80 hover:border-forest-900/30 hover:shadow-subtle'
              )}
            >
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-white border-2 border-forest-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-forest-900" />
              </div>

              {/* Event Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {evt.timestamp}
                  </span>
                  <span className="text-xs font-bold text-forest-900 tracking-tight">
                    {evt.type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {getStatusBadge(evt.status)}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-500 font-semibold">
                    {evt.confidence} Confidence
                  </span>
                </div>
              </div>

              {/* Event Description */}
              <p className="text-xs text-stone-800 font-medium leading-relaxed mb-3">
                {evt.description}
              </p>

              {/* Metadata Tags */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 border-t border-stone-100 pt-2.5">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <strong>People:</strong> {evt.people || 'Not mentioned'}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <strong>Location:</strong> {evt.location || 'Not mentioned'}
                </span>
              </div>

              {/* Source Sentence Traceability Badge */}
              <div className="mt-3 p-2 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between group-hover:border-forest-900/30 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden text-[11px] text-stone-600 font-mono">
                  <ExternalLink className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                  <span className="truncate">Source: "{evt.sourceTranscript}"</span>
                </div>
                <span className="text-[10px] font-semibold text-forest-900 uppercase shrink-0 pl-2">
                  Traceable →
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
