import React from 'react';
import { Search, MapPin, PlusCircle, User, LayoutGrid } from 'lucide-react';

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <a href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors">
        <LayoutGrid size={20} />
        <span className="text-[10px] font-medium">Home</span>
      </a>
      <a href="/demands" className="flex flex-col items-center gap-1 text-emerald-600">
        <Search size={20} />
        <span className="text-[10px] font-medium">Browse</span>
      </a>
      <a href="/demands/create" className="flex flex-col items-center gap-1 -mt-8">
        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white">
          <PlusCircle size={24} />
        </div>
        <span className="text-[10px] font-medium mt-1 text-emerald-600">Post</span>
      </a>
      <a href="/saved" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors">
        <MapPin size={20} />
        <span className="text-[10px] font-medium">Nearby</span>
      </a>
      <a href="/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors">
        <User size={20} />
        <span className="text-[10px] font-medium">Profile</span>
      </a>
    </nav>
  );
};
