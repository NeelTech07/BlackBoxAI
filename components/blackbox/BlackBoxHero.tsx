'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BlackBoxHero() {
  return (
    <header className="w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-stone-900 text-lg">
            <span>CARE</span>
            <span className="bg-stone-900 text-emerald-400 px-2 py-0.5 rounded-md text-sm font-mono tracking-wider border border-forest-900/50 shadow-sm">
              BLACKBOX
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs text-stone-400 border-l border-stone-200 pl-3 ml-1 font-medium">
            The Black Box for Safer Healthcare
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-stone-800 border-stone-300 hover:border-forest-900">
              <LayoutDashboard className="w-4 h-4 text-forest-900" />
              <span className="font-semibold text-xs">Go to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
