import { useQuery } from '@tanstack/react-query';
import { demandsApi, GetDemandsParams } from '@/services/api/demands.api';

export function useDemands(params?: GetDemandsParams) {
  return useQuery({
    queryKey: ['demands', params],
    queryFn: () => demandsApi.getDemands(params),
  });
}
