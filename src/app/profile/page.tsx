'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { ProductCard } from '@/components/ui/ProductCard';
import { User, MapPin, Calendar, Settings, LogOut, CheckCircle2, ArrowLeftRight, Loader2, ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';
import { SellerProfileModal } from '@/components/ui/SellerProfileModal';
import { BuyerProfileModal } from '@/components/ui/BuyerProfileModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users.api';
import { message } from '@/components/ui/message';
import { Modal } from '@/components/ui/Modal';
import { EditProfileModal } from '@/components/ui/EditProfileModal';
import { EditDemandModal } from '@/components/ui/EditDemandModal';
import { EditProductModal } from '@/components/ui/EditProductModal';
import { useMarketplaceRole } from '@/hooks/useMarketplaceRole';
import { useMyProducts } from '@/features/products/hooks/useMyProducts';
import { useDeleteProduct } from '@/features/products/hooks/useDeleteProduct';
import { useUpdateProduct } from '@/features/products/hooks/useUpdateProduct';
import { useMyDemands } from '@/features/demands/hooks/useMyDemands';
import { useDeleteDemand } from '@/features/demands/hooks/useDeleteDemand';
import { useUpdateDemand } from '@/features/demands/hooks/useUpdateDemand';
import { DemandPost, Product } from '@/types';
import { getKycStatus } from '@/utils/format';

export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, updateUser, clearCredentials, isAuthenticated } = useAuthStore();
  const { activeRole, switchRole } = useMarketplaceRole();

  const [activeTab, setActiveTab] = useState<'posted' | 'saved'>('posted');
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditDemandModal, setShowEditDemandModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedDemandToEdit, setSelectedDemandToEdit] = useState<DemandPost | null>(null);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);

  // Sync session authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch fresh profile details from API
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getMe,
    enabled: isAuthenticated,
  });

  // --- Buyer State & Hooks ---
  // Fetch posted demands (for Buyer view)
  const { data: myDemands = [], isLoading: isDemandsLoading } = useMyDemands(
    isAuthenticated && activeRole === 'buyer'
  );

  const deleteDemandMutation = useDeleteDemand();
  const updateDemandMutation = useUpdateDemand();

  // --- Seller State & Hooks ---
  // Fetch posted products (for Seller view)
  const { data: myProductsResponse, isLoading: isProductsLoading } = useMyProducts(
    { page: 1, limit: 50 },
    isAuthenticated && activeRole === 'seller'
  );
  const myProducts = myProductsResponse?.data || [];

  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: (payload: FormData | any) => usersApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowEditProfileModal(false);
      message.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update profile.');
    },
  });

  // Dedicated role switch mutation to sync with backend database
  const switchRoleMutation = useMutation({
    mutationFn: (newRole: 'buyer' | 'seller') => usersApi.updateProfile({ role: newRole }),
    onSuccess: (updatedUser, newRole) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      switchRole(newRole);

      // Log out user to force re-authentication under the new role
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('switching_role', newRole);
      }
      clearCredentials();
      message.success(`Marketplace role switched successfully. Please log back in as a ${newRole === 'seller' ? 'Seller' : 'Buyer'}.`);
      router.push(`/login?role=${newRole}`);
    },
    onError: (error: any, newRole: 'buyer' | 'seller') => {
      const errMsg = error.response?.data?.message || error.message || '';
      if (errMsg.includes('No fields to update')) {
        // Even if backend says "No fields to update", it means the role is already set correctly on the backend.
        // We log them out so they can log back in as the new role.
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('switching_role', newRole);
        }
        clearCredentials();
        message.success(`Marketplace role switched successfully. Please log back in as a ${newRole === 'seller' ? 'Seller' : 'Buyer'}.`);
        router.push(`/login?role=${newRole}`);
      } else {
        message.error(errMsg || 'Failed to switch marketplace role.');
      }
    },
  });

  // Seller profile setup mutation
  const setupSellerProfileMutation = useMutation({
    mutationFn: (payload: FormData) => usersApi.setupSellerProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setShowSellerModal(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Log out user to force re-authentication under the new role
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('switching_role', 'seller');
      }
      clearCredentials();
      message.success('Seller profile completed! Please log back in as a Seller. KYC is under review.');
      router.push('/login?role=seller');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to complete seller profile.');
    },
  });

  // Buyer profile setup mutation
  const setupBuyerProfileMutation = useMutation({
    mutationFn: (payload: { categories: string[] }) => usersApi.setupBuyerProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setShowBuyerModal(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Log out user to force re-authentication under the new role
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('switching_role', 'buyer');
      }
      clearCredentials();
      message.success('Buyer profile completed! Please log back in as a Buyer.');
      router.push('/login?role=buyer');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to complete buyer profile.');
    },
  });

  const handleDeleteDemand = (demand: DemandPost) => {
    Modal.confirm({
      title: 'Delete Demand Post',
      content: `Are you sure you want to delete "${demand.title}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: () => {
        deleteDemandMutation.mutate(demand.id, {
          onSuccess: () => {
            message.success('Demand deleted successfully!');
          },
          onError: (err: any) => {
            message.error(err.message || 'Failed to delete demand.');
          }
        });
      }
    });
  };

  const handleDeleteProduct = (product: Product) => {
    Modal.confirm({
      title: 'Delete Product Listing',
      content: `Are you sure you want to delete "${product.product_name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: () => {
        deleteProductMutation.mutate(product.id, {
          onSuccess: () => {
            message.success('Product deleted successfully!');
          },
          onError: (err: any) => {
            message.error(err.message || 'Failed to delete product.');
          }
        });
      }
    });
  };

  const handleEditDemandClick = (demand: DemandPost) => {
    setSelectedDemandToEdit(demand);
    setShowEditDemandModal(true);
  };

  const handleEditProductClick = (product: Product) => {
    setSelectedProductToEdit(product);
    setShowEditProductModal(true);
  };

  const handleSaveProfile = (formData: FormData) => {
    profileMutation.mutate(formData);
  };

  if (!isAuthenticated || !currentUser) return null;

  const handleSwitchToSeller = () => {
    // If user already has farm details, switch role directly
    const farm = profile?.farm_name || profile?.farmName || currentUser.farm_name || currentUser.farmName;
    if (farm) {
      switchRoleMutation.mutate('seller');
    } else {
      setShowSellerModal(true);
    }
  };

  const handleSwitchToBuyer = () => {
    // If user already has categories, switch role directly
    const categories = profile?.categories || profile?.selectedCategories || currentUser.categories || currentUser.selectedCategories;
    if (categories && categories.length > 0) {
      switchRoleMutation.mutate('buyer');
    } else {
      setShowBuyerModal(true);
    }
  };

  const handleSellerProfileComplete = (data: { farmName: string; experience: string; kycType: string; kycDocument: File }) => {
    const payload = new FormData();
    payload.append('farmName', data.farmName);
    payload.append('experience', data.experience);
    payload.append('kycType', data.kycType);
    payload.append('kycDocument', data.kycDocument);

    setupSellerProfileMutation.mutate(payload);
  };

  const handleBuyerProfileComplete = (categories: string[]) => {
    setupBuyerProfileMutation.mutate({
      categories,
    });
  };

  const handleLogout = () => {
    clearCredentials();
    message.success('Logged out successfully.');
    router.push('/login');
  };

  const userDisplayName = profile?.fullname || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : '') || currentUser.fullname || 'User';
  const userLocation = profile?.location || currentUser.location || 'Nigeria';
  const userAvatar = profile?.avatar || currentUser.avatar;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans">
        <header className="bg-emerald-600 text-white pt-12 pb-24 px-6 md:rounded-b-[2.5rem] relative">
          <div className="max-w-5xl mx-auto flex justify-between items-start">
            <h1 className="text-2xl font-bold">Profile</h1>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-emerald-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-emerald-600 text-3xl md:text-4xl font-bold relative">
              {userAvatar ? (
                <img src={userAvatar} alt={userDisplayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userDisplayName.charAt(0)
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 size={12} className="md:w-4 md:h-4" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{userDisplayName}</h2>
              <p className="text-slate-500 text-sm font-medium mb-4 flex items-center justify-center md:justify-start gap-1">
                <MapPin size={14} /> {userLocation}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-500 mb-6 md:mb-0">
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full">
                  <User size={14} />
                  <span className="capitalize">{activeRole} Account</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Calendar size={14} />
                  Joined {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2026'}
                </div>

                {/* KYC Status Badge */}
                {(() => {
                  const kycStatus = getKycStatus(profile) || getKycStatus(currentUser);
                  if (kycStatus === 'approved') {
                    return (
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Verified KYC</span>
                      </div>
                    );
                  }
                  if (kycStatus === 'pending') {
                    return (
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100 animate-pulse">
                        <Clock size={14} className="text-amber-600" />
                        <span>KYC Under Review</span>
                      </div>
                    );
                  }
                  if (kycStatus === 'rejected') {
                    return (
                      <div className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100">
                        <ShieldX size={14} className="text-red-600" />
                        <span>KYC Rejected</span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-center gap-1 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full border border-slate-100">
                      <ShieldAlert size={14} className="text-slate-400" />
                      <span>Unverified KYC</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Role Switch Button */}
            <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:shrink-0 md:self-center">
              {activeRole === 'buyer' ? (
                <button
                  onClick={handleSwitchToSeller}
                  disabled={switchRoleMutation.isPending}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {switchRoleMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                  ) : (
                    <ArrowLeftRight size={16} />
                  )}
                  Switch to Seller
                </button>
              ) : (
                <button
                  onClick={handleSwitchToBuyer}
                  disabled={switchRoleMutation.isPending}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {switchRoleMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                  ) : (
                    <ArrowLeftRight size={16} />
                  )}
                  Switch to Buyer
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Content Based on Role */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-6 border-b border-slate-100">
              <button
                onClick={() => setActiveTab('posted')}
                className="text-lg font-bold pb-3 border-b-2 border-emerald-600 text-slate-900 transition-colors"
              >
                {activeRole === 'seller' ? 'My Posted Goods' : 'My Posted Demands'}
              </button>
            </div>

            {activeRole === 'buyer' ? (
              isDemandsLoading ? (
                <div className="flex items-center justify-center py-20 w-full col-span-full">
                  <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
              ) : myDemands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myDemands.map(demand => (
                    <DemandCard
                      key={demand.id}
                      demand={demand}
                      hideActions={true}
                      showEditDelete={true}
                      onEdit={handleEditDemandClick}
                      onDelete={handleDeleteDemand}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
                  <p className="text-slate-400 mb-4 font-medium">You haven&apos;t created any listings yet.</p>
                  <Link href="/demands/create" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all inline-block">
                    Create your first post
                  </Link>
                </div>
              )
            ) : (
              // Seller browsing mode inside profile
              isProductsLoading ? (
                <div className="flex items-center justify-center py-20 w-full col-span-full">
                  <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
              ) : myProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showEditDelete={true}
                      onEdit={handleEditProductClick}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
                  <p className="text-slate-400 mb-4 font-medium">You haven&apos;t created any listings yet.</p>
                  <Link href="/products/create" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all inline-block">
                    List Your First Product
                  </Link>
                </div>
              )
            )}
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden w-full flex items-center justify-center gap-2 text-red-500 font-bold py-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer mb-8"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </main>

        {/* Modals */}
        <SellerProfileModal
          isOpen={showSellerModal}
          onClose={() => setShowSellerModal(false)}
          onComplete={handleSellerProfileComplete}
          isSubmitting={setupSellerProfileMutation.isPending}
        />
        <BuyerProfileModal
          isOpen={showBuyerModal}
          onClose={() => setShowBuyerModal(false)}
          onComplete={handleBuyerProfileComplete}
          isSubmitting={setupBuyerProfileMutation.isPending}
        />
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          user={profile || currentUser}
          activeRole={activeRole}
          onSave={handleSaveProfile}
          isSubmitting={profileMutation.isPending}
        />
        <EditDemandModal
          isOpen={showEditDemandModal}
          onClose={() => setShowEditDemandModal(false)}
          demand={selectedDemandToEdit}
          onSave={(id, data) => {
            updateDemandMutation.mutate(
              { id, data },
              {
                onSuccess: () => {
                  message.success('Demand updated successfully!');
                  setShowEditDemandModal(false);
                  setSelectedDemandToEdit(null);
                },
                onError: (err: any) => {
                  message.error(err.message || 'Failed to update demand.');
                }
              }
            );
          }}
          isSubmitting={updateDemandMutation.isPending}
        />
        <EditProductModal
          isOpen={showEditProductModal}
          onClose={() => setShowEditProductModal(false)}
          product={selectedProductToEdit}
          onSave={(id, data) => {
            updateProductMutation.mutate(
              { id, formData: data },
              {
                onSuccess: () => {
                  message.success('Product updated successfully!');
                  setShowEditProductModal(false);
                  setSelectedProductToEdit(null);
                },
                onError: (err: any) => {
                  message.error(err.message || 'Failed to update product.');
                }
              }
            );
          }}
          isSubmitting={updateProductMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
