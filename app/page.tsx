'use client';

import React from 'react';
import { BlackBoxHero } from '@/components/blackbox/BlackBoxHero';
import { BlackBoxRecorder } from '@/components/blackbox/BlackBoxRecorder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-forest-900 selection:text-white">
      <BlackBoxHero />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Main Central Black Box Panel directly placed on light off-white background */}
        <BlackBoxRecorder />
      </main>

      <footer className="w-full border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-400 font-mono">
        <p>CARE BLACKBOX 2026</p>
      </footer>
    </div>
  );
}
