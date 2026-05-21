'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, ImagePlus, X, Loader2, Clock } from 'lucide-react';
import { message } from 'antd';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demandsApi } from '@/services/api/demands.api';
import { statesApi } from '@/services/api/states.api';
import { usersApi } from '@/services/api/users.api';

const demandSchema = z.object({
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

type DemandFormValues = z.infer<typeof demandSchema>;

const NIGERIAN_STATES = [
  'Lagos', 'Kano', 'Kaduna', 'Rivers', 'Oyo', 'Ogun', 'Abuja', 'Enugu', 'Anambra'
];

export default function CreateDemand() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, role: activeRole } = useAuthStore();
  const isSeller = activeRole === 'seller';

  // Fetch fresh profile details from API
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getMe,
    enabled: !!currentUser,
  });

  const kycStatus = profile?.kyc_status || profile?.kycStatus || currentUser?.kyc_status || currentUser?.kycStatus;
  const isKycPending = kycStatus === 'pending';

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch dynamic states
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const states = statesData.length > 0
    ? statesData
    : NIGERIAN_STATES;

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      urgency: 'Medium',
      phone_number: currentUser?.phone || ''
    }
  });

  // Prefill phone number if user updates
  useEffect(() => {
    if (currentUser?.phone) {
      setValue('phone_number', currentUser.phone);
    }
  }, [currentUser, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createDemandMutation = useMutation({
    mutationFn: (formData: FormData) => demandsApi.createDemand(formData),
    onSuccess: () => {
      message.success('Demand posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      router.push('/demands');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to post demand';
      message.error(errorMessage);
    }
  });

  const isSubmitting = createDemandMutation.isPending;

  const onSubmit = (data: DemandFormValues) => {
    if (isKycPending) {
      message.error('Your KYC verification is currently pending under review.');
      return;
    }

    if (!selectedFile) {
      message.error('Please upload a product image.');
      return;
    }

    const payload = new FormData();
    payload.append('title', data.title);
    payload.append('product_name', data.product_name);
    payload.append('quantity', data.quantity);
    payload.append('unit', data.unit);
    payload.append('state', data.state);
    if (data.budget_min) payload.append('budget_min', data.budget_min);
    if (data.budget_max) payload.append('budget_max', data.budget_max);
    payload.append('description', data.description);
    payload.append('phone_number', data.phone_number);
    if (data.whatsapp_number) payload.append('whatsapp_number', data.whatsapp_number);
    payload.append('urgency', data.urgency);
    payload.append('images', selectedFile);

    createDemandMutation.mutate(payload);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F9FAFB] pb-12 font-sans">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
          <div className="px-6 py-4 flex items-center gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{isSeller ? 'Post Goods' : 'Post a Demand'}</h1>
          </div>
        </header>

        <main className="px-6 py-8 max-w-3xl mx-auto">
          <div className="mb-8 md:hidden">
            <h2 className="text-2xl font-bold text-slate-900">{isSeller ? 'What do you have?' : 'What do you need?'}</h2>
            <p className="text-slate-500 mt-1">{isSeller ? 'Fill the details below to attract the right buyers.' : 'Fill the details below to attract the right suppliers.'}</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            {isKycPending ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                  <Clock size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">KYC Verification Pending</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                  Your profile documents are currently under review by our admin team. You cannot create new posts until your account is fully verified.
                </p>
                <Link
                  href="/profile"
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors mt-2"
                >
                  View Profile Status
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Product Image <span className="text-red-500">*</span></label>
                {imagePreview ? (
                  <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-emerald-500 transition-all">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <ImagePlus className="text-emerald-600" size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Tap to upload image</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Post Title <span className="text-red-500">*</span></label>
                <input
                  {...register('title')}
                  placeholder="e.g. Need 50 Bags of Dry Maize urgently"
                  className="input-field"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Product <span className="text-red-500">*</span></label>
                  <input {...register('product_name')} placeholder="e.g. Maize" className="input-field" />
                  {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">State <span className="text-red-500">*</span></label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-[50px] bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>Select State</option>
                        {states.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Quantity <span className="text-red-500">*</span></label>
                  <input type="number" {...register('quantity')} placeholder="e.g. 50" className="input-field" />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Unit <span className="text-red-500">*</span></label>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-[50px] bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>Select Unit</option>
                        <option value="bags">Bags</option>
                        <option value="tons">Tons</option>
                        <option value="kg">Kilograms (Kg)</option>
                        <option value="baskets">Baskets</option>
                        <option value="liters">Liters</option>
                        <option value="cartons">Cartons</option>
                        <option value="crates">Crates</option>
                        <option value="bundles">Bundles</option>
                        <option value="pieces">Pieces</option>
                        <option value="other">Other</option>
                      </select>
                    )}
                  />
                  {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Min Budget (₦)</label>
                  <input type="number" {...register('budget_min')} placeholder="Optional" className="input-field" />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Max Budget (₦)</label>
                  <input type="number" {...register('budget_max')} placeholder="Optional" className="input-field" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Description <span className="text-red-500">*</span></label>
                <textarea
                  {...register('description')}
                  placeholder="Provide more details about the quality, variety, or delivery terms..."
                  className="input-field min-h-[120px] resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Phone Number <span className="text-red-500">*</span></label>
                  <input {...register('phone_number')} placeholder="080..." className="input-field" />
                  {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">WhatsApp</label>
                  <input {...register('whatsapp_number')} placeholder="080..." className="input-field" />
                </div>
              </div>

              <div className="space-y-3 pb-6">
                <label className="block text-sm font-bold text-slate-900">Urgency Level</label>
                <Controller
                  name="urgency"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-3">
                      {['Low', 'Medium', 'High', 'Emergency'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={`flex-1 py-3 px-4 md:px-0 rounded-xl border text-sm font-bold transition-all ${field.value === level
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto md:min-w-[200px] btn-primary h-14 text-lg"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (isSeller ? 'Post Goods' : 'Post Demand')}
              </button>
            </form>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
