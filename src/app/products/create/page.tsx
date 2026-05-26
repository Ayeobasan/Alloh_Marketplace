'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { message } from '@/components/ui/message';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, X, Loader2, Clock, Upload, ShieldAlert, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { getKycStatus } from '@/utils/format';
import { useCreateProduct } from '@/features/products/hooks/useCreateProduct';
import { productSchema, ProductFormValues } from '@/features/products/product.schema';
import { statesApi } from '@/services/api/states.api';
import { categoriesApi } from '@/services/api/categories.api';
import { usersApi } from '@/services/api/users.api';
import RoleGuard from '@/components/guards/RoleGuard';

const NIGERIAN_STATES = [
  'Lagos', 'Kano', 'Kaduna', 'Rivers', 'Oyo', 'Ogun', 'Abuja', 'Enugu', 'Anambra'
];

export default function CreateProduct() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  // Fetch fresh profile details from API
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getMe,
    enabled: !!currentUser,
  });

  const kycStatus = getKycStatus(profile) || getKycStatus(currentUser);
  const isKycPending = kycStatus === 'pending';

  // Fetch dynamic categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Fetch dynamic states
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const states = statesData.length > 0 ? statesData : NIGERIAN_STATES;

  // React Hook Form
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const [imagePreviews, setImagePreviews] = useState<{ id: string; url: string; file: File; progress?: number; error?: boolean }[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const createProductMutation = useCreateProduct();
  const isSubmitting = createProductMutation.isPending;

  // Client-side lightweight Canvas Image Compressor
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82 // 82% quality compression is sweet-spot
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    setIsCompressing(true);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        message.error(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setIsCompressing(false);
      return;
    }

    // Process and compress each image
    for (const file of validFiles) {
      const tempId = Math.random().toString(36).substring(7);
      
      // Setup initial loading preview
      setImagePreviews(prev => [...prev, {
        id: tempId,
        url: URL.createObjectURL(file),
        file,
        progress: 10,
      }]);

      try {
        const compressed = await compressImage(file);
        
        // Update state to compressed success
        setImagePreviews(prev => prev.map(item => {
          if (item.id === tempId) {
            return {
              ...item,
              url: URL.createObjectURL(compressed),
              file: compressed,
              progress: 100,
            };
          }
          return item;
        }));
      } catch (err) {
        // Failed upload recovery state
        setImagePreviews(prev => prev.map(item => {
          if (item.id === tempId) {
            return { ...item, error: true, progress: 0 };
          }
          return item;
        }));
        message.error(`Failed to compress image: ${file.name}`);
      }
    }
    setIsCompressing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImagePreviews(prev => prev.filter(item => item.id !== id));
  };

  const onSubmit = (data: ProductFormValues) => {
    if (isKycPending) {
      message.error('Your KYC verification is currently pending under review.');
      return;
    }

    if (imagePreviews.length === 0) {
      message.error('Please upload at least one product image.');
      return;
    }

    const payload = new FormData();
    payload.append('product_name', data.product_name);
    payload.append('category_id', data.category_id);
    payload.append('price', String(data.price));
    payload.append('quantity', data.quantity);
    payload.append('unit', data.unit);
    payload.append('state', data.state);
    payload.append('description', data.description);

    // Append all selected files
    imagePreviews.forEach(item => {
      payload.append('images', item.file);
    });

    createProductMutation.mutate(payload, {
      onSuccess: () => {
        message.success('Farm product listed successfully!');
        router.push('/demands');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to list product';
        message.error(errorMessage);
      }
    });
  };

  return (
    <RoleGuard allowedRoles={['seller']}>
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
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-emerald-600 w-5 h-5 animate-pulse" />
                List Your Product
              </h1>
            </div>
          </header>

          <main className="px-6 py-8 max-w-3xl mx-auto">
            <div className="mb-8 md:hidden">
              <h2 className="text-2xl font-bold text-slate-900">What are you selling?</h2>
              <p className="text-slate-500 mt-1">Provide attractive details to reach active agribusiness buyers.</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              {isKycPending ? (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">KYC Verification Pending</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                    Your profile farm credentials and document checks are currently under review by our moderation team. You can create product listings once your seller profile is fully approved.
                  </p>
                  <Link
                    href="/profile"
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors mt-2"
                  >
                    Check Profile Verification
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                  {/* Image Upload Gallery Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-900">
                      Product Images <span className="text-red-500">*</span>
                    </label>

                    {/* Image list grid */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {imagePreviews.map((item) => (
                          <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                            <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                            
                            {/* Upload/Compression progress bar */}
                            {item.progress !== undefined && item.progress < 100 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3">
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-1.5 transition-all duration-300" 
                                    style={{ width: `${item.progress}%` }} 
                                  />
                                </div>
                              </div>
                            )}

                            {/* Error warning state */}
                            {item.error && (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                <ShieldAlert className="text-red-600" size={24} />
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeImage(item.id)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dropzone container */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-200 ${
                        isDragActive 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400'
                      }`}
                    >
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2.5">
                          {isCompressing ? (
                            <Loader2 className="text-emerald-600 animate-spin" size={20} />
                          ) : (
                            <Upload className="text-emerald-600" size={20} />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {isCompressing ? 'Compressing images...' : 'Drag & drop images or tap to upload'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB (compression applied automatically)</span>
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          disabled={isCompressing}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Product Name <span className="text-red-500">*</span></label>
                      <input
                        {...register('product_name')}
                        placeholder="e.g. Yellow Cassava Roots"
                        className="input-field"
                      />
                      {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Product Category <span className="text-red-500">*</span></label>
                      <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                          <select {...field} className="input-field select-field bg-white">
                            <option value="">Select a Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Price Per Unit (₦) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="e.g. 15000"
                        className="input-field"
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-900">Quantity <span className="text-red-500">*</span></label>
                        <input
                          {...register('quantity')}
                          placeholder="e.g. 50"
                          className="input-field"
                        />
                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-900">Unit Type <span className="text-red-500">*</span></label>
                        <select
                          {...register('unit')}
                          className="input-field select-field bg-white"
                        >
                          <option value="">Select Unit</option>
                          <option value="bags">Bags</option>
                          <option value="tons">Tons</option>
                          <option value="kg">kg</option>
                          <option value="baskets">Baskets</option>
                          <option value="liters">Liters</option>
                          <option value="cartons">Cartons</option>
                          <option value="crates">Crates</option>
                          <option value="bundles">Bundles</option>
                          <option value="pieces">Pieces</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Location (State) <span className="text-red-500">*</span></label>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <select {...field} className="input-field select-field bg-white">
                            <option value="">Select State</option>
                            {states.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-900">Product Description <span className="text-red-500">*</span></label>
                    <textarea
                      {...register('description')}
                      rows={5}
                      placeholder="Give a detailed description of your product's condition, age, harvest timeline, and delivery terms."
                      className="input-field min-h-[120px] py-3"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isCompressing}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Publishing Listing...
                      </>
                    ) : (
                      'Publish Product Listing'
                    )}
                  </button>
                </form>
              )}
            </div>
          </main>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
