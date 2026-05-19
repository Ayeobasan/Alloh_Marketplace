import React, { useState } from 'react';
import { Modal, Radio, Space, Button, message } from 'antd';
import { ShieldAlert } from 'lucide-react';

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
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!reason) {
      message.error('Please select a reason for reporting.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      message.success('Report submitted successfully. Our team will review this listing.');
      setReason('');
      onClose();
    }, 1000);
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
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} className="rounded-xl font-medium">
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          danger 
          loading={isSubmitting} 
          onClick={handleSubmit}
          className="rounded-xl font-medium"
        >
          Submit Report
        </Button>
      ]}
      className="font-sans"
    >
      <div className="py-4">
        <p className="text-slate-600 mb-4">
          Why are you reporting this listing? Your report will be kept anonymous.
        </p>
        <Radio.Group onChange={(e) => setReason(e.target.value)} value={reason} className="w-full">
          <Space direction="vertical" className="w-full">
            {REPORT_REASONS.map((r, i) => (
              <Radio key={i} value={r} className="text-slate-700 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors">
                {r}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
    </Modal>
  );
};
