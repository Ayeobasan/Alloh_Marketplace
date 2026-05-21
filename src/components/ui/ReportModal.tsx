import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports.api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const REPORT_REASONS = [
  'Fake or fraudulent listing',
  'Suspicious buyer/seller',
  'Incorrect or misleading information',
  'Spam or duplicate post',
  'Inappropriate content',
  'Other'
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, postId }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customDetail, setCustomDetail] = useState<string>('');

  const reportMutation = useMutation({
    mutationFn: () => {
      const finalReason = selectedReason === 'Other' ? customDetail.trim() : selectedReason;
      return reportsApi.createReport({ postId, reason: finalReason });
    },
    onSuccess: () => {
      message.success('Report submitted successfully. Our team will review this listing.');
      setSelectedReason('');
      setCustomDetail('');
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to submit report. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!selectedReason) {
      message.error('Please select a reason for reporting.');
      return;
    }
    if (selectedReason === 'Other') {
      if (!customDetail.trim()) {
        message.error('Please type your reason for reporting.');
        return;
      }
      if (customDetail.trim().length < 10) {
        message.error('Please provide a detailed reason (at least 10 characters).');
        return;
      }
    }
    reportMutation.mutate();
  };

  const handleCancel = () => {
    setSelectedReason('');
    setCustomDetail('');
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-600">
          <ShieldAlert size={20} />
          <span>Report Listing</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <button
          key="cancel"
          onClick={handleCancel}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors mr-3 cursor-pointer"
        >
          Cancel
        </button>,
        <button
          key="submit"
          disabled={reportMutation.isPending}
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold rounded-xl shadow-md transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          {reportMutation.isPending && <Loader2 className="animate-spin" size={16} />}
          Submit Report
        </button>
      ]}
      className="font-sans"
    >
      <div className="py-4">
        <p className="text-slate-600 mb-4">
          Why are you reporting this listing? Your report will be kept anonymous.
        </p>
        <div className="space-y-2">
          {REPORT_REASONS.map((r, i) => (
            <div key={i} className="flex flex-col gap-2">
              <label
                className={`flex items-center gap-3 w-full p-3 border rounded-xl cursor-pointer transition-colors ${selectedReason === r
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-slate-100 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r}
                  checked={selectedReason === r}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500 accent-red-600"
                />
                <span className="text-sm font-medium text-slate-700">{r}</span>
              </label>

              {r === 'Other' && selectedReason === 'Other' && (
                <div className="pl-7 pr-1 pb-2 animate-in slide-in-from-top-1 duration-200">
                  <textarea
                    value={customDetail}
                    onChange={(e) => setCustomDetail(e.target.value)}
                    placeholder="Describe the issue in detail (at least 10 characters)..."
                    className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm resize-none"
                    maxLength={500}
                    required
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-[10px] text-slate-400">
                      {customDetail.trim().length < 10 ? (
                        <span className="text-red-500 font-medium">Needs at least {10 - customDetail.trim().length} more characters</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Character count valid</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">{customDetail.length}/500</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};