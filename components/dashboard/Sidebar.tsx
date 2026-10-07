'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Brain,
  Download,
  Play,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Sessions', href: '/dashboard/sessions', icon: FileText },
    { label: 'CARE MEMORY', href: '/dashboard/care-memory', icon: Brain },
    { label: 'Export Data', href: '/dashboard/export', icon: Download },
  ];

  return (
    <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 text-stone-100">
      <div className="p-5 flex flex-col gap-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
            <span>CARE</span>
            <span className="bg-stone-800 text-emerald-400 px-2 py-0.5 rounded-md text-xs font-mono tracking-wider border border-forest-900/50 shadow-sm">
              BLACKBOX
            </span>
          </div>
        </Link>

        {/* Start New Session Trigger */}
        <Link href="/">
          <Button variant="primary" size="sm" className="w-full justify-start gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold">
            <PlusCircle className="w-4 h-4" />
            <span className="font-medium text-xs uppercase tracking-wide">Start Black Box</span>
          </Button>
        </Link>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-semibold text-stone-500 px-3 tracking-wider mb-1">
            Menu
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard/care-memory' && (pathname === '/dashboard/hospital-memory' || pathname === '/dashboard/nurse-memory'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-75',
                  isActive
                    ? 'bg-emerald-950 text-emerald-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-emerald-400' : 'text-stone-500')} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-stone-800 flex flex-col gap-2">
        <Link href="/">
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/40 transition-colors flex items-center justify-between group">
            <span className="text-xs font-semibold text-stone-200">Live Capture</span>
            <Play className="w-3.5 h-3.5 text-stone-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>

        <Link href="/dashboard/settings">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-stone-400 hover:text-stone-100 transition-colors font-medium cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-stone-500" /> Settings
            </span>
            <span className="text-[10px] font-mono">CARE BLACKBOX 2026</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
