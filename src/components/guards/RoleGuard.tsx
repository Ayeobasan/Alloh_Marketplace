'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller')[];
  fallbackPath?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackPath }: RoleGuardProps) {
  const router = useRouter();
  const { activeRole, isAuthenticated, isInitialized } = useAuthStore();

  const isAllowed = isAuthenticated && allowedRoles.includes(activeRole);
  const finalFallback = fallbackPath || (activeRole === 'seller' ? '/demands' : '/products');

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAllowed) {
        router.push(finalFallback);
      }
    }
  }, [isInitialized, isAuthenticated, isAllowed, router, finalFallback]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
