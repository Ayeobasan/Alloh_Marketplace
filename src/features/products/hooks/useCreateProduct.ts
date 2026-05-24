import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => productsApi.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
  });
}
