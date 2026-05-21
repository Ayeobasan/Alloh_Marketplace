'use client';

import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  "Organic", "Fruits", "Grains", "Tubers", "Vegetables", "Dairy Products",
  "Wholesale", "Livestock", "Fertilizers", "Equipements", "Seeds", "Hydroponics", "Spices & Herbs"
];

interface BuyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (categories: string[]) => void;
}

export const BuyerProfileModal: React.FC<BuyerProfileModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = () => {
    if (selectedCategories.length === 0) {
      message.error('Please select at least one category.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(selectedCategories);
      setIsSubmitting(false);
      setSelectedCategories([]);
      message.success('Buyer profile completed! Enjoy your personalized experience.');
    }, 800);
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      className="font-sans"
      closable={false}
    >
      <div className="py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Experience Categories</h3>
              <p className="text-xs text-slate-500">Select the categories you care about most</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 pt-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-full border text-sm font-medium transition-all shadow-sm",
                selectedCategories.includes(cat)
                  ? "border-primary bg-emerald-50 text-primary font-bold"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedCategories.length > 0 && (
          <p className="text-xs text-slate-400 mt-4">
            {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
