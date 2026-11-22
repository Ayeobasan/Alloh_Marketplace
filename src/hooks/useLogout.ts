import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/services/api/auth.api';

/**
 * Ends the session: revokes the refresh token on the backend, drops every cached query
 * (so the next account to sign in on this tab can't see this one's profile or listings),
 * clears the stored credentials, then navigates to `redirectTo`.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(
    (redirectTo = '/login') => {
      const { accessToken, refreshToken, clearCredentials } = useAuthStore.getState();

      if (accessToken) {
        // Best effort and not awaited: the backend can take a while to wake up, and the
        // user is logged out locally either way.
        authApi.logout({ accessToken, refreshToken }).catch(() => {});
      }

      // Credentials first, so anything refetched while the page unmounts goes out
      // without a token and is simply rejected.
      clearCredentials();
      queryClient.clear();
      router.push(redirectTo);
    },
    [router, queryClient]
  );
}
