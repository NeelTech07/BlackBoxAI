'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getSession,
  updateSession,
  exportSession,
  deleteSession,
} from '@/lib/storage/sessions';
import { BlackBoxSession, StructuredEvent, CareActionStatus } from '@/types/blackbox';
import { RawTranscriptViewer } from '@/components/transcript/RawTranscriptViewer';
import { EventTimeline } from '@/components/timeline/EventTimeline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Download,
  Trash2,
  Sparkles,
  Cpu,
  Clock,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Layers,
  MapPin,
  Users,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [session, setSession] = useState<BlackBoxSession | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<StructuredEvent | null>(null);
  const [highlightQuote, setHighlightQuote] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'episodes' | 'summary' | 'events'>('episodes');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const data = getSession(id);
      if (data) {
        setSession(data);
      }
    }
    setIsInitialLoading(false);
  }, [id]);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 rounded-full border-3 border-forest-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-stone-500">
        <AlertCircle className="w-8 h-8 text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-900">Session Not Found</h3>
        <p className="text-xs">The requested Black Box session does not exist locally.</p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="mt-2">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const handleConvertToEpisodes = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: session.segments.map((s) => s.text).join(' '),
          segments: session.segments,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process transcript with AI engine.');
      }

      const updated = updateSession({
        id: session.id,
        events: data.events || [],
        episodes: data.episodes || [],
        executiveSummary: data.executiveSummary,
        requiresAttention: data.requiresAttention || [],
        status: 'processed',
      });

      if (updated) {
        setSession(updated);
      }
    } catch (err: any) {
      console.error('Error parsing clinical transcript:', err);
      setAnalysisError(err?.message || 'Failed to analyze transcript.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = (format: 'json' | 'txt' | 'csv') => {
    exportSession(session.id, format);
  };

  const confirmDeleteSession = () => {
    deleteSession(session.id);
    setIsDeleteModalOpen(false);
    router.push('/dashboard');
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderActionBadge = (status: CareActionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> COMPLETED
          </span>
        );
      case 'UNCONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-900 border border-red-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-700" /> UNCONFIRMED
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" /> REQUESTED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-700" /> IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <HelpCircle className="w-3 h-3 text-stone-500" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="px-2">
                <ArrowLeft className="w-4 h-4 text-stone-500" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-stone-900">{session.title}</h1>
            {session.status === 'processed' ? (
              <Badge variant="success">Processed</Badge>
            ) : (
              <Badge variant="warning">Needs Processing</Badge>
            )}
            {session.isSimulated && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-300">
                SIMULATED DATA
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-500 font-mono pl-9 flex-wrap">
            <span>ID: {session.id}</span>
            {session.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-stone-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {session.location}
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(session.durationSeconds)}
            </span>
            <span>•</span>
            <span>Recorded {new Date(session.startTime).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={isAnalyzing}
            onClick={handleConvertToEpisodes}
            className="gap-1.5 text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50 bg-white font-semibold shadow-subtle"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>PROCESS SESSION WITH AI</span>
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('txt')}>
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            title="Delete Session"
          >
            <Trash2 className="w-4 h-4 text-stone-400 hover:text-red-600" />
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT COLUMN: RAW TRANSCRIPT */}
        <div className="lg:col-span-5 flex flex-col">
          <RawTranscriptViewer
            segments={session.segments}
            highlightedText={highlightQuote || selectedEvent?.sourceTranscript}
            onSentenceClick={(text) => {
              setHighlightQuote(text);
              if (session.events) {
                const match = session.events.find((e) => e.sourceTranscript.includes(text) || text.includes(e.sourceTranscript));
                if (match) setSelectedEvent(match);
              }
            }}
          />
        </div>

        {/* RIGHT COLUMN: AI CLINICAL ANALYSIS */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="w-full bg-white border border-stone-200/80 rounded-2xl shadow-subtle flex flex-col h-full overflow-hidden">
            {/* Header Bar with View Switcher */}
            <div className="p-4 border-b border-stone-200/60 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-800" />
                <h3 className="font-semibold text-stone-900 text-sm">CLINICAL AI ANALYSIS</h3>
              </div>

              {session.status === 'processed' && (
                <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('episodes')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'episodes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Episodes ({session.episodes?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'summary' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Summary Handoff
                  </button>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'events' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Event Stream ({session.events?.length || 0})
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Main Body */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[660px] space-y-6">
              {analysisError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {isAnalyzing ? (
                <div className="py-24 flex flex-col items-center justify-center text-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-forest-900 border-t-transparent"
                    />
                    <Sparkles className="w-5 h-5 text-forest-900 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 mt-2">
                    Processing Session with AI...
                  </h4>
                </div>
              ) : session.status === 'processed' ? (
                <>
                  {/* REQUIRES ATTENTION SAFETY WARNER (If Critical Actions Unconfirmed) */}
                  {session.requiresAttention && session.requiresAttention.length > 0 && (
                    <div className="space-y-3">
                      {session.requiresAttention.map((att) => (
                        <div
                          key={att.id}
                          className="p-4 rounded-2xl bg-red-50/90 border-2 border-red-200 shadow-subtle flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white uppercase tracking-wide">
                              <AlertTriangle className="w-3 h-3" /> REQUIRES ATTENTION • {att.severity}
                            </span>
                            <span className="text-[11px] text-red-700 font-mono font-medium">Verbal Confirmation Missing</span>
                          </div>

                          <h4 className="text-sm font-bold text-red-950">{att.issue}</h4>
                          <p className="text-xs text-red-900 leading-relaxed font-medium">
                            <span className="font-bold">Recommended Action:</span> {att.recommendedAction}
                          </p>

                          {att.sourceTranscript && (
                            <button
                              onClick={() => setHighlightQuote(att.sourceTranscript)}
                              className="mt-1 text-left text-[11px] text-red-800 bg-red-100/70 p-2 rounded-xl border border-red-200 hover:bg-red-200/60 transition-all flex items-center justify-between group font-mono"
                            >
                              <span>"{att.sourceTranscript}"</span>
                              <span className="text-[10px] font-bold text-red-900 group-hover:underline flex items-center gap-0.5">
                                Highlight Line <ChevronRight className="w-3 h-3" />
                              </span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 1: EPISODES */}
                  {activeTab === 'episodes' && (
                    <div className="space-y-6">
                      {session.episodes && session.episodes.length > 0 ? (
                        session.episodes.map((episode, idx) => (
                          <div
                            key={episode.id}
                            className="bg-stone-50/80 border border-stone-200 rounded-2xl p-5 space-y-4 shadow-subtle hover:border-emerald-500/40 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                    EPISODE {idx + 1}
                                  </span>
                                  <h4 className="font-bold text-stone-900 text-sm">{episode.title}</h4>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {episode.timeWindow}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {episode.location}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  episode.riskLevel === 'CRITICAL'
                                    ? 'bg-red-100 text-red-900 border border-red-300'
                                    : episode.riskLevel === 'HIGH'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                              >
                                {episode.riskLevel} RISK
                              </span>
                            </div>

                            <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/60 font-normal">
                              {episode.summary}
                            </p>

                            {/* People Involved */}
                            {episode.peopleInvolved && episode.peopleInvolved.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap text-xs text-stone-600">
                                <Users className="w-3.5 h-3.5 text-stone-400" />
                                <span className="text-[11px] font-semibold text-stone-500">People:</span>
                                {episode.peopleInvolved.map((p, i) => (
                                  <span key={i} className="text-[11px] bg-stone-200/60 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions Taken & Requested */}
                            <div className="space-y-2">
                              <h5 className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
                                Actions Requested & Executed
                              </h5>
                              <div className="space-y-2">
                                {episode.actions.map((act) => (
                                  <div
                                    key={act.id}
                                    className="p-3 rounded-xl bg-white border border-stone-200/80 flex flex-col gap-1.5 hover:border-stone-400 transition-all"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-semibold text-stone-900">{act.description}</span>
                                      {renderActionBadge(act.status)}
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-1 border-t border-stone-100">
                                      <span>By: {act.requestedBy || 'Care Staff'}</span>
                                      <span>Quote: "{act.sourceTranscript}"</span>
                                      <button
                                        onClick={() => setHighlightQuote(act.sourceTranscript)}
                                        className="text-emerald-700 hover:underline font-bold text-[10px]"
                                      >
                                        Trace Line
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-500">No episodes generated yet.</p>
                      )}
                    </div>
                  )}

                  {/* TAB 2: EXECUTIVE SUMMARY HANDOFF */}
                  {activeTab === 'summary' && session.executiveSummary && (
                    <div className="space-y-5 bg-stone-50 p-5 rounded-2xl border border-stone-200">
                      <div>
                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Situation Overview</h4>
                        <p className="text-sm text-stone-800 font-medium bg-white p-3.5 rounded-xl border border-stone-200/80 leading-relaxed">
                          {session.executiveSummary.situation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-2">
                          <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" /> Key Clinical Findings
                          </h5>
                          <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                            {session.executiveSummary.keyFindings.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-2">
                          <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> Actions Executed
                          </h5>
                          <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                            {session.executiveSummary.actionsTaken.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Outstanding & Operational Concerns */}
                      {session.executiveSummary.operationalConcerns.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                          <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Operational & Safety Concerns
                          </h5>
                          <ul className="text-xs text-amber-900 space-y-1 list-disc pl-4">
                            {session.executiveSummary.operationalConcerns.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LEGACY EVENT STREAM */}
                  {activeTab === 'events' && session.events && (
                    <div className="space-y-4">
                      <EventTimeline
                        events={session.events}
                        selectedEventId={selectedEvent?.id}
                        onSelectEvent={(evt) => {
                          setSelectedEvent(evt);
                          setHighlightQuote(evt.sourceTranscript);
                        }}
                      />
                    </div>
                  )}

                  {/* CARE MEMORY CONNECTIONS LINK */}
                  <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-semibold text-stone-800">
                        CARE MEMORY Pattern Linkage Active
                      </span>
                    </div>
                    <Link href="/dashboard/care-memory">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-800 hover:text-emerald-900 border-emerald-300">
                        <span>View Care Memory Patterns</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-forest-900/10 text-forest-900 flex items-center justify-center shadow-subtle">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-semibold text-stone-900">Session Not Processed</h4>
                    <p className="text-xs text-stone-500">
                      Process this recording with AI to extract structured clinical events and key actions.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleConvertToEpisodes}
                    className="gap-2.5 mt-2 bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>PROCESS SESSION WITH AI</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-stone-200/60 bg-stone-50/50 text-[11px] text-stone-400 flex items-center justify-between px-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-800" /> Traceable clinical facts & action states
              </span>
              <span>Click action quote to highlight raw line</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">Delete Session Permanently?</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-stone-900">"{session.title}"</span>? This will permanently erase the transcript and extracted clinical data from local storage.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmDeleteSession}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Delete Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
