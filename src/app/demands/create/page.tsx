'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useMarketStore } from '@/store/useMarketStore';
import { ArrowLeft, ImagePlus, X, Loader2 } from 'lucide-react';
import { Select, message } from 'antd';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

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
]; // Truncated for brevity

export default function CreateDemand() {
  const router = useRouter();
  const { addDemand, currentUser, activeRole } = useMarketStore();
  const isSeller = activeRole === 'seller';
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      urgency: 'Medium',
      phone_number: currentUser?.phone || ''
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: DemandFormValues) => {
    if (!imagePreview) {
      message.error('Please upload at least one image of the product or similar reference.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newDemand = {
        id: `d-${Date.now()}`,
        user_id: currentUser?.id || 'guest',
        ...data,
        budget_min: data.budget_min ? parseInt(data.budget_min) : undefined,
        budget_max: data.budget_max ? parseInt(data.budget_max) : undefined,
        images: [imagePreview],
        status: 'Active' as const,
        created_at: new Date().toISOString(),
        user: currentUser || undefined
      };

      addDemand(newDemand);
      message.success('Demand posted successfully!');
      router.push('/demands');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 font-sans pb-10">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
          <div className="px-6 h-16 flex items-center justify-between max-w-4xl mx-auto">
            <Link href="/demands" className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 md:hidden">{isSeller ? 'Post Goods' : 'Post a Demand'}</h1>
            <div className="w-10 md:hidden"></div> {/* Spacer */}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-slate-900">{isSeller ? 'Post Goods' : 'Post a Demand'}</h1>
            <p className="text-slate-500 mt-2 text-lg">{isSeller ? 'What do you have? Fill the details below to attract the right buyers.' : 'What do you need? Fill the details below to attract the right suppliers.'}</p>
          </div>
          
          <div className="mb-8 md:hidden">
            <h2 className="text-2xl font-bold text-slate-900">{isSeller ? 'What do you have?' : 'What do you need?'}</h2>
            <p className="text-slate-500 mt-1">{isSeller ? 'Fill the details below to attract the right buyers.' : 'Fill the details below to attract the right suppliers.'}</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Product Image <span className="text-red-500">*</span></label>
                {imagePreview ? (
                  <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImagePreview(null)}
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
                      <Select
                        {...field}
                        className="w-full h-[50px] custom-select"
                        placeholder="Select State"
                        options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))}
                      />
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
                      <Select
                        {...field}
                        className="w-full h-[50px] custom-select"
                        placeholder="e.g. Bags"
                        options={[
                          { value: 'Bags', label: 'Bags' },
                          { value: 'Tons', label: 'Tons' },
                          { value: 'Kg', label: 'Kilograms (Kg)' },
                          { value: 'Baskets', label: 'Baskets' },
                          { value: 'Pieces', label: 'Pieces' },
                        ]}
                      />
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
                          className={`flex-1 py-3 px-4 md:px-0 rounded-xl border text-sm font-bold transition-all ${
                            field.value === level 
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
          </div>
        </main>

        <style jsx global>{`
          .custom-select .ant-select-selector {
            border-radius: 0.75rem !important;
            border-color: #e2e8f0 !important;
            height: 50px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 1rem !important;
            box-shadow: none !important;
          }
          .custom-select.ant-select-focused .ant-select-selector {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
