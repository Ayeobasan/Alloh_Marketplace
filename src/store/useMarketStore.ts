import { create } from 'zustand';
import { DemandPost, User, UserRole } from '@/types';

interface MarketState {
  currentUser: User | null;
  activeRole: UserRole;
  demands: DemandPost[];
  savedDemandIds: string[];
  
  // Actions
  setActiveRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  addDemand: (demand: DemandPost) => void;
  toggleSaveDemand: (demandId: string) => void;
  deleteDemand: (demandId: string) => void;
}

// Mock initial data
const mockUser: User = {
  id: 'u1',
  fullname: 'John Doe',
  email: 'john@example.com',
  phone: '08012345678',
  role: 'buyer',
  location: 'Lagos',
  created_at: new Date().toISOString(),
};

const mockDemands: DemandPost[] = [
  {
    id: 'd1',
    user_id: 'u1',
    title: 'Looking for 50 Bags of Maize',
    product_name: 'Maize',
    quantity: '50',
    unit: 'Bags',
    state: 'Kaduna',
    budget_min: 15000,
    budget_max: 20000,
    description: 'I need high-quality dry maize for poultry feed production. Delivery needed by next week.',
    phone_number: '08012345678',
    whatsapp_number: '08012345678',
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800'],
    urgency: 'High',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user: mockUser,
  },
  {
    id: 'd2',
    user_id: 'u2',
    title: 'Need fresh Tomatoes',
    product_name: 'Tomatoes',
    quantity: '20',
    unit: 'Baskets',
    state: 'Kano',
    description: 'Looking for fresh tomatoes for immediate pickup. Will pay market price.',
    phone_number: '09087654321',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800'],
    urgency: 'Medium',
    status: 'Active',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user: {
      id: 'u2',
      fullname: 'Aisha Bello',
      email: 'aisha@example.com',
      phone: '09087654321',
      role: 'buyer',
      location: 'Kano',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'd3',
    user_id: 'u3',
    title: 'Cassava Tubers required urgently',
    product_name: 'Cassava',
    quantity: '5',
    unit: 'Tons',
    state: 'Ogun',
    budget_max: 500000,
    description: 'Need 5 tons of cassava tubers for garri processing. Can handle logistics if within Ogun state.',
    phone_number: '08123456789',
    whatsapp_number: '08123456789',
    images: ['https://images.unsplash.com/photo-1627997970719-75f284e3a093?auto=format&fit=crop&q=80&w=800'],
    urgency: 'Emergency',
    status: 'Active',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 'u3',
      fullname: 'Oluwaseun Adetunji',
      email: 'olu@example.com',
      phone: '08123456789',
      role: 'buyer',
      location: 'Ogun',
      created_at: new Date().toISOString(),
    },
  }
];

export const useMarketStore = create<MarketState>((set) => ({
  currentUser: mockUser,
  activeRole: 'buyer', // Default for testing
  demands: mockDemands,
  savedDemandIds: ['d2'], // Start with one saved demand for testing
  
  setActiveRole: (role) => set((state) => ({
    activeRole: role,
    currentUser: state.currentUser ? { ...state.currentUser, role } : null
  })),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addDemand: (demand) => set((state) => ({ 
    demands: [demand, ...state.demands] 
  })),
  
  toggleSaveDemand: (demandId) => set((state) => {
    const isSaved = state.savedDemandIds.includes(demandId);
    return {
      savedDemandIds: isSaved 
        ? state.savedDemandIds.filter(id => id !== demandId)
        : [...state.savedDemandIds, demandId]
    };
  }),

  deleteDemand: (demandId) => set((state) => ({
    demands: state.demands.filter(d => d.id !== demandId),
    savedDemandIds: state.savedDemandIds.filter(id => id !== demandId)
  }))
}));
