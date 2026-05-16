import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface AccountCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export const AccountCard: React.FC<AccountCardProps> = ({ active, onClick, icon, title, desc }) => {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "card-premium text-center space-y-6 group border-2 relative transition-all", 
        active ? "border-primary bg-emerald-50/10 shadow-md" : "border-slate-100 hover:border-emerald-200 hover:shadow-sm"
      )}
    >
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed px-4">{desc}</p>
      </div>
      <div className="text-primary font-bold text-sm flex items-center justify-center gap-2 pt-2">
        Select <ChevronRight size={18} />
      </div>
      {active && <CheckCircle2 className="absolute top-4 right-4 text-primary" size={24} />}
    </button>
  );
};
