'use client';

import React from 'react';
import { Search, Bookmark, PlusCircle, User, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import clsx from 'clsx';

export const MobileNav = () => {
  const pathname = usePathname();
  const { activeRole } = useAuthStore();
  
  const isSeller = activeRole === 'seller';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)] font-sans">
      
      {/* Left Side: Home and Search */}
      <div className="flex flex-1 justify-around max-w-[40%]">
        <Link 
          href="/" 
          className={clsx(
            "flex flex-col items-center gap-1 transition-colors w-14", 
            pathname === '/' ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"
          )}
        >
          <LayoutGrid size={20} className={pathname === '/' ? "fill-emerald-50" : ""} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        <Link 
          href={isSeller ? '/demands' : '/products'} 
          className={clsx(
            "flex flex-col items-center gap-1 transition-colors w-14", 
            (pathname === (isSeller ? '/demands' : '/products') || pathname.startsWith(isSeller ? '/demands/' : '/products/')) 
              ? "text-emerald-600" 
              : "text-slate-400 hover:text-emerald-600"
          )}
        >
          <Search size={20} />
          <span className="text-[10px] font-semibold">Browse</span>
        </Link>
      </div>

      {/* Center CTA Circle (Thumb-friendly Post Button) */}
      <Link 
        href={isSeller ? '/products/create' : '/demands/create'} 
        className="flex flex-col items-center gap-1 -mt-8 w-16 z-50 shrink-0"
      >
        <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 ring-4 ring-white hover:scale-105 active:scale-95 transition-all">
          <PlusCircle size={28} />
        </div>
        <span className="text-[10px] font-bold mt-1 text-emerald-600">Post</span>
      </Link>

      {/* Right Side: Saved (Sellers only) and Profile */}
      <div className="flex flex-1 justify-around max-w-[40%]">
        {isSeller ? (
          <Link 
            href="/saved" 
            className={clsx(
              "flex flex-col items-center gap-1 transition-colors w-14", 
              pathname === '/saved' ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"
            )}
          >
            <Bookmark size={20} className={pathname === '/saved' ? "fill-emerald-50" : ""} />
            <span className="text-[10px] font-semibold">Saved</span>
          </Link>
        ) : (
          /* Symmetrical structural spacer for layout alignment on buyer mode */
          <div className="w-14" />
        )}

        <Link 
          href="/profile" 
          className={clsx(
            "flex flex-col items-center gap-1 transition-colors w-14", 
            pathname.startsWith('/profile') ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"
          )}
        >
          <User size={20} className={pathname.startsWith('/profile') ? "fill-emerald-50" : ""} />
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </div>
      
    </nav>
  );
};
