import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';
import { DemandPost } from '@/types';

export function useCreateDemand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData | Partial<DemandPost>) => demandsApi.createDemand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
    },
  });
}
