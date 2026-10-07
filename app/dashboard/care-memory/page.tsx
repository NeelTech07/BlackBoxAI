'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSessions, aggregateCareMemoryPatterns } from '@/lib/storage/sessions';
import { BlackBoxSession, CareMemoryPattern } from '@/types/blackbox';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  AlertTriangle,
  FileSearch,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Search,
} from 'lucide-react';

export default function CareMemoryPage() {
  const [sessions, setSessions] = useState<BlackBoxSession[]>([]);
  const [patterns, setPatterns] = useState<CareMemoryPattern[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'incidents' | 'shifts' | 'unresolved'>('overview');
  const [selectedPattern, setSelectedPattern] = useState<CareMemoryPattern | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const loadedSessions = getSessions();
    setSessions(loadedSessions);
    setPatterns(aggregateCareMemoryPatterns(loadedSessions));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPatterns = patterns.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allUnresolvedActions = sessions.flatMap((s) => {
    if (!s.episodes) return [];
    return s.episodes.flatMap((ep) =>
      ep.actions
        .filter((act) => act.status === 'UNCONFIRMED' || act.status === 'REQUESTED' || act.status === 'IN_PROGRESS')
        .map((act) => ({
          ...act,
          sessionId: s.id,
          sessionTitle: s.title,
          location: s.location || ep.location,
        }))
    );
  });

  const criticalIncidents = sessions.flatMap((s) => {
    if (!s.episodes) return [];
    return s.episodes
      .filter((ep) => ep.riskLevel === 'CRITICAL' || ep.riskLevel === 'HIGH')
      .map((ep) => ({
        ...ep,
        sessionId: s.id,
        sessionTitle: s.title,
        startTime: s.startTime,
      }));
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-12">
      {/* Page Header - Clean Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">CARE MEMORY</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-stone-200/70 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'patterns', label: `Recent Patterns (${patterns.length})` },
            { id: 'incidents', label: `Critical Incidents (${criticalIncidents.length})` },
            { id: 'shifts', label: 'My Shifts' },
            { id: 'unresolved', label: `Unresolved (${allUnresolvedActions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="default" className="p-4 bg-white border border-stone-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wide">Total Sessions</span>
                <Layers className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">{sessions.length}</div>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">Stored locally</p>
            </Card>

            <Card variant="default" className="p-4 bg-white border border-stone-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wide">Observed Patterns</span>
                <FileSearch className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">{patterns.length}</div>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">Care trends detected</p>
            </Card>

            <Card variant="default" className="p-4 bg-white border border-stone-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wide text-red-900">Pending Actions</span>
                <AlertTriangle className="w-4 h-4 text-red-700" />
              </div>
              <div className="text-2xl font-bold text-red-900 mt-2 font-mono">{allUnresolvedActions.length}</div>
              <p className="text-[11px] text-red-700 mt-1 font-medium">Requires verification</p>
            </Card>

            <Card variant="default" className="p-4 bg-white border border-stone-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wide">Wards & Units</span>
                <MapPin className="w-4 h-4 text-teal-800" />
              </div>
              <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">
                {new Set(patterns.flatMap((p) => p.affectedLocations)).size}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">Active clinical units</p>
            </Card>
          </div>

          {/* Recent Patterns List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Recent Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pat) => (
                <Card
                  key={pat.id}
                  variant="default"
                  className="p-5 border border-stone-200/80 rounded-2xl bg-white flex flex-col justify-between gap-4 hover:border-emerald-500/40 transition-all shadow-subtle"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-wider">
                        {pat.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          pat.riskLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {pat.riskLevel}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm">{pat.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{pat.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-mono">
                      {pat.evidenceQuotes.length} Verbatim Quotes
                    </span>
                    <button
                      onClick={() => setSelectedPattern(pat)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-1"
                    >
                      <span>View Evidence</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECENT PATTERNS (FULL SEARCHABLE) */}
      {activeTab === 'patterns' && (
        <div className="space-y-5">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patterns by title, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200/80 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 shadow-subtle"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatterns.map((pat) => (
              <Card
                key={pat.id}
                variant="default"
                className="p-5 border border-stone-200/80 rounded-2xl bg-white space-y-4 shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {pat.category}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 font-medium">
                    {pat.evidenceQuotes.length} Verbatim Quotes
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-base">{pat.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{pat.summary}</p>
                </div>

                {pat.recommendedFix && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 font-medium">
                    <span className="font-bold text-emerald-900">Recommended Action:</span> {pat.recommendedFix}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{pat.affectedLocations.join(', ')}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPattern(pat)}
                    className="gap-1.5 text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>View Evidence</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CRITICAL INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Critical Episodes Across Sessions
          </h3>
          <div className="space-y-3">
            {criticalIncidents.map((inc) => (
              <Card
                key={inc.id}
                variant="default"
                className="p-4 border-2 border-red-200 bg-red-50/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                      {inc.riskLevel} RISK
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">{inc.title}</h4>
                  </div>
                  <p className="text-xs text-stone-700">{inc.summary}</p>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono pt-1">
                    <span>Session: {inc.sessionTitle}</span>
                    <span>•</span>
                    <span>Location: {inc.location}</span>
                  </div>
                </div>

                <Link href={`/dashboard/session/${inc.sessionId}`}>
                  <Button variant="outline" size="sm" className="gap-1 text-xs shrink-0">
                    <span>Inspect Session</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MY SHIFTS (WITHOUT VIEW HANDOFF BUTTON) */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Shift Logs</h3>
          <div className="space-y-4">
            {sessions.map((s) => (
              <Card key={s.id} variant="default" className="p-5 border border-stone-200/80 rounded-2xl bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{s.title}</h4>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {new Date(s.startTime).toLocaleString()} • Location: {s.location || 'General Ward'}
                    </span>
                  </div>
                </div>

                {s.executiveSummary ? (
                  <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl">
                    {s.executiveSummary.situation}
                  </p>
                ) : (
                  <p className="text-xs text-stone-500 italic">No summary generated yet.</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: UNRESOLVED ACTIONS */}
      {activeTab === 'unresolved' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Unconfirmed & Pending Actions
          </h3>
          <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-subtle">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-4">Action Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Session Source</th>
                  <th className="py-3 px-4">Verbatim Evidence Quote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800 font-medium">
                {allUnresolvedActions.map((act, i) => (
                  <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">{act.description}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono">{act.location || 'Ward 5B'}</td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/session/${act.sessionId}`} className="text-emerald-800 hover:underline text-xs">
                        {act.sessionTitle}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">"{act.sourceTranscript}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EVIDENCE TRACEABILITY MODAL */}
      {selectedPattern && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
            <div className="p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    EVIDENCE AUDIT
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{selectedPattern.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPattern(null)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                <span className="font-bold text-stone-900">Pattern Summary:</span> {selectedPattern.summary}
              </div>

              {selectedPattern.recommendedFix && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                  <span className="font-bold text-emerald-900">Recommended Action:</span>{' '}
                  {selectedPattern.recommendedFix}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSearch className="w-3.5 h-3.5 text-forest-900" /> Verbatim Audio Quotes (
                  {selectedPattern.evidenceQuotes.length})
                </h4>

                <div className="space-y-3">
                  {selectedPattern.evidenceQuotes.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-stone-200 shadow-subtle space-y-2 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                        <span className="font-bold text-stone-800">{quote.sessionTitle}</span>
                        <span>{quote.timestamp}</span>
                      </div>

                      <p className="text-xs font-mono font-medium text-stone-900 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                        "{quote.quote}"
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {quote.actionStatus || 'UNCONFIRMED'}
                        </span>
                        <Link
                          href={`/dashboard/session/${quote.sessionId}`}
                          onClick={() => setSelectedPattern(null)}
                          className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                        >
                          <span>Open Session Transcript</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">Local Evidence Log</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedPattern(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
