export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Emergency';
export type DemandStatus = 'Active' | 'Fulfilled' | 'Closed' | 'Under Review';
export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: UserRole;
  roles?: string[]; // Multiple roles supported dynamically
  avatar?: string;
  location?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  // Seller-specific fields
  farmName?: string;
  farm_name?: string;
  experience?: string;
  experience_years?: number | string;
  documents?: string[];
  kycDocument?: string;
  kyc_document?: string;
  document?: string;
  kyc_document_url?: string;
  // Buyer-specific fields
  selectedCategories?: string[];
  categories?: string[];
  // KYC fields
  kyc_type?: string | null;
  kycType?: string | null;
  kyc_status?: 'pending' | 'approved' | 'rejected' | null;
  kycStatus?: 'pending' | 'approved' | 'rejected' | null;
  kyc?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | null;
    kyc_type?: string | null;
    rejection_reason?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string;
  product_name: string;
  price: number;
  quantity: string;
  unit: string;
  state: string;
  description: string;
  images: string[];
  status: 'Active' | 'Pending' | 'Rejected';
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateProductPayload {
  product_name: string;
  category_id: string;
  price: number;
  quantity: string;
  unit: string;
  state: string;
  description: string;
  images: File[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  status?: 'Active' | 'Pending' | 'Rejected';
}

export interface DemandPost {
  id: string;
  user_id: string;
  title: string;
  product_name: string;
  quantity: string;
  unit: string;
  state: string;
  budget_min?: number;
  budget_max?: number;
  description: string;
  phone_number: string;
  whatsapp_number?: string;
  images: string[];
  urgency: UrgencyLevel;
  status: DemandStatus;
  created_at: string;
  user?: User; // Optional populated user
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Report {
  id: string;
  post_id: string;
  reported_by: string;
  reason: string;
  created_at: string;
}
