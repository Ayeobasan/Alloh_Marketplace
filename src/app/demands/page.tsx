'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { useMarketStore } from '@/store/useMarketStore';
import { Search, SlidersHorizontal, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Drawer, Button } from 'antd';
import Link from 'next/link';

export default function DemandsFeed() {
  const { demands, activeRole } = useMarketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Filters
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  
  // Unique states from data for filter
  const states = useMemo(() => ['All', ...Array.from(new Set(demands.map(d => d.state)))], [demands]);

  const filteredDemands = useMemo(() => {
    return demands.filter((demand) => {
      const matchesSearch = demand.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            demand.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState = selectedState === 'All' || demand.state === selectedState;
      const matchesUrgency = selectedUrgency === 'All' || demand.urgency === selectedUrgency;
      
      return matchesSearch && matchesState && matchesUrgency;
    });
  }, [demands, searchQuery, selectedState, selectedUrgency]);

  const clearFilters = () => {
    setSelectedState('All');
    setSelectedUrgency('All');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Location</h3>
        <div className="flex flex-wrap gap-2">
          {states.map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedState === state 
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
              onClick={() => setSelectedUrgency(urgency)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedUrgency === urgency 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {urgency}
            </button>
          ))}
        </div>
      </div>
      
      {(selectedState !== 'All' || selectedUrgency !== 'All') && (
        <Button 
          type="link" 
          onClick={clearFilters} 
          className="text-slate-500 hover:text-emerald-600 px-0 font-bold"
        >
          Clear Filters
        </Button>
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
            <h1 className="text-xl font-bold text-slate-900">Marketplace</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {activeRole} Mode
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Feed */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products, crops..."
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm relative"
              >
                <SlidersHorizontal size={18} />
                {(selectedState !== 'All' || selectedUrgency !== 'All') && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full"></span>
                )}
              </button>
            </div>

            {filteredDemands.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-400" size={32} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">No demands found</h2>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
                <Button type="link" onClick={clearFilters} className="mt-4 text-emerald-600 font-bold">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{filteredDemands.length}</span> results
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDemands.map((demand) => (
                    <DemandCard key={demand.id} demand={demand} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={18} className="text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              </div>
              <FilterContent />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filter Demands"
        placement="bottom"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        height="auto"
        className="rounded-t-3xl font-sans lg:hidden"
      >
        <FilterContent />
        <Button 
          type="primary" 
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base font-bold shadow-md mt-6"
          onClick={() => setFilterDrawerOpen(false)}
        >
          Apply Filters
        </Button>
      </Drawer>
    </DashboardLayout>
  );
}
