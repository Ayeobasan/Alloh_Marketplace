import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';
import { DemandPost } from '@/types';

interface UpdateDemandParams {
  id: string;
  data: FormData | Partial<DemandPost>;
}

export function useUpdateDemand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: UpdateDemandParams) => demandsApi.updateDemand(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
      queryClient.invalidateQueries({ queryKey: ['demand', variables.id] });
    },
  });
}
