import { useQuery } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';

export function useMyDemands(enabled = true) {
  return useQuery({
    queryKey: ['my-demands'],
    queryFn: () => demandsApi.getMyPosts(),
    enabled,
  });
}
