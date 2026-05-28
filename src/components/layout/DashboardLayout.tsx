'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, Bookmark, PlusCircle, User, LayoutGrid, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { MobileNav } from './MobileNav';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, clearCredentials } = useAuthStore();
  const isSeller = activeRole === 'seller';

  const navLinks = isSeller
    ? [
      { href: '/demands', icon: Search, label: 'Browse Demands' },
      { href: '/saved', icon: Bookmark, label: 'Saved Listings' },
      { href: '/profile', icon: User, label: 'Profile' },
    ]
    : [
      { href: '/products', icon: Search, label: 'Browse Products' },
      { href: '/profile', icon: User, label: 'Profile' },
    ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] md:flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white border-r border-slate-100 shadow-sm z-50">
        <div className="h-20 flex items-center px-8 border-b border-slate-50">
          <Link href="/" className="flex  items-center gap-2">
            <div className="w-15 h-15 overflow-hidden shrink-0 flex items-center justify-center">
              <img src="/Alloh.png" alt="Alloh Logo" className="w-full h-full object-cover" />
            </div>
          </Link>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
          <Link
            href={isSeller ? '/products/create' : '/demands/create'}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors mb-4 shadow-md shadow-emerald-200"
          >
            <PlusCircle size={20} />
            {isSeller ? 'Post Goods' : 'Post a Demand'}
          </Link>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-2">Menu</div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={20} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              clearCredentials();
              router.push('/login');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} className="text-slate-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 relative pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};
