import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';

export function useMyProducts(params?: { page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: ['my-products', params],
    queryFn: () => productsApi.getMyProducts(params),
    enabled,
  });
}
