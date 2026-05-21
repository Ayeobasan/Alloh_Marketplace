'use client';

import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { FileText, ImagePlus, MapPin, Phone, Trash2, X, Check, Loader2 } from 'lucide-react';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';
import { DemandPost, UrgencyLevel } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { statesApi } from '@/services/api/states.api';

interface EditDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: DemandPost | null;
  onSave: (id: string, data: FormData) => void;
  isSubmitting?: boolean;
}

const NIGERIAN_STATES = [
  'Lagos', 'Kano', 'Kaduna', 'Rivers', 'Oyo', 'Ogun', 'Abuja', 'Enugu', 'Anambra'
];

export const EditDemandModal: React.FC<EditDemandModalProps> = ({
  isOpen,
  onClose,
  demand,
  onSave,
  isSubmitting = false
}) => {
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [state, setState] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch dynamic states
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: isOpen
  });

  const states = statesData.length > 0 ? statesData : NIGERIAN_STATES;

  // Sync state when modal opens or demand changes
  useEffect(() => {
    if (isOpen && demand) {
      setTitle(demand.title);
      setProductName(demand.product_name);
      setQuantity(demand.quantity);
      setUnit(demand.unit.toLowerCase()); // Backend expects unit lowercase: e.g. bags, tons
      setState(demand.state);
      setBudgetMin(demand.budget_min ? String(demand.budget_min) : '');
      setBudgetMax(demand.budget_max ? String(demand.budget_max) : '');
      setDescription(demand.description);
      setPhone(demand.phone_number);
      setWhatsapp(demand.whatsapp_number || '');
      setUrgency(demand.urgency);
      setImagePreview(demand.images?.[0] || null);
      setSelectedFile(null);
    }
  }, [isOpen, demand]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demand) return;

    if (!title.trim() || title.length < 5) {
      message.error('Title must be at least 5 characters.');
      return;
    }
    if (!productName.trim()) {
      message.error('Product name is required.');
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
    if (!phone.trim() || phone.length < 10) {
      message.error('Valid phone number is required.');
      return;
    }

    // Check if any fields actually changed compared to current demand post
    const hasChanges =
      title.trim() !== demand.title ||
      productName.trim() !== demand.product_name ||
      quantity.trim() !== demand.quantity ||
      unit.toLowerCase() !== demand.unit.toLowerCase() ||
      state !== demand.state ||
      budgetMin !== (demand.budget_min ? String(demand.budget_min) : '') ||
      budgetMax !== (demand.budget_max ? String(demand.budget_max) : '') ||
      description.trim() !== demand.description ||
      phone.trim() !== demand.phone_number ||
      whatsapp.trim() !== (demand.whatsapp_number || '') ||
      urgency !== demand.urgency ||
      selectedFile !== null;

    if (!hasChanges) {
      message.info('No changes to update.');
      onClose();
      return;
    }

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('product_name', productName.trim());
    payload.append('quantity', quantity.trim());
    payload.append('unit', unit.toLowerCase());
    payload.append('state', state);
    if (budgetMin) payload.append('budget_min', budgetMin);
    if (budgetMax) payload.append('budget_max', budgetMax);
    payload.append('description', description.trim());
    payload.append('phone_number', phone.trim());
    if (whatsapp) payload.append('whatsapp_number', whatsapp.trim());
    payload.append('urgency', urgency);

    if (selectedFile) {
      payload.append('images', selectedFile);
    }

    onSave(demand.id, payload);
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
      <div className="py-2 max-h-[85vh] overflow-y-auto px-1 scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Posted Demand</h3>
              <p className="text-xs text-slate-500">Modify demand post credentials & preferences</p>
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

          {/* Title */}
          <InputField
            label="Demand Post Title *"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Need 50 Bags of Dry Rice urgently"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Product Name */}
            <InputField
              label="Product Name *"
              name="product_name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Rice"
              required
            />

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

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <InputField
              label="Quantity *"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              required
            />

            {/* Unit */}
            <div>
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
                <option value="kg">Kilograms (Kg)</option>
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

          <div className="grid grid-cols-2 gap-4">
            {/* Min Budget */}
            <InputField
              label="Min Budget (₦)"
              name="budget_min"
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="Optional"
            />
            {/* Max Budget */}
            <InputField
              label="Max Budget (₦)"
              name="budget_max"
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about delivery options, quality specifications..."
              className="w-full h-28 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <InputField
              label="Phone Number *"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="080..."
              leftElement={<Phone size={16} className="text-slate-400" />}
              required
            />
            {/* WhatsApp */}
            <InputField
              label="WhatsApp Number"
              name="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="080..."
              leftElement={<Phone size={16} className="text-slate-400" />}
            />
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Urgency Level</label>
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High', 'Emergency'] as UrgencyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all",
                    urgency === level
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
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
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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
