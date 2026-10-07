'use client';

import React from 'react';

interface AudioWaveformProps {
  frequencies: number[];
  isActive: boolean;
  audioLevel: number;
}

export function AudioWaveform({ frequencies, isActive, audioLevel }: AudioWaveformProps) {
  const isVoiceActive = isActive && audioLevel > 1;

  return (
    <div className="w-full flex flex-col items-center justify-center py-3 space-y-2">
      {/* High-Performance 60FPS 32-Bar Voice Equalizer Spectrum */}
      <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-md px-4 overflow-hidden">
        {frequencies.map((freq, idx) => {
          const barHeight = isActive ? Math.max(6, Math.min(56, freq)) : 6;
          const isGreen = isActive && isVoiceActive;

          return (
            <div
              key={idx}
              style={{
                height: `${barHeight}px`,
                backgroundColor: isActive
                  ? isVoiceActive
                    ? idx % 2 === 0
                      ? '#10B981' // Bright Emerald Green
                      : '#34D399' // Light Mint Green
                    : '#059669' // Active Emerald Green
                  : '#52525B', // Dark Slate Idle
                boxShadow: isVoiceActive && barHeight > 14 ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none',
                transition: 'height 0.06s ease-out, background-color 0.15s ease',
              }}
              className="w-1.5 rounded-full shrink-0"
            />
          );
        })}
      </div>

      {/* Dynamic Voice Status Indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
          {isActive ? (
            isVoiceActive ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                VOICE INPUT DETECTED ({audioLevel}%)
              </span>
            ) : (
              <span className="text-emerald-500/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                LISTENING FOR VOICE...
              </span>
            )
          ) : (
            <span className="text-stone-500">AUDIO STREAM INACTIVE</span>
          )}
        </span>
      </div>
    </div>
  );
}
