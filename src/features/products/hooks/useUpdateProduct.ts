import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';

interface UpdateProductParams {
  id: string;
  formData: FormData;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }: UpdateProductParams) => productsApi.updateProduct(id, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}
