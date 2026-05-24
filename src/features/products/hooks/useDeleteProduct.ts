import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';
import { PaginatedProducts } from '@/types';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['my-products'] });
      await queryClient.cancelQueries({ queryKey: ['products'] });

      const previousMyProducts = queryClient.getQueryData<PaginatedProducts>(['my-products']);
      const previousProductsList = queryClient.getQueryData<PaginatedProducts>(['products']);

      if (previousMyProducts) {
        queryClient.setQueryData<PaginatedProducts>(['my-products'], {
          ...previousMyProducts,
          data: previousMyProducts.data.filter((product) => product.id !== deletedId),
          total: Math.max(0, previousMyProducts.total - 1),
        });
      }

      return { previousMyProducts, previousProductsList };
    },
    
    onError: (err, deletedId, context) => {
      if (context?.previousMyProducts) {
        queryClient.setQueryData(['my-products'], context.previousMyProducts);
      }
      if (context?.previousProductsList) {
        queryClient.setQueryData(['products'], context.previousProductsList);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
  });
}
