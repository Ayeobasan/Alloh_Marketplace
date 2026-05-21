export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Emergency';
export type DemandStatus = 'Active' | 'Fulfilled' | 'Closed' | 'Under Review';
export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: UserRole;
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
