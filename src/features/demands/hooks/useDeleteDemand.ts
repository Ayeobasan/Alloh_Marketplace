import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';
import { DemandPost } from '@/types';

export function useDeleteDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => demandsApi.deleteDemand(id),
    
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['my-demands'] });
      await queryClient.cancelQueries({ queryKey: ['demands'] });

      const previousMyDemands = queryClient.getQueryData<DemandPost[]>(['my-demands']);

      if (previousMyDemands) {
        queryClient.setQueryData<DemandPost[]>(['my-demands'], 
          previousMyDemands.filter((demand) => demand.id !== deletedId)
        );
      }

      return { previousMyDemands };
    },
    
    onError: (err, deletedId, context) => {
      if (context?.previousMyDemands) {
        queryClient.setQueryData(['my-demands'], context.previousMyDemands);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
    },
  });
}
