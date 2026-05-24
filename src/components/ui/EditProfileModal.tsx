'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { message } from '@/components/ui/message';
import { User as UserIcon, MapPin, Phone, UploadCloud, X, Check, FileText, Lock } from 'lucide-react';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { statesApi } from '@/services/api/states.api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeRole: 'buyer' | 'seller';
  onSave: (data: FormData) => void;
  isSubmitting?: boolean;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  activeRole,
  onSave,
  isSubmitting = false
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Seller-specific states
  const [farmName, setFarmName] = useState('');
  const [experience, setExperience] = useState('');
  const [kycType, setKycType] = useState('');
  const [kycDocFile, setKycDocFile] = useState<File | null>(null);
  const [kycDocName, setKycDocName] = useState('');

  // Dropdown & search select states
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch dynamic Nigerian states
  const { data: statesData = [] } = useQuery({
    queryKey: ['states'],
    queryFn: statesApi.getStates,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: isOpen
  });

  const statesList = statesData.length > 0 ? statesData : NIGERIAN_STATES;

  // Initialize fields on open
  useEffect(() => {
    if (isOpen && user) {
      // Split fullname into first_name and last_name if they are not explicitly present
      const first = user.first_name || user.fullname?.split(' ')[0] || '';
      const last = user.last_name || user.fullname?.split(' ').slice(1).join(' ') || '';

      setFirstName(first);
      setLastName(last);
      setLocation(user.location || '');
      setPhone(user.phone_number || user.phone || '');
      setAvatarFile(null);
      setAvatarPreview(user.avatar || null);

      // Seller fields initialization
      setFarmName(user.farm_name || user.farmName || '');
      setExperience(user.experience_years ? String(user.experience_years) : (user.experience ? String(user.experience) : ''));
      setKycType(user.kyc_type || user.kycType || '');
      setKycDocFile(null);
      setKycDocName(
        user.documents?.[0] ||
        (typeof user.kycDocument === 'string' ? user.kycDocument : '') ||
        (typeof user.kyc_document === 'string' ? user.kyc_document : '') ||
        (typeof user.document === 'string' ? user.document : '') ||
        (typeof user.kyc_document_url === 'string' ? user.kyc_document_url : '') ||
        ''
      );

      // Close dropdowns
      setIsOpenDropdown(false);
      setSearchQuery('');
    }
  }, [isOpen, user]);

  // Click outside to close custom searchable dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        message.error('Avatar file size must be under 5MB.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const filteredStates = statesList.filter(state =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      message.error('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      message.error('Last name is required.');
      return;
    }
    if (!location.trim()) {
      message.error('Location (State) is required.');
      return;
    }

    if (activeRole === 'seller') {
      if (!farmName.trim()) {
        message.error('Farm name is required.');
        return;
      }
      if (!experience.trim()) {
        message.error('Experience is required.');
        return;
      }
    }

    // Check if any fields actually changed compared to current user profile
    const origFirst = user.first_name || user.fullname?.split(' ')[0] || '';
    const origLast = user.last_name || user.fullname?.split(' ').slice(1).join(' ') || '';
    const origLocation = user.location || '';
    const origPhone = user.phone_number || user.phone || '';

    // Seller fields delta
    const origFarmName = user.farm_name || user.farmName || '';
    const origExperience = user.experience_years ? String(user.experience_years) : (user.experience ? String(user.experience) : '');

    const hasSellerChanges = activeRole === 'seller' && (
      farmName.trim() !== origFarmName ||
      experience.trim() !== origExperience
    );

    const hasChanges =
      firstName.trim() !== origFirst ||
      lastName.trim() !== origLast ||
      location.trim() !== origLocation ||
      phone.trim() !== origPhone ||
      avatarFile !== null ||
      hasSellerChanges;

    if (!hasChanges) {
      message.info('No changes to update.');
      onClose();
      return;
    }

    const payload = new FormData();
    payload.append('first_name', firstName.trim());
    payload.append('last_name', lastName.trim());
    payload.append('fullname', `${firstName.trim()} ${lastName.trim()}`);
    payload.append('location', location.trim());
    payload.append('phone_number', phone.trim());
    payload.append('phone', phone.trim());

    if (avatarFile) {
      payload.append('avatar', avatarFile);
    }

    if (activeRole === 'seller') {
      payload.append('farmName', farmName.trim());
      payload.append('farm_name', farmName.trim());
      payload.append('experience', experience.trim());
      payload.append('experience_years', experience.trim());
    }

    onSave(payload);
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
      <div className="py-2 px-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-1 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary">
              <UserIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeRole === 'seller' ? 'Update Seller Profile' : 'Update Profile Details'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeRole === 'seller' ? 'Edit credentials, farm details & KYC' : 'Edit your profile credentials & avatar'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Edit Section */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
            <div className="relative group cursor-pointer" onClick={handleTriggerUpload}>
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold relative transition-transform group-hover:scale-105">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  firstName ? firstName.charAt(0) : 'U'
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadCloud size={20} />
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Change</span>
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleTriggerUpload}
              className="mt-3 text-xs font-bold text-primary hover:underline"
            >
              Upload New Photo
            </button>
            <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG up to 5MB</p>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First Name"
              name="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="David"
              required
            />
            <InputField
              label="Last Name"
              name="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Horjet"
              required
            />
          </div>

          {/* Location Searchable Select Dropdown */}
          <div className="relative space-y-2" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Location (State) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={isOpenDropdown ? searchQuery : location}
                onFocus={() => {
                  setIsOpenDropdown(true);
                  setSearchQuery(location);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLocation(e.target.value); // fallback so they can also type custom cities
                }}
                placeholder="Search state..."
                className="w-full h-[50px] bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MapPin size={16} />
              </div>
            </div>

            {/* Dropdown Card */}
            {isOpenDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-48 overflow-y-auto scrollbar-thin py-2">
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        setLocation(state);
                        setIsOpenDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors",
                        location === state ? "bg-emerald-50/50 text-emerald-700 font-semibold" : "text-slate-700"
                      )}
                    >
                      {state}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center">
                    No matching Nigerian states. You can type custom location.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <InputField
            label="Phone Number"
            name="phone_number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 08012345678"
            leftElement={<Phone size={16} className="text-slate-400" />}
          />

          {/* Seller Specific Fields */}
          {activeRole === 'seller' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                {/* Farm Name */}
                <InputField
                  label="Farm Name *"
                  name="farmName"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Horjet Farms"
                  required
                  disabled={true}
                  rightElement={<Lock size={14} className="text-slate-400" />}
                  className="disabled:opacity-65 disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
                />
                {/* Experience */}
                <InputField
                  label="Years of Experience *"
                  name="experience"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 4"
                  required
                  disabled={true}
                  rightElement={<Lock size={14} className="text-slate-400" />}
                  className="disabled:opacity-65 disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
                />
              </div>

              {/* KYC Document Type Select */}
              {/* <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">KYC Document Type *</label>
                <div className="relative">
                  <select
                    value={kycType}
                    onChange={(e) => setKycType(e.target.value)}
                    className="w-full h-[50px] bg-slate-100 border border-slate-200 rounded-xl pl-4 pr-10 text-sm focus:outline-none transition-all shadow-sm cursor-not-allowed opacity-65 appearance-none"
                    required
                    disabled={true}
                  >
                    <option value="" disabled>Select KYC Document Type</option>
                    <option value="Farm Certification">Farm Certification</option>
                    <option value="Cooperative Registration">Cooperative Registration</option>
                    <option value="Government ID">Government ID</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </div>
                </div>
              </div> */}

              {/* KYC Document Attachment */}
              {/* <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">KYC Document Attachment</label>
                <label className="flex items-center justify-between w-full h-[50px] bg-slate-100/70 border border-dashed border-slate-200 rounded-xl px-4 cursor-not-allowed opacity-65 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-200 rounded-lg text-slate-400">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs text-slate-500 truncate max-w-[240px]">
                      {kycDocFile ? kycDocFile.name : (kycDocName ? 'document_attached.pdf' : 'No document attached')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Locked</span>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/*" 
                    disabled={true}
                  />
                </label>
                <p className="text-[10px] text-slate-400">Verification documents cannot be edited once profile is completed.</p>
              </div> */}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
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
              {isSubmitting ? 'Saving...' : (
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
