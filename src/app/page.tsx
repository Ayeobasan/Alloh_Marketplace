import React from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { ArrowRight, Leaf, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:flex h-20 items-center justify-between px-10 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <span className="text-2xl font-outfit font-bold text-slate-900 tracking-tight">Alloh</span>
        </div>
        <nav className="flex items-center gap-8">
          <a href="/demands" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Browse Demands</a>
          <a href="/about" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">How it Works</a>
          <a href="/login" className="text-sm font-semibold text-slate-600">Login</a>
          <a href="/register" className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-emerald-700 transition-all">Join Alloh</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pb-24 md:pb-0">
        <section className="px-6 pt-16 pb-12 md:py-32 max-w-7xl mx-auto text-center md:text-left md:flex items-center gap-16">
          <div className="md:flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap size={14} />
              The Marketplace for Agribusiness
            </div>
            <h1 className="text-4xl md:text-7xl font-outfit font-bold text-slate-900 leading-[1.1]">
              Connecting <span className="text-emerald-600">Agriculture</span> to Opportunity.
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Alloh is a connection-first marketplace where buyers post their demands and verified suppliers reach out directly. No middlemen, no hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="/register" className="h-14 px-8 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-emerald-200 hover:scale-105 transition-transform">
                Get Started Now
                <ArrowRight size={20} />
              </a>
              <a href="/demands" className="h-14 px-8 border-2 border-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-bold hover:bg-slate-50 transition-colors">
                Browse Requests
              </a>
            </div>
          </div>
          <div className="hidden lg:block flex-1">
             <div className="w-full aspect-square bg-emerald-50 rounded-[4rem] relative overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl">
                <span className="text-emerald-200 font-bold italic text-2xl">Visual Representation Placeholder</span>
             </div>
          </div>
        </section>

        {/* Features for Farmers */}
        <section className="bg-slate-50 py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Direct Connection", icon: <Zap className="text-emerald-600" />, desc: "Contact buyers directly via phone or WhatsApp. No complex transaction flows." },
              { title: "Verified Listings", icon: <ShieldCheck className="text-emerald-600" />, desc: "We moderate every post to ensure you connect with genuine agribusiness demands." },
              { title: "Grown Locally", icon: <Leaf className="text-emerald-600" />, desc: "Support regional agriculture by connecting with buyers in your own state." },
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
