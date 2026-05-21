'use client';

import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { Sprout, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { farmName: string; experience: string; kycType: string; kycDocument: File }) => void;
  isSubmitting?: boolean;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  isSubmitting = false
}) => {
  const [farmName, setFarmName] = useState('');
  const [experience, setExperience] = useState('');
  const [kycType, setKycType] = useState('Farm Certification');
  const [kycDocument, setKycDocument] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        message.error('File size must be under 5MB.');
        return;
      }
      setKycDocument(file);
    }
  };

  const removeFile = () => {
    setKycDocument(null);
  };

  const handleSubmit = () => {
    if (!farmName.trim()) {
      message.error('Please enter your farm name.');
      return;
    }
    if (!experience.trim()) {
      message.error('Please enter your experience.');
      return;
    }
    if (!kycDocument) {
      message.error('Please upload your KYC verification document.');
      return;
    }

    onComplete({ farmName, experience, kycType, kycDocument });
  };

  const handleModalClose = () => {
    setFarmName('');
    setExperience('');
    setKycType('Farm Certification');
    setKycDocument(null);
    onClose();
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={handleModalClose}
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
              <Sprout size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Complete Seller Profile</h3>
              <p className="text-xs text-slate-500">Add your farm details to start selling</p>
            </div>
          </div>
          <button onClick={handleModalClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <InputField
            label="Farm Name"
            name="farmName"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            placeholder="e.g. Green Valley Organic Farm"
          />
          <InputField
            label="Years of Experience"
            name="experience"
            type="number"
            min="0"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 4"
          />

          {/* KYC Type Select */}
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-slate-700">Verification Document Type</label>
            </div>
            <select
              value={kycType}
              onChange={(e) => setKycType(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            >
              <option value="Farm Certification">Farm Certification</option>
              <option value="Government ID">Government ID</option>
              <option value="Business Permit">Business Permit</option>
            </select>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Verification Document</label>
            <label
              className={cn(
                "w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                "border-slate-200 bg-white hover:border-primary/40 hover:bg-emerald-50/30"
              )}
            >
              <input 
                type="file" 
                className="hidden" 
                accept=".jpg,.png,.pdf,.jpeg" 
                onChange={handleFileChange} 
              />
              <UploadCloud size={28} className="text-slate-400" />
              <p className="text-sm font-medium text-slate-500">
                Click to upload <span className="text-primary font-bold">document</span>
              </p>
              <p className="text-xs text-slate-400">Government ID, Business Permit, or Farm Cert</p>
            </label>

            {/* Selected File */}
            {kycDocument && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-xl">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-slate-700 flex-1 truncate">{kycDocument.name}</span>
                  <button onClick={removeFile} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleModalClose}
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
