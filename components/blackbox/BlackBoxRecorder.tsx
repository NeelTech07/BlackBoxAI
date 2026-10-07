'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  LayoutDashboard,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AudioWaveform } from '@/components/blackbox/AudioWaveform';
import { LiveTranscriptStream } from '@/components/blackbox/LiveTranscriptStream';
import { SessionSummaryModal } from '@/components/blackbox/SessionSummaryModal';
import { useRealtimeAudio } from '@/lib/assemblyai/useRealtimeAudio';
import {
  createSession,
  saveTranscriptSegment,
  updateSession,
  getSession,
  exportSession as exportLocalSession,
} from '@/lib/storage/sessions';
import { BlackBoxSession, TranscriptSegment } from '@/types/blackbox';

export function BlackBoxRecorder() {
  const [currentSession, setCurrentSession] = useState<BlackBoxSession | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [durationTimer, setDurationTimer] = useState<number>(0);

  const handleSegmentReceived = (segment: TranscriptSegment) => {
    if (currentSession) {
      saveTranscriptSegment(currentSession.id, segment);
      const refreshed = getSession(currentSession.id);
      if (refreshed) setCurrentSession(refreshed);
    }
  };

  const {
    connectionState,
    segments,
    currentPartial,
    errorMessage,
    isSimulatedMode,
    audioLevel,
    waveformFreqs,
    startRecording,
    pauseRecording,
    stopRecording,
    clearSession,
  } = useRealtimeAudio({
    onSegmentReceived: handleSegmentReceived,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (connectionState === 'LISTENING') {
      interval = setInterval(() => {
        setDurationTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionState]);

  const handleStart = async () => {
    const session = createSession();
    setCurrentSession(session);
    setDurationTimer(0);
    await startRecording();
  };

  const handleStop = () => {
    stopRecording();
    if (currentSession) {
      const calculatedWordCount = segments.reduce(
        (acc, seg) => acc + seg.text.trim().split(/\s+/).filter(Boolean).length,
        0
      );

      const updated = updateSession({
        id: currentSession.id,
        durationSeconds: durationTimer,
        segments: segments,
        wordCount: calculatedWordCount,
        status: 'needs_processing',
        endTime: new Date().toISOString(),
      });

      if (updated) {
        setCurrentSession(updated);
      } else {
        setCurrentSession({
          ...currentSession,
          durationSeconds: durationTimer,
          segments: segments,
          wordCount: calculatedWordCount,
          status: 'needs_processing',
        });
      }
    }
    setShowSummaryModal(true);
  };

  const handleClear = () => {
    clearSession();
    setDurationTimer(0);
    setCurrentSession(null);
  };

  const handleExport = () => {
    if (currentSession) {
      exportLocalSession(currentSession.id, 'json');
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">
      {/* Simulation Banner */}
      {isSimulatedMode && connectionState === 'LISTENING' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-emerald-950 border border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-200 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Simulated Voice Capture Active:</strong> Running local fallback speech-to-text mode.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
            Local Mode
          </span>
        </motion.div>
      )}

      {errorMessage && (
        <div className="w-full bg-amber-950 border border-amber-500/40 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Two-Half Black Box Container */}
      <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-white relative overflow-hidden ring-1 ring-black/5">
        {/* Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Internal Header Bar */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-stone-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-stone-200">
              <span>CARE BLACKBOX</span>
            </div>
            <span className="text-stone-700">|</span>
            <span className="font-mono text-xs text-stone-400">
              {currentSession ? currentSession.id : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 text-emerald-400">
              {formatDuration(durationTimer)}
            </div>

            {connectionState === 'LISTENING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE CAPTURE
              </span>
            )}

            {connectionState === 'READY' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                READY
              </span>
            )}
            {connectionState === 'CONNECTING' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                CONNECTING
              </span>
            )}
            {connectionState === 'PAUSED' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PAUSED
              </span>
            )}
            {connectionState === 'DISCONNECTED' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* TWO HALVES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
          {/* LEFT HALF: Controls & Audio Waveform */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" /> Voice Controls
                </span>
              </div>

              {/* Start / Pause / Stop Buttons */}
              <div className="flex flex-col gap-3">
                {connectionState === 'READY' || connectionState === 'DISCONNECTED' ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleStart}
                    className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer border border-emerald-300/40"
                  >
                    <Play className="w-4 h-4 fill-current text-stone-950" />
                    <span>START BLACK BOX</span>
                  </motion.button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={connectionState === 'PAUSED' ? 'secondary' : 'outline'}
                      size="md"
                      onClick={pauseRecording}
                      className="py-3 rounded-xl gap-2 font-semibold bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200"
                    >
                      {connectionState === 'PAUSED' ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      <span>{connectionState === 'PAUSED' ? 'RESUME' : 'PAUSE'}</span>
                    </Button>

                    <Button
                      variant="danger"
                      size="md"
                      onClick={handleStop}
                      className="py-3 rounded-xl gap-2 font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>STOP</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="bg-stone-900 rounded-xl p-3 border border-stone-800">
              <AudioWaveform
                frequencies={waveformFreqs}
                isActive={connectionState === 'LISTENING'}
                audioLevel={audioLevel}
              />
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={segments.length === 0 && !currentSession}
                className="text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={!currentSession || segments.length === 0}
                  className="bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </Button>

                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT HALF: Realtime Transcript Stream */}
          <div className="lg:col-span-7 flex flex-col">
            <LiveTranscriptStream
              segments={segments}
              currentPartial={currentPartial}
              isListening={connectionState === 'LISTENING'}
            />
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={showSummaryModal}
        session={currentSession}
        segments={segments}
        duration={durationTimer}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
}
