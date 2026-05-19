'use client';

import React from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { User, MapPin, Calendar, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { Select } from 'antd';

export default function Profile() {
  const { currentUser, activeRole, setActiveRole, demands, savedDemandIds } = useMarketStore();
  const [activeTab, setActiveTab] = React.useState<'posted' | 'saved'>('posted');

  if (!currentUser) return null;

  // For Buyer: show demands they posted
  const myDemands = demands.filter(d => d.user_id === currentUser.id);
  
  // For Seller: show saved demands
  const savedDemands = demands.filter(d => savedDemandIds.includes(d.id));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans">
        <header className="bg-emerald-600 text-white pt-12 pb-24 px-6 md:rounded-b-[2.5rem] relative">
          <div className="max-w-5xl mx-auto flex justify-between items-start">
            <h1 className="text-2xl font-bold">Profile</h1>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 -mt-16">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-emerald-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-emerald-600 text-3xl md:text-4xl font-bold relative">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.fullname} className="w-full h-full rounded-full object-cover" />
              ) : (
                currentUser.fullname.charAt(0)
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 size={12} className="md:w-4 md:h-4" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{currentUser.fullname}</h2>
              <p className="text-slate-500 text-sm font-medium mb-4 flex items-center justify-center md:justify-start gap-1">
                <MapPin size={14} /> {currentUser.location || 'Nigeria'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-500 mb-6 md:mb-0">
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full">
                  <User size={14} />
                  <span className="capitalize">{activeRole} Account</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Calendar size={14} />
                  Joined 2024
                </div>
              </div>
            </div>

            {/* Test Toggle for MVP */}
            <div className="w-full md:w-64 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 text-left">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MVP Test Controls</label>
              <Select 
                value={activeRole} 
                onChange={(val) => setActiveRole(val as any)}
                className="w-full custom-select"
                options={[
                  { value: 'buyer', label: 'View as Buyer' },
                  { value: 'seller', label: 'View as Seller' }
                ]}
              />
            </div>
          </div>

          {/* Dynamic Content Based on Role */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-6 border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('posted')}
                className={`text-lg font-bold pb-3 border-b-2 transition-colors ${activeRole === 'buyer' || activeTab === 'posted' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {activeRole === 'seller' ? 'My Posted Goods' : 'My Posted Demands'}
              </button>
              {activeRole === 'seller' && (
                <button 
                  onClick={() => setActiveTab('saved')}
                  className={`text-lg font-bold pb-3 border-b-2 transition-colors ${activeTab === 'saved' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Saved Listings
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeRole === 'buyer' || activeTab === 'posted') ? (
                myDemands.length > 0 ? (
                  myDemands.map(demand => (
                    <DemandCard key={demand.id} demand={demand} hideActions={true} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-500 mb-4">You haven't posted any demands yet.</p>
                    <a href="/demands/create" className="text-emerald-600 font-bold hover:underline">Create your first post</a>
                  </div>
                )
              ) : (
                savedDemands.length > 0 ? (
                  savedDemands.map(demand => (
                    <DemandCard key={demand.id} demand={demand} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-500 mb-4">You haven't saved any listings yet.</p>
                    <a href="/demands" className="text-emerald-600 font-bold hover:underline">Browse demands</a>
                  </div>
                )
              )}
            </div>
          </div>

          <button className="md:hidden w-full flex items-center justify-center gap-2 text-red-500 font-bold py-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
            <LogOut size={18} />
            Log Out
          </button>
        </main>

        <style jsx global>{`
          .custom-select .ant-select-selector {
            border-radius: 0.75rem !important;
            border-color: #e2e8f0 !important;
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
