import { useAuthStore } from '@/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { message } from '@/components/ui/message';
import { UserRole } from '@/types';

export function useMarketplaceRole() {
  const { role, activeRole, setRole } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const switchRole = (newRole: UserRole) => {
    // Purge the entire react-query cache immediately to prevent stale visual states
    queryClient.clear();
    
    // Set the role in global Zustand state
    setRole(newRole);
    
    // Redirect instantly to the correct contextual marketplace feed
    router.push(newRole === 'seller' ? '/demands' : '/products');
  };

  return {
    role,
    activeRole,
    switchRole,
  };
}
