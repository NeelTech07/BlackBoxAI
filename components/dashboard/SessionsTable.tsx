'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlackBoxSession } from '@/types/blackbox';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { exportSession, deleteSession } from '@/lib/storage/sessions';
import { ArrowRight, Download, Trash2, Clock, FileText, AlertTriangle, X } from 'lucide-react';

interface SessionsTableProps {
  sessions: BlackBoxSession[];
  onRefresh?: () => void;
}

export function SessionsTable({ sessions, onRefresh }: SessionsTableProps) {
  const [sessionToDelete, setSessionToDelete] = useState<BlackBoxSession | null>(null);

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      if (onRefresh) onRefresh();
    }
  };

  const handleExport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    exportSession(id, 'json');
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="w-full bg-white border border-stone-200/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <FileText className="w-10 h-10 text-stone-300 mb-2" />
        <h4 className="text-sm font-semibold text-stone-900">No Black Box Sessions Recorded</h4>
        <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">
          Start a live capture session to stream clinical audio and convert voice to structured events.
        </p>
        <Link href="/">
          <Button variant="primary" size="sm">
            Start First Session
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white border border-stone-200/80 rounded-2xl shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-stone-200/60 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Recent Black Box Sessions</h3>
            <p className="text-xs text-stone-500">Live clinical interaction recordings & transcripts</p>
          </div>
          <span className="text-xs text-stone-400 font-mono font-medium">{sessions.length} Sessions stored locally</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200/60 text-[11px] uppercase font-semibold text-stone-500 tracking-wider">
                <th className="py-3 px-5">Session Name</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Segments</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 text-xs">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                  onClick={() => (window.location.href = `/dashboard/session/${session.id}`)}
                >
                  <td className="py-3.5 px-5 font-semibold text-stone-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="group-hover:text-emerald-800 transition-colors">{session.title}</span>
                    {session.isSimulated && (
                      <span className="text-[9px] font-mono bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200">
                        SIMULATED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                    {new Date(session.startTime).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px] flex items-center gap-1.5 pt-4">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{formatDuration(session.durationSeconds)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                    {session.segments.length} segments ({session.wordCount} words)
                  </td>
                  <td className="py-3.5 px-4">
                    {session.status === 'processed' ? (
                      <Badge variant="success">Processed</Badge>
                    ) : session.status === 'needs_processing' ? (
                      <Badge variant="warning">Needs Processing</Badge>
                    ) : (
                      <Badge variant="active">Recording</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleExport(e, session.id)}
                        title="Export JSON"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSessionToDelete(session);
                        }}
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-600" />
                      </Button>
                      <Link href={`/dashboard/session/${session.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setSessionToDelete(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">Delete Session Permanently?</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-stone-900">"{sessionToDelete.title}"</span>? This will permanently erase the transcript and extracted clinical data from local storage.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSessionToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Delete Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
