'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { message } from '@/components/ui/message';
import { FileText, ImagePlus, MapPin, X, Check, Loader2, RefreshCw } from 'lucide-react';
import { InputField } from '@/components/shared/InputField';
import { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { statesApi } from '@/services/api/states.api';
import { categoriesApi } from '@/services/api/categories.api';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (id: string, data: FormData) => void;
  isSubmitting?: boolean;
}

const NIGERIAN_STATES = [
  'Lagos', 'Kano', 'Kaduna', 'Rivers', 'Oyo', 'Ogun', 'Abuja', 'Enugu', 'Anambra'
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  isSubmitting = false
}) => {
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Fetch dynamic states
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: isOpen
  });

  // Fetch dynamic categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: isOpen
  });

  const states = statesData.length > 0 ? statesData : NIGERIAN_STATES;

  // Sync state when modal opens or product changes
  useEffect(() => {
    if (isOpen && product) {
      setProductName(product.product_name);
      setCategoryId(product.category_id || '');
      setPrice(String(product.price));
      setQuantity(product.quantity);
      setUnit(product.unit);
      setState(product.state);
      setDescription(product.description);
      setImagePreview(product.images?.[0] || null);
      setSelectedFile(null);
    }
  }, [isOpen, product]);

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
            0.82
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.error('Please upload an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image must be less than 5MB');
        return;
      }

      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setSelectedFile(compressed);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        message.error('Failed to compress image.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!productName.trim()) {
      message.error('Product name is required.');
      return;
    }
    if (!categoryId.trim()) {
      message.error('Category is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      message.error('Please provide a valid price greater than zero.');
      return;
    }
    if (!quantity.trim()) {
      message.error('Quantity is required.');
      return;
    }
    if (!unit.trim()) {
      message.error('Unit is required.');
      return;
    }
    if (!state.trim()) {
      message.error('State is required.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      message.error('Description must be at least 20 characters.');
      return;
    }

    // Check if any fields actually changed compared to current product
    const hasChanges =
      productName.trim() !== product.product_name ||
      categoryId !== product.category_id ||
      numPrice !== product.price ||
      quantity.trim() !== product.quantity ||
      unit !== product.unit ||
      state !== product.state ||
      description.trim() !== product.description ||
      selectedFile !== null;

    if (!hasChanges) {
      message.info('No changes to update.');
      onClose();
      return;
    }

    const payload = new FormData();
    payload.append('product_name', productName.trim());
    payload.append('category_id', categoryId);
    payload.append('price', String(numPrice));
    payload.append('quantity', quantity.trim());
    payload.append('unit', unit);
    payload.append('state', state);
    payload.append('description', description.trim());

    if (selectedFile) {
      payload.append('images', selectedFile);
    }

    onSave(product.id, payload);
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="font-sans"
      closable={false}
    >
      <div className="py-2 px-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Product Listing</h3>
              <p className="text-xs text-slate-500">Modify product credentials & specifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload Preview Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Product Image</label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X size={14} />
                </button>
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-emerald-500 transition-all">
                <ImagePlus className="text-slate-400 mb-2" size={24} />
                <span className="text-xs font-bold text-slate-600">Tap to upload new image</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Product Name */}
          <InputField
            label="Product Name *"
            name="product_name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Yellow Cassava Roots"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-[50px] bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-[50px] bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
                required
              >
                <option value="" disabled>Select State</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Price */}
            <div className="col-span-1">
              <InputField
                label="Price Per Unit (₦) *"
                name="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                required
              />
            </div>
            {/* Quantity */}
            <div className="col-span-1">
              <InputField
                label="Quantity *"
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Qty"
                required
              />
            </div>
            {/* Unit */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-[50px] bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
                required
              >
                <option value="" disabled>Select Unit</option>
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
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about product quality, harvest time, supply availability..."
              className="w-full h-28 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm resize-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="flex-1 h-12 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
