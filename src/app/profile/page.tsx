'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandCard } from '@/components/ui/DemandCard';
import { User, MapPin, Calendar, Settings, LogOut, CheckCircle2, ArrowLeftRight, Loader2, ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';
import { SellerProfileModal } from '@/components/ui/SellerProfileModal';
import { BuyerProfileModal } from '@/components/ui/BuyerProfileModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users.api';
import { demandsApi } from '@/services/api/demands.api';
import { message, Modal } from 'antd';
import { EditProfileModal } from '@/components/ui/EditProfileModal';
import { EditDemandModal } from '@/components/ui/EditDemandModal';
import { DemandPost } from '@/types';

export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, role: activeRole, setRole, updateUser, clearCredentials, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posted' | 'saved'>('posted');
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditDemandModal, setShowEditDemandModal] = useState(false);
  const [selectedDemandToEdit, setSelectedDemandToEdit] = useState<DemandPost | null>(null);

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

  // Fetch posted demands (for Buyer view)
  const { data: myDemands = [], isLoading: isDemandsLoading } = useQuery({
    queryKey: ['my-demands'],
    queryFn: demandsApi.getMyPosts,
    enabled: isAuthenticated && activeRole === 'buyer',
  });

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

  // Seller profile setup mutation
  const setupSellerProfileMutation = useMutation({
    mutationFn: (payload: FormData) => usersApi.setupSellerProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setRole('seller');
      setShowSellerModal(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      message.success('Seller profile completed! Switched to Seller Mode. KYC is under review.');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to complete seller profile.');
    },
  });

  // Demand delete mutation
  const deleteDemandMutation = useMutation({
    mutationFn: (id: string) => demandsApi.deleteDemand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      message.success('Demand deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to delete demand.');
    }
  });

  // Demand update mutation
  const updateDemandMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) => demandsApi.updateDemand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      setShowEditDemandModal(false);
      setSelectedDemandToEdit(null);
      message.success('Demand updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update demand.');
    }
  });

  const handleDeleteDemand = (demand: DemandPost) => {
    Modal.confirm({
      title: 'Delete Demand Post',
      content: `Are you sure you want to delete "${demand.title}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: () => {
        deleteDemandMutation.mutate(demand.id);
      }
    });
  };

  const handleEditDemandClick = (demand: DemandPost) => {
    setSelectedDemandToEdit(demand);
    setShowEditDemandModal(true);
  };

  const handleSaveProfile = (formData: FormData) => {
    profileMutation.mutate(formData);
  };

  if (!isAuthenticated || !currentUser) return null;

  const handleSwitchToSeller = () => {
    // If user already has farm details, switch role directly
    const farm = profile?.farm_name || profile?.farmName || currentUser.farm_name || currentUser.farmName;
    if (farm) {
      setRole('seller');
      message.success('Switched to Seller Mode.');
    } else {
      setShowSellerModal(true);
    }
  };

  const handleSwitchToBuyer = () => {
    // If user already has categories, switch role directly
    const categories = profile?.categories || profile?.selectedCategories || currentUser.categories || currentUser.selectedCategories;
    if (categories && categories.length > 0) {
      setRole('buyer');
      message.success('Switched to Buyer Mode.');
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
    profileMutation.mutate({
      categories,
      selectedCategories: categories,
      role: 'buyer'
    }, {
      onSuccess: (updatedUser) => {
        updateUser(updatedUser);
        setRole('buyer');
        setShowBuyerModal(false);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        message.success('Buyer profile completed! Switched to Buyer Mode.');
      }
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

        <main className="max-w-5xl mx-auto px-6 -mt-16">
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
                  Joined {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                </div>

                {/* KYC Status Badge */}
                {(() => {
                  const kycStatus = profile?.kyc_status || profile?.kycStatus || currentUser?.kyc_status || currentUser?.kycStatus;
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
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                >
                  <ArrowLeftRight size={16} />
                  Switch to Seller
                </button>
              ) : (
                <button
                  onClick={handleSwitchToBuyer}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                >
                  <ArrowLeftRight size={16} />
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
                className={`text-lg font-bold pb-3 border-b-2 transition-colors ${activeRole === 'buyer' || activeTab === 'posted' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {activeRole === 'seller' ? 'My Posted Goods' : 'My Posted Demands'}
              </button>
            </div>

            {activeRole === 'buyer' ? (
              isDemandsLoading ? (
                <div className="flex items-center justify-center py-20 w-full col-span-full">
                  <Loader2 className="animate-spin text-primary" size={40} />
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
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                  <p className="text-slate-500 mb-4">You haven&apos;t posted any demands yet.</p>
                  <a href="/demands/create" className="text-emerald-600 font-bold hover:underline">Create your first post</a>
                </div>
              )
            ) : (
              // Seller browsing mode inside profile
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                <p className="text-slate-500 mb-4">Saved listings and posted goods are available in the marketplace.</p>
                <a href="/demands" className="text-emerald-600 font-bold hover:underline">Browse Marketplace</a>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden w-full flex items-center justify-center gap-2 text-red-500 font-bold py-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
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
          isSubmitting={profileMutation.isPending}
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
          onSave={(id, data) => updateDemandMutation.mutate({ id, payload: data })}
          isSubmitting={updateDemandMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
