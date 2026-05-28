'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ArrowRight,
  ShoppingBag,
  Sprout,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  Truck,
  Zap,
  MessageSquare,
  BadgeAlert,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, activeRole, isInitialized } = useAuthStore();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic automatic feed resolution & redirection for logged-in users
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(activeRole === 'seller' ? '/demands' : '/products');
    }
  }, [isInitialized, isAuthenticated, activeRole, router]);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Who can sell produce on Alloh?",
      a: "Any registered farmer, input supplier, agricultural cooperative, or local producer can set up a seller profile, complete the KYC verification, and list their fresh produce or inputs."
    },
    {
      q: "How are farm produce quality & standards checked?",
      a: "We moderate and review every listing on our feed. Furthermore, we encourage buyer reviews and verify seller identity via standard documents (KYC verification) to maintain high-quality listings."
    },
    {
      q: "Do you handle logistics and delivery?",
      a: "Alloh is a connection-first marketplace. Buyers and sellers communicate directly via phone or WhatsApp to arrange logistics, pricing, and local delivery terms that suit both parties perfectly."
    },
    {
      q: "Is there a service fee to use the platform?",
      a: "Alloh is completely free for direct communication. There are no middleman commissions, no listing fees, and no hidden transaction deductions. You keep 100% of your agribusiness revenue."
    },
    {
      q: "How is my money and trade secure?",
      a: "By connecting you directly with verified suppliers in your own state, you can inspect produce in person or agree on secure pay-on-delivery terms. Always conduct transactions in a secure, transparent manner."
    }
  ];

  const mockProducts = [
    {
      name: "Red Tomatoes",
      category: "Vegetables",
      price: "₦12,500",
      unit: "Basket",
      farm: "Kano Green Farms",
      img: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Fresh Strawberries",
      category: "Fruits",
      price: "₦8,000",
      unit: "Box",
      farm: "Jos Berry Valley",
      img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Green Runner Beans",
      category: "Vegetables",
      price: "₦6,200",
      unit: "Bag",
      farm: "Oyo Organic Crop Co.",
      img: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Sleek Red Apples",
      category: "Fruits",
      price: "₦15,000",
      unit: "Carton",
      farm: "Plateau Orchard Ltd",
      img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Golden Guinea Corn",
      category: "Grains",
      price: "₦32,000",
      unit: "Bag (100kg)",
      farm: "Kaduna Grain Silo",
      img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Premium Yellow Apples",
      category: "Fruits",
      price: "₦14,500",
      unit: "Carton",
      farm: "Yankari Orchards",
      img: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Fresh Spinach Bunches",
      category: "Vegetables",
      price: "₦3,500",
      unit: "Bundle (10 pcs)",
      farm: "Epe Agro-Allied Farm",
      img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Sweet Bell Peppers",
      category: "Vegetables",
      price: "₦9,800",
      unit: "Basket",
      farm: "Abuja Hydroponic Hub",
      img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400"
    }
  ];

  // Render a clean fallback transition loader if redirecting
  if (isInitialized && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-emerald-500 selection:text-white font-sans">

      {/* 1. Header (Navbar) */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/Alloh.png" alt="Alloh Logo" width={60} height={60} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors">Home</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#marketplace" className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">Marketplace</a>
            <a href="#faqs" className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">FAQs</a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-6 py-3 bg-[#006C04] text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all">
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl animate-in slide-in-from-top-5 duration-300">
            <nav className="flex flex-col gap-4 font-semibold text-slate-800">
              <a href="#" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600">Home</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600">How it Works</a>
              <a href="#marketplace" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600">Marketplace</a>
              <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600">FAQs</a>
            </nav>
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full h-12 flex items-center justify-center font-bold text-slate-600 bg-slate-50 rounded-xl">
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full h-12 flex items-center justify-center font-bold text-white bg-emerald-600 rounded-xl shadow-md">
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="w-full bg-gradient-to-br from-[#FEF9E7] to-[#F4FDF6] border-b border-slate-100 overflow-hidden">
        <div className="px-6 py-10 md:pb-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
              <Zap size={14} className="fill-emerald-200" />
              BUY AND SELL FARM PRODUCE
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl xl:text-6xl font-bold text-slate-900 leading-[1.08] mx-auto  sm:w-[80%] md:w-full tracking-tight">
              Buy Fresh <span className="text-emerald-600">Farm </span>
              <span className="text-emerald-600"> Produce</span> Directly From
              Farmers
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-slate-500 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Connect with local farmers and get the freshest organic vegetables, fruits, and dairy products delivered straight to your doorstep. Support local agriculture while enjoying quality produce.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="h-14 px-8 bg-emerald-600 text-white rounded-full flex items-center justify-center gap-2 font-bold shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <ShoppingBag size={18} />
                Start Shopping
              </Link>
              <Link
                href="/register"
                className="h-14 px-8 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-full flex items-center justify-center gap-2 font-bold shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <Sprout size={18} className="text-emerald-600" />
                Become a Seller
              </Link>
            </div>

            {/* Stats Blocks */}
            <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-12 pt-4 border-t border-slate-100">
              <div >
                <div className="text-2xl md:text-3xl font-extrabold text-center text-slate-900">10+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Years Exp</div>
              </div>
              <div className="w-[1px] h-10 bg-slate-100" />
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-center text-slate-900">70+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Crops Avail</div>
              </div>
              <div className="w-[1px] h-10 bg-slate-100" />
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-center text-slate-900">60%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Savings</div>
              </div>
            </div>
          </div>

          {/* Right Side Farmer Circle Image */}
          <div className="flex items-center justify-center w-full">
            <img
              src="/hero.png"
              alt="Smiling African Farmer holding basket of crops"
              className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section id="marketplace" className="bg-slate-50/70 border-y border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Headings */}
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Featured</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-display">Hot Fresh Produce</h2>
            <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto">
              Discover our most popular agribusiness listings fresh from local farms. Register to contact sellers.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockProducts.map((prod, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Photo & Category Badge */}
                <div className="h-48 bg-slate-100 relative overflow-hidden group">
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md z-10 tracking-widest shadow-sm">
                    {prod.category}
                  </span>
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details block */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{prod.name}</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">{prod.farm}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <div>
                      <div className="text-slate-950 font-extrabold text-lg">{prod.price}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">per {prod.unit}</div>
                    </div>
                    <Link
                      href="/login"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-50"
                    >
                      View Card
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-bold rounded-full transition-all cursor-pointer shadow-sm"
            >
              Browse All Products
              <ArrowRight size={16} className="text-emerald-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. About Us Section */}
      <section className="w-full bg-gradient-to-br from-[#FEF9E7] to-[#F4FDF6] py-10 md:py-20 border-t border-b border-slate-100 overflow-hidden">
        <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side Farmer Image */}
          <div className="flex items-center justify-center w-full">
            <img
              src="/aboutus.png"
              alt="Farmer standing proudly in field"
              className="w-full sm:max-w-[380px] md:max-w-[520px] lg:max-w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right Side Content Block */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">About Us</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-display">Connecting Farmers & Buyers Since 2026</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Alloh started with a simple belief: direct connection brings the best value. By bypassing complex intermediary networks and hidden transaction fees, we put the power back in the hands of the crop producers and buyers.
              </p>
            </div>

            {/* USP Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {[
                {
                  title: "Direct Delivery",
                  icon: <Truck className="text-emerald-600" />,
                  desc: "Connect directly and organize quick local delivery terms.",
                  bg: "bg-emerald-50"
                },
                {
                  title: "Fair Pricing",
                  icon: <Zap className="text-amber-600" />,
                  desc: "No agent cuts or listing commissions. Keep 100% of the sale.",
                  bg: "bg-amber-50"
                },
                {
                  title: "Real Farmers",
                  icon: <ShieldCheck className="text-blue-600" />,
                  desc: "Rigorous document verification to build solid buyer trust.",
                  bg: "bg-blue-50"
                },
                {
                  title: "Quality Assured",
                  icon: <CheckCircle2 className="text-purple-600" />,
                  desc: "Explore clean, carefully moderated crop and agricultural listings.",
                  bg: "bg-purple-50"
                }
              ].map((usp, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", usp.bg)}>
                    {usp.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{usp.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{usp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section (Forest Green Dashboard) */}
      <section id="how-it-works" className="bg-[#013C04] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Headings */}
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Step-By-Step</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-white">How It Works</h2>
            <p className="text-sm md:text-base text-emerald-200/70 max-w-md mx-auto">
              Three simple steps to connect and trade agricultural products.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Browse available farm products",
                desc: "Explore fresh local produce, inputs, or tools listed by verified sellers in your region."
              },
              {
                num: "02",
                title: "Sign up or log in",
                desc: "Register a secure buyer or seller account to access chat features and view contact numbers."
              },
              {
                num: "03",
                title: "Connect & receive produce",
                desc: "Call or WhatsApp the seller directly to negotiate payments, inspect crops, and handle transport."
              }
            ].map((step, i) => (
              <div
                key={i}
                className="bg-[#29512B] border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              >
                <div className="text-4xl font-black text-emerald-400/30 font-display">{step.num}</div>
                <div className="space-y-2 mt-6">
                  <h4 className="font-bold text-lg text-white">{step.title}</h4>
                  <p className="text-emerald-100/60 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQs Section */}
      <section id="faqs" className="py-24 px-6 max-w-4xl mx-auto w-full space-y-12">
        {/* Headings */}
        <div className="text-center space-y-3">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">FAQs</div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Frequently Asked Questions</h2>
          <p className="text-xs md:text-sm text-slate-500">Everything you need to know about our agribusiness marketplace.</p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = expandedFaq === i;
            return (
              <div
                key={i}
                className={cn(
                  "border rounded-2xl overflow-hidden transition-all duration-300",
                  isOpen
                    ? "bg-slate-50/80 border-slate-200"
                    : "bg-white border-slate-100 hover:border-slate-200"
                )}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 text-sm md:text-base cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className={cn("shrink-0", isOpen ? "text-emerald-600" : "text-slate-400")} />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-100 animate-in fade-in duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Ready To Get Started CTA Banner */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden relative min-h-[350px] flex items-center justify-center shadow-xl border-4 border-white bg-slate-900">
          {/* Background Aerial agricultural Drone photo */}
          <div className="absolute inset-0 opacity-40">
            <img
              src="/farm.png"
              alt="Aerial farm fields rows"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center p-8 md:p-16 space-y-8 max-w-2xl">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-display">Ready To Get Started?</h2>
              <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
                Join thousands of local farmers, inputs vendors, and direct buyers trading fresh produce today on Alloh.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="h-14 px-8 bg-emerald-600 text-white rounded-full flex items-center justify-center gap-2 font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <ShoppingBag size={18} />
                Start Buying
              </Link>
              <Link
                href="/register"
                className="h-14 px-8 border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-full flex items-center justify-center gap-2 font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <Sprout size={18} />
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#052410] text-[#8CBF9D] pt-20 pb-10 px-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-[#0D381B]">

          {/* Logo & Slogan Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Alloh.png" alt="Alloh Logo" width={60} height={60} />
            </Link>
            <p className="text-xs leading-relaxed text-[#7BA68A]">
              Alloh is a modern connection-first agricultural marketplace designed to unify local crop farmers and buying organizations directly.
            </p>
            <div className="space-y-2 text-xs text-[#7BA68A] pt-4 border-t border-[#0D381B]/60">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">Contact Us</div>
              <div className="space-y-1">
                <p className="flex items-start gap-1.5">
                  <span className="font-semibold text-emerald-400 shrink-0">Tel:</span>
                  <span className="text-slate-200 font-medium">
                    +234 8065782391,<br />
                    +234 7089744623
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-semibold text-emerald-400 shrink-0">Email:</span>
                  <a href="mailto:Allohfarm@gmail.com" className="text-slate-200 hover:text-emerald-400 font-medium transition-colors">
                    Allohfarm@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Useful Links Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Useful Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/login" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Browse Demands</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#faqs" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="mailto:Allohfarm@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="mailto:Allohfarm@gmail.com" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Socials Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Follow Us</h4>
            <p className="text-xs text-[#7BA68A]">Stay updated on seasonal harvests and input stock alerts.</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                <MessageSquare size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                <BadgeAlert size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#648F72]">
          <div>&copy; 2026 Alloh. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
