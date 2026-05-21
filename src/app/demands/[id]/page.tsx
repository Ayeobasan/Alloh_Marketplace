'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, MapPin, Clock, ShieldCheck, ShieldAlert, ShieldX, Flag, Phone, Share2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { ReportModal } from '@/components/ui/ReportModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';

export default function DemandDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { role: activeRole, savedDemandIds, toggleSaveDemand } = useAuthStore();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const demandId = typeof id === 'string' ? id : id?.[0];

  // Fetch single demand dynamically using react query
  const { data: demand, isLoading, isError } = useQuery({
    queryKey: ['demand', demandId],
    queryFn: () => demandsApi.getDemandById(demandId as string),
    enabled: !!demandId,
  });

  const isSaved = demandId ? savedDemandIds.includes(demandId) : false;
  const isSeller = activeRole === 'seller';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-12 h-[60vh] w-full">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !demand) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Demand Not Found</h2>
          <p className="text-slate-500 mb-6">The listing you are looking for might have been removed or fulfilled.</p>
          <Link href="/demands" className="btn-primary">
            Back to Browse
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: demand.title,
        text: `Check out this demand on Alloh: ${demand.title}`,
        url: window.location.href,
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 3600000;

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const ContactActions = () => (
    <div className="flex gap-3 mt-8">
      {isSeller ? (
        <>
          <a href={`tel:${demand.phone_number}`} className="flex-1 btn-primary bg-emerald-600 text-white shadow-emerald-200 flex items-center justify-center gap-2">
            <Phone size={20} />
            Call Buyer
          </a>
          {demand.whatsapp_number && (
            <a
              href={`https://wa.me/${demand.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-primary bg-[#25D366] text-white shadow-[#25D366]/20 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              WhatsApp
            </a>
          )}
        </>
      ) : (
        <div className="w-full text-center py-4 bg-slate-50 text-slate-500 rounded-xl font-medium text-sm">
          Log in as a Seller to contact buyers
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto md:p-6 lg:p-8 font-sans pb-24 md:pb-0 animate-in fade-in duration-500">
        <div className="bg-white md:rounded-3xl md:shadow-sm md:border md:border-slate-100 overflow-hidden flex flex-col md:flex-row">

          {/* Header Image Area */}
          <div className="relative h-72 md:h-auto md:w-1/2 lg:w-[45%] shrink-0 bg-slate-100">
            <img
              src={demand.images?.[0] || 'https://via.placeholder.com/800x600?text=No+Image'}
              alt={demand.product_name}
              className="w-full h-full object-cover"
            />

            {/* Top Actions (Mobile & Desktop) */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex gap-2">
                <button onClick={handleShare} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <Share2 size={18} />
                </button>
                {isSeller && (
                  <button
                    onClick={() => toggleSaveDemand(demand.id)}
                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                  >
                    {isSaved ? <BookmarkCheck className="text-emerald-600" size={20} /> : <Bookmark className="text-slate-400" size={20} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 p-6 lg:p-10 -mt-6 md:mt-0 relative bg-white rounded-t-3xl md:rounded-none shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:shadow-none">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm mb-3 ${getUrgencyColor(demand.urgency)}`}>
                  {demand.urgency} Request
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                  {demand.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 mb-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-emerald-600" />
                {demand.state}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-emerald-600" />
                Posted {formatTimeAgo(demand.created_at)}
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Quantity Needed</span>
                <span className="text-lg font-bold text-slate-900">{demand.quantity} {demand.unit}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Budget (Est.)</span>
                <span className="text-lg font-bold text-slate-900">
                  {demand.budget_min && demand.budget_max
                    ? `₦${demand.budget_min.toLocaleString()} - ₦${demand.budget_max.toLocaleString()}`
                    : 'Negotiable'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
              <p className="text-slate-600 leading-relaxed">
                {demand.description}
              </p>
            </div>

            {/* Buyer Info */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">About the Buyer</h2>
              <div className="p-5 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden relative">
                  {demand.user?.avatar ? (
                    <img
                      src={demand.user.avatar}
                      alt={demand.user.fullname || 'Buyer'}
                      className="w-full h-full object-cover absolute inset-0 z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span className="uppercase relative z-0">
                    {demand.user?.fullname?.charAt(0) || demand.user?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {demand.user?.fullname || 'Anonymous Buyer'}
                    {(() => {
                      const kycStatus = demand.user?.kyc_status || demand.user?.kycStatus;
                      if (kycStatus === 'approved') {
                        return <ShieldCheck size={16} className="text-emerald-500 shrink-0" />;
                      }
                      if (kycStatus === 'pending') {
                        return <Clock size={16} className="text-amber-500 shrink-0 animate-pulse" />;
                      }
                      if (kycStatus === 'rejected') {
                        return <ShieldX size={16} className="text-red-500 shrink-0" />;
                      }
                      return <ShieldAlert size={16} className="text-slate-400 shrink-0" />;
                    })()}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {(() => {
                      const kycStatus = demand.user?.kyc_status || demand.user?.kycStatus;
                      if (kycStatus === 'approved') return 'Verified Member';
                      if (kycStatus === 'pending') return 'KYC Pending Review';
                      if (kycStatus === 'rejected') return 'KYC Rejected';
                      return 'Unverified Member';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Contact Actions (Hidden on mobile) */}
            <div className="hidden md:block">
              <ContactActions />
            </div>

            {/* Report Button */}
            <div className="flex justify-center border-t border-slate-100 pt-8 mt-8">
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors font-medium"
              >
                <Flag size={16} />
                Report this listing
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Fixed Bottom Action Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <ContactActions />
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        postId={demand.id}
      />
    </DashboardLayout>
  );
}
