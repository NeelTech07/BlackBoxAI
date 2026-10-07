'use client';

import React, { useState, useEffect } from 'react';
import { getSessions, exportSession } from '@/lib/storage/sessions';
import { BlackBoxSession } from '@/types/blackbox';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, FileJson, FileText, Table, CheckCircle2 } from 'lucide-react';

export default function ExportPage() {
  const [sessions, setSessions] = useState<BlackBoxSession[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'txt' | 'csv'>('json');
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleExportAll = () => {
    if (sessions.length === 0) return;
    sessions.forEach((s) => {
      exportSession(s.id, selectedFormat);
    });
    setExportedNotice(`Successfully generated ${selectedFormat.toUpperCase()} export files for ${sessions.length} sessions.`);
    setTimeout(() => setExportedNotice(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12">
      <div className="pb-2 border-b border-stone-200/80">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Export Session Data</h1>
        <p className="text-xs text-stone-500 font-medium mt-1">
          Export recorded clinical voice transcripts and structured events to standard formats.
        </p>
      </div>

      {exportedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportedNotice}</span>
        </div>
      )}

      <Card variant="default" className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-1">Select Export Format</h3>
          <p className="text-xs text-stone-500">All exports are generated locally without external servers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedFormat('json')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              selectedFormat === 'json'
                ? 'bg-forest-900/10 border-forest-900 text-forest-900 ring-2 ring-forest-900/30'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <FileJson className="w-6 h-6" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">JSON Format</h4>
              <p className="text-[11px] text-stone-500">Complete raw schema with metadata & events.</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedFormat('txt')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              selectedFormat === 'txt'
                ? 'bg-forest-900/10 border-forest-900 text-forest-900 ring-2 ring-forest-900/30'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-6 h-6" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Text (TXT)</h4>
              <p className="text-[11px] text-stone-500">Human-readable clinical transcript log.</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedFormat('csv')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              selectedFormat === 'csv'
                ? 'bg-forest-900/10 border-forest-900 text-forest-900 ring-2 ring-forest-900/30'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Table className="w-6 h-6" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">CSV Spreadsheet</h4>
              <p className="text-[11px] text-stone-500">Tabular format for Excel / data analysis.</p>
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono font-medium">
            {sessions.length} Session(s) ready for export
          </span>

          <Button variant="primary" onClick={handleExportAll} disabled={sessions.length === 0} className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export All Sessions ({selectedFormat.toUpperCase()})</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
