import * as z from 'zod';

export const demandSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  product_name: z.string().min(2, 'Product name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
  state: z.string().min(2, 'State is required'),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  description: z.string().min(20, 'Please provide more details (min 20 chars)'),
  phone_number: z.string().min(10, 'Valid phone number required'),
  whatsapp_number: z.string().optional(),
  urgency: z.enum(['Low', 'Medium', 'High', 'Emergency'])
});

export type DemandFormValues = z.infer<typeof demandSchema>;
