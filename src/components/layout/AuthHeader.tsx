import React from 'react';
import Link from 'next/link';

interface AuthHeaderProps {
  showHelp?: boolean;
  loginLink?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ showHelp = true, loginLink = true }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span className="font-display font-bold text-xl tracking-tight text-slate-900">Alloh</span>
      </Link>
      <div className="flex items-center gap-4">
        {showHelp && <button className="text-sm font-semibold text-slate-500">Help Center</button>}
        {loginLink && <Link href="/login" className="text-sm font-bold text-primary">Login</Link>}
      </div>
    </header>
  );
};
