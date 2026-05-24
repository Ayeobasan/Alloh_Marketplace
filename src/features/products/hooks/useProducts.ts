import { useQuery } from '@tanstack/react-query';
import { productsApi, GetProductsParams } from '@/services/api/products.api';

export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
  });
}
