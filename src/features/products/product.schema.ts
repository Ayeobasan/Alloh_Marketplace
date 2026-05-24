import * as z from 'zod';

export const productSchema = z.object({
  product_name: z.string().min(2, 'Product name is required').max(100),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than zero'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
  state: z.string().min(2, 'State is required'),
  description: z.string().min(20, 'Please provide more details (min 20 chars)').max(1000),
});

export type ProductFormValues = z.infer<typeof productSchema>;
