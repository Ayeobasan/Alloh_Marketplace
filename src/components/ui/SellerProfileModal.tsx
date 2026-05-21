'use client';

import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { Sprout, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { farmName: string; experience: string; documents: string[] }) => void;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [farmName, setFarmName] = useState('');
  const [experience, setExperience] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFakeUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setUploadedFiles(prev => [...prev, `document_${prev.length + 1}.pdf`]);
      setIsUploading(false);
    }, 1200);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

    setIsSubmitting(true);
    setTimeout(() => {
      onComplete({ farmName, experience, documents: uploadedFiles });
      setIsSubmitting(false);
      setFarmName('');
      setExperience('');
      setUploadedFiles([]);
      message.success('Seller profile completed! You are now a seller.');
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
              <Sprout size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Complete Seller Profile</h3>
              <p className="text-xs text-slate-500">Add your farm details to start selling</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
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
            label="Experience"
            name="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 5 years in crop farming"
          />

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Documents</label>
            <button
              type="button"
              onClick={handleFakeUpload}
              disabled={isUploading}
              className={cn(
                "w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
                isUploading
                  ? "border-primary/40 bg-emerald-50/50"
                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-emerald-50/30"
              )}
            >
              {isUploading ? (
                <>
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-primary">Uploading...</p>
                </>
              ) : (
                <>
                  <UploadCloud size={28} className="text-slate-400" />
                  <p className="text-sm font-medium text-slate-500">
                    Click to upload <span className="text-primary font-bold">documents</span>
                  </p>
                  <p className="text-xs text-slate-400">Government ID, Business Permit, or Farm Cert</p>
                </>
              )}
            </button>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-xl">
                    <CheckCircle2 size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-slate-700 flex-1">{file}</span>
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
