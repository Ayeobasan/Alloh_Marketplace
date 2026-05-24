'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';
import { formatCurrency, getWhatsAppLink, getKycStatus } from '@/utils/format';
import { ArrowLeft, MapPin, Phone, MessageSquare, ShieldCheck, Loader2, Flag } from 'lucide-react';
import Link from 'next/link';
import { ReportModal } from '@/components/ui/ReportModal';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Retrieve details
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !product) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4 font-extrabold text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
            The product listing you are trying to view is unavailable or has been removed.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Format phone contact
  const sellerPhone = product.user?.phone || product.user?.phone_number || '';
  const whatsAppUrl = getWhatsAppLink(
    sellerPhone,
    `Hello, I saw your product "${product.product_name}" on Alloh. I am interested in buying. Let's discuss!`
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F9FAFB] pb-24 md:pb-12 font-sans">
        {/* Sticky Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
          <div className="px-6 py-4 flex items-center gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Product Details</h1>
              <p className="text-xs text-slate-400 font-medium">{product.product_name}</p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Image Viewer */}
            <div className="relative h-80 md:h-[400px] bg-slate-50 w-full">
              <img 
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&auto=format&fit=crop&q=80'} 
                alt={product.product_name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Core Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                    {product.product_name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{product.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-600">
                    {formatCurrency(product.price)}
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mt-1">
                    per {product.unit}
                  </span>
                </div>
              </div>

              {/* Inventory details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Available Stock</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {product.quantity} {product.unit}s
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Listing Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <ShieldCheck size={14} />
                    Verified Active
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Product Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Seller details card */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img 
                      src={product.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${product.user?.fullname || 'alloh'}`} 
                      alt={product.user?.fullname || 'Seller'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900 text-sm">
                        {product.user?.fullname || 'Alloh Agribusiness Member'}
                      </span>
                      {getKycStatus(product.user) === 'approved' && (
                        <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold shadow-sm" title="Verified Member">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-semibold block">
                      {product.user?.farm_name || product.user?.farmName || 'Verified Independent Seller'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report Button */}
              <div className="flex justify-center border-t border-slate-100 pt-8">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors font-medium cursor-pointer"
                >
                  <Flag size={16} />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Contact panel: Mobile sticky bottom, desktop inline float */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 p-4 flex md:hidden gap-3 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
          {sellerPhone && (
            <a 
              href={`tel:${sellerPhone}`} 
              className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-2 text-sm"
            >
              <Phone size={18} />
              Call Seller
            </a>
          )}
          {sellerPhone && (
            <a 
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-100"
            >
              <MessageSquare size={18} />
              WhatsApp
            </a>
          )}
        </div>

        {/* Desktop inline panel */}
        <div className="hidden md:flex max-w-3xl mx-auto px-6 gap-4 mt-6 justify-end">
          {sellerPhone && (
            <a 
              href={`tel:${sellerPhone}`} 
              className="px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Phone size={18} />
              Call Seller
            </a>
          )}
          {sellerPhone && (
            <a 
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-100 hover:scale-[1.02]"
            >
              <MessageSquare size={18} />
              WhatsApp Seller
            </a>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentId={product.id}
        contentType="product"
      />
    </DashboardLayout>
  );
}
