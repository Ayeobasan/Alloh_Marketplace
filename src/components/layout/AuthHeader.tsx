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
        <div className="w-13 h-13 overflow-hidden shrink-0 flex items-center justify-center ">
          <img src="/Alloh.png" alt="Alloh Logo" className="w-full h-full object-cover" />
        </div>
      </Link>
      <div className="flex items-center gap-4">
        {showHelp && <a href="mailto:Allohfarm@gmail.com" className="text-sm font-semibold text-slate-500">Help Center</a>}
        {loginLink && <Link href="/login" className="text-sm font-bold text-primary">Login</Link>}
      </div>
    </header>
  );
};
