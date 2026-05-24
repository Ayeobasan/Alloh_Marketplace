'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, SlidersHorizontal, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/features/products/hooks/useProducts';
import { statesApi } from '@/services/api/states.api';
import { categoriesApi } from '@/services/api/categories.api';

export default function ProductsFeed() {
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
  const selectedCategory = searchParams.get('category') || 'All';

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // States Selector metadata query
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const states = useMemo(() => {
    return ['All', ...statesData];
  }, [statesData]);

  // Categories metadata query
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const categories = useMemo(() => {
    return [{ id: 'All', name: 'All Categories' }, ...categoriesData];
  }, [categoriesData]);

  // Main Marketplace Product Feed Query
  const { data: productsResponse, isLoading, isError, refetch } = useProducts({
    search: searchQuery || undefined,
    state: selectedState === 'All' ? undefined : selectedState,
    category_id: selectedCategory === 'All' ? undefined : selectedCategory,
    status: 'Active', // Only browse active approved products
  });

  const products = productsResponse?.data || [];

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
    params.delete('category');
    params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter('category', cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCategory === cat.id
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F9FAFB] pb-12 font-sans">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
          <div className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 flex md:hidden items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Browse Products</h1>
                <p className="text-xs text-slate-400 font-medium">Explore premium agricultural crops & inputs</p>
              </div>
            </div>
            {activeRole === 'seller' && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                Seller Mode
              </span>
            )}
          </div>
        </header>

        {/* Feed Content */}
        <div className="px-6 pb-8 max-w-7xl mx-auto">
          <div className="w-full">
            {/* Search bar & filter trigger Wrapper for sticky behavior when scrolling up */}
            <div className={`sticky top-[73px] z-30 transition-all duration-300 ease-in-out py-4 mb-4 ${isSticky
              ? 'bg-[#F9FAFB]/95 backdrop-blur-md shadow-md border-b border-slate-200/10 px-6 -mx-6 rounded-b-3xl'
              : 'bg-transparent border-b border-transparent'
              } ${isSticky && scrollDirection === 'down'
                ? '-translate-y-[130%] opacity-0 pointer-events-none'
                : 'translate-y-0 opacity-100'
              }`}>
              <div className="flex gap-3 max-w-5xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search farm products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>

                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="h-12 w-12 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-center text-slate-600 transition-colors shrink-0"
                >
                  <SlidersHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Main Feed */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                  <p className="text-slate-500 font-medium mb-4">Could not load marketplace items right now.</p>
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all"
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 font-extrabold text-2xl">
                    🌾
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No farm products available yet</h3>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                    We couldn't find any products matching your filters. Try checking other locations or search tags!
                  </p>
                  {(selectedState !== 'All' || selectedCategory !== 'All' || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="mt-5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      Clear Active Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Drawer */}
        <Drawer
          title="Filter Products"
          placement={placement}
          onClose={() => setFilterDrawerOpen(false)}
          isOpen={filterDrawerOpen}
          extra={
            (selectedState !== 'All' || selectedCategory !== 'All' || searchQuery) && (
              <button onClick={clearFilters} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
                Clear All
              </button>
            )
          }
        >
          <FilterContent />
        </Drawer>
      </div>
    </DashboardLayout>
  );
}
