import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';
import { PaginatedProducts } from '@/types';

// Product lists are cached per params (e.g. ['my-products', { page: 1, limit: 50 }]),
// so they're matched by key prefix rather than looked up by an exact key.
const LIST_KEYS = [['my-products'], ['products']] as const;

const withoutProduct = (deletedId: string) => (old: PaginatedProducts | undefined) => {
  if (!old) return old;
  const data = old.data.filter((product) => product.id !== deletedId);
  if (data.length === old.data.length) return old;
  return { ...old, data, total: Math.max(0, old.total - 1) };
};

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),

    onMutate: async (deletedId: string) => {
      await Promise.all(LIST_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey })));

      const previousLists = LIST_KEYS.flatMap((queryKey) =>
        queryClient.getQueriesData<PaginatedProducts>({ queryKey })
      );

      LIST_KEYS.forEach((queryKey) =>
        queryClient.setQueriesData<PaginatedProducts>({ queryKey }, withoutProduct(deletedId))
      );

      return { previousLists };
    },

    onError: (_err, _deletedId, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
  });
}
