'use client';

import React from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { Bookmark, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SavedDemands() {
  const { demands, savedDemandIds, activeRole } = useMarketStore();
  
  const savedDemands = demands.filter(d => savedDemandIds.includes(d.id));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 shadow-sm">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Bookmark className="text-emerald-600" size={20} />
              <h1 className="text-lg font-bold text-slate-900">Saved Listings</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {activeRole === 'buyer' ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="text-slate-300" size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Sellers Only feature</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Only sellers can bookmark and save buyer demands. You are currently browsing as a Buyer.
              </p>
            </div>
          ) : savedDemands.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="text-emerald-300" size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">No saved listings yet</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                When you see a demand you are interested in, tap the bookmark icon to save it here for later.
              </p>
              <Link href="/demands" className="text-emerald-600 font-bold hover:underline">
                Browse Demands
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <p className="text-sm font-medium text-slate-500">
                You have <span className="text-slate-900 font-bold">{savedDemands.length}</span> saved items
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDemands.map((demand) => (
                  <DemandCard key={demand.id} demand={demand} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
