'use client';

import React from 'react';
import { Search, Bookmark, PlusCircle, User, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import clsx from 'clsx';

export const MobileNav = () => {
  const pathname = usePathname();
  const { role: activeRole } = useAuthStore();
  
  const isSeller = activeRole === 'seller';

  const navLinks = [
    { href: '/', icon: LayoutGrid, label: 'Home' },
    { href: '/demands', icon: Search, label: 'Browse' },
    { href: '/saved', icon: Bookmark, label: 'Saved' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)] font-sans">
      {navLinks.slice(0, 2).map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} className={clsx("flex flex-col items-center gap-1 transition-colors w-16", isActive ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600")}>
            <Icon size={20} className={isActive ? "fill-emerald-50" : ""} />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}

      <Link href="/demands/create" className="flex flex-col items-center gap-1 -mt-8 w-16">
        <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 ring-4 ring-white hover:scale-105 transition-transform">
          <PlusCircle size={28} />
        </div>
        <span className="text-[10px] font-bold mt-1 text-emerald-600">Post</span>
      </Link>

      {navLinks.slice(2, 4).map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} className={clsx("flex flex-col items-center gap-1 transition-colors w-16", isActive ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600")}>
            <Icon size={20} className={isActive ? "fill-emerald-50" : ""} />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

