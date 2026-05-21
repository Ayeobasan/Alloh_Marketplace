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
  // Seller-specific fields
  farmName?: string;
  experience?: string;
  documents?: string[];
  // Buyer-specific fields
  selectedCategories?: string[];
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
