'use client';

import React, { useMemo } from 'react';
import { useAuthStore, useSavedDemandIds } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { Bookmark, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';
import type { ApiError } from '@/services/api/axios';

// The demand was deleted, so retrying or keeping it saved is pointless.
const isGone = (error: Error | null) => {
  const status = (error as ApiError | null)?.status;
  return status === 404 || status === 410;
};

export default function SavedDemands() {
  const { activeRole } = useAuthStore();
  const removeSavedDemands = useAuthStore((state) => state.removeSavedDemands);
  const savedDemandIds = useSavedDemandIds();
  const isSeller = activeRole === 'seller';

  // Newest saves first. Each demand is fetched by id (sharing the detail page's cache),
  // so it shows up no matter which page of the feed it would be on.
  const orderedIds = useMemo(() => [...savedDemandIds].reverse(), [savedDemandIds]);

  const results = useQueries({
    queries: orderedIds.map((id) => ({
      queryKey: ['demand', id],
      queryFn: () => demandsApi.getDemandById(id),
      enabled: isSeller,
      retry: (failureCount: number, error: Error) => !isGone(error) && failureCount < 1,
    })),
  });

  const savedDemands = results.flatMap((result) => (result.data ? [result.data] : []));
  const goneIds = orderedIds.filter((_, i) => isGone(results[i]?.error ?? null));
  const failedResults = results.filter((result) => result.isError && !isGone(result.error));
  const isLoading = savedDemands.length === 0 && results.some((result) => result.isLoading);
  const hasNothingToShow = savedDemands.length === 0 && goneIds.length === 0 && failedResults.length === 0;

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
          {!isSeller ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="text-slate-300" size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Sellers Only feature</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Only sellers can bookmark and save buyer demands. You are currently browsing as a Buyer.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
              <p className="text-slate-500 text-sm font-medium">Loading saved demands...</p>
            </div>
          ) : hasNothingToShow ? (
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
              {goneIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800">
                  <span>
                    {goneIds.length === 1
                      ? '1 saved listing is no longer available.'
                      : `${goneIds.length} saved listings are no longer available.`}
                  </span>
                  <button
                    onClick={() => removeSavedDemands(goneIds)}
                    className="font-bold text-amber-900 hover:underline cursor-pointer"
                  >
                    Remove from saved
                  </button>
                </div>
              )}

              {failedResults.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-700">
                  <span>
                    {failedResults.length === 1
                      ? "1 saved listing couldn't be loaded right now."
                      : `${failedResults.length} saved listings couldn't be loaded right now.`}
                  </span>
                  <button
                    onClick={() => failedResults.forEach((result) => result.refetch())}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              )}

              {savedDemands.length > 0 && (
                <>
                  <p className="text-sm font-medium text-slate-500">
                    You have <span className="text-slate-900 font-bold">{savedDemands.length}</span> saved items
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedDemands.map((demand) => (
                      <DemandCard key={demand.id} demand={demand} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
