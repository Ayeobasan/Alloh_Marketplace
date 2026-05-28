import React from 'react';

export const AuthFooter: React.FC = () => {
  return (
    <footer className="py-10 px-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-white mt-auto">
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        © 2026 AllohFarms. Connecting farms to markets.
      </p>
      <div className="flex items-center gap-8">
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Terms of service</button>
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Privacy</button>
        <a href="mailto:Allohfarm@gmail.com" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Support</a>
      </div>
    </footer>
  );
};
