'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, SlidersHorizontal, ArrowLeft, Loader2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';
import { statesApi } from '@/services/api/states.api';

export default function DemandsFeed() {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      // Sticky when scrolled past header area
      if (scrollY > 80) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      if (direction !== scrollDirection && (scrollY - lastScrollY > 5 || scrollY - lastScrollY < -5)) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  const [placement, setPlacement] = useState<'right' | 'bottom'>('right');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setPlacement('bottom');
      } else {
        setPlacement('right');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeRole } = useAuthStore();

  // Parse URL Search Parameters for State Synchronization
  const searchQuery = searchParams.get('search') || '';
  const selectedState = searchParams.get('state') || 'All';
  const selectedUrgency = searchParams.get('urgency') || 'All';

  // State Selector metadata query
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const states = useMemo(() => {
    return ['All', ...statesData];
  }, [statesData]);

  // Main Marketplace Demand Feed Query
  const { data: demandsResponse, isLoading } = useQuery({
    queryKey: ['demands', searchQuery, selectedState, selectedUrgency],
    queryFn: () => demandsApi.getDemands({
      search: searchQuery || undefined,
      state: selectedState === 'All' ? undefined : selectedState,
      urgency: selectedUrgency === 'All' ? undefined : selectedUrgency,
    }),
  });

  const demands = demandsResponse?.demands || [];

  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'All' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('search', e.target.value);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('state');
    params.delete('urgency');
    params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Location</h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {states.map(state => (
            <button
              key={state}
              onClick={() => setFilter('state', state)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedState === state
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Urgency Level</h3>
        <div className="flex flex-wrap gap-2">
          {['All', 'Emergency', 'High', 'Medium', 'Low'].map(urgency => (
            <button
              key={urgency}
              onClick={() => setFilter('urgency', urgency)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedUrgency === urgency
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {urgency}
            </button>
          ))}
        </div>
      </div>

      {(selectedState !== 'All' || selectedUrgency !== 'All' || searchQuery !== '') && (
        <button
          onClick={clearFilters}
          className="text-slate-500 hover:text-emerald-600 px-0 font-bold transition-colors text-sm cursor-pointer"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Browse Demands</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {activeRole} Mode
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-6 max-w-7xl mx-auto">
        <div className="w-full">
          {/* Main Feed */}
          <div className="flex-1">
            {/* Search Bar Wrapper for sticky behavior when scrolling up */}
            <div className={`sticky top-[73px] z-30 transition-all duration-300 ease-in-out py-4 mb-4 ${isSticky
              ? 'bg-[#F9FAFB]/95 backdrop-blur-md shadow-md border-b border-slate-200/10 px-6 -mx-6 rounded-b-3xl'
              : 'bg-transparent border-b border-transparent'
              } ${isSticky && scrollDirection === 'down'
                ? '-translate-y-[130%] opacity-0 pointer-events-none'
                : 'translate-y-0 opacity-100'
              }`}>
              <div className="flex gap-3 max-w-7xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search buyer requests..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm relative cursor-pointer"
                >
                  <SlidersHorizontal size={18} />
                  {(selectedState !== 'All' || selectedUrgency !== 'All') && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="card-premium h-80 animate-pulse bg-slate-50 flex flex-col p-0 overflow-hidden">
                    <div className="h-48 bg-slate-200/80 w-full" />
                    <div className="p-5 flex-1 space-y-3">
                      <div className="h-5 bg-slate-200/80 rounded w-3/4" />
                      <div className="h-4 bg-slate-200/80 rounded w-1/2" />
                      <div className="h-4 bg-slate-200/80 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : demands.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 font-extrabold text-2xl">
                  🔍
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">No buyer requests available yet</h2>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-emerald-600 font-bold hover:text-emerald-700 transition-colors cursor-pointer text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{demands.length}</span> results
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {demands.map((demand) => (
                    <DemandCard key={demand.id} demand={demand} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Filter Drawer */}
      <Drawer
        title="Filter Demands"
        placement={placement}
        onClose={() => setFilterDrawerOpen(false)}
        isOpen={filterDrawerOpen}
        extra={
          (selectedState !== 'All' || selectedUrgency !== 'All' || searchQuery) && (
            <button onClick={clearFilters} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
              Clear All
            </button>
          )
        }
      >
        <FilterContent />
        {placement === 'bottom' && (
          <button
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-md mt-6 transition-colors cursor-pointer"
            onClick={() => setFilterDrawerOpen(false)}
          >
            Apply Filters
          </button>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
