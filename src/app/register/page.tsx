"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stepper } from '@/components/shared/Stepper';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { AccountCard } from '@/components/shared/AccountCard';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Sprout,
  UploadCloud,
  Eye,
  EyeOff,
  Mail,
  Loader2,
} from 'lucide-react';
import { message } from 'antd';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth.api';
import { categoriesApi } from '@/services/api/categories.api';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  farmName: z.string().optional(),
  experience: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterInput = z.infer<typeof registerSchema>;
type SubStep = 'selection' | 'uploading' | 'verifying' | 'success' | 'otp' | 'verified';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<SubStep>('selection');
  const [accountType, setAccountType] = useState<'buyer' | 'seller' | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [otpValue, setOtpValue] = useState<string>('');

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  // Query: Categories metadata
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const categories = categoriesData?.map((c: any) => c.name) || [
    "Organic", "Fruits", "Grains", "Tubers", "Vegetables", "Dairy Products",
    "Wholesale", "Livestock", "Fertilizers", "Equipements", "Seeds", "Hydroponics", "Spices & Herbs"
  ];

  // Mutation: Register Buyer
  const registerBuyerMutation = useMutation({
    mutationFn: (data: RegisterInput) => {
      return authApi.registerBuyer({
        firstName: data.firstName,
        lastName: data.lastName,
        fullname: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        phoneNumber: data.phone,
        phone_number: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        categories: selectedCategories,
      });
    },
    onSuccess: () => {
      message.success('Account registered! Verification code sent to your email.');
      setStep(4);
      setSubStep('otp');
    },
    onError: (error: any) => {
      message.error(error.message || 'Registration failed.');
    },
  });

  // Mutation: Register Seller
  const registerSellerMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return authApi.registerSeller(formData);
    },
    onSuccess: () => {
      setSubStep('success');
      setTimeout(() => {
        setStep(4);
        setSubStep('otp');
      }, 1500);
    },
    onError: (error: any) => {
      message.error(error.message || 'Registration failed.');
      setSubStep('uploading');
    },
  });

  // Mutation: Verify Email
  const verifyEmailMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => {
      return authApi.verifyEmail(email, code);
    },
    onSuccess: () => {
      message.success('Email verified successfully!');
      setSubStep('verified');
    },
    onError: (error: any) => {
      message.error(error.message || 'OTP verification failed.');
    },
  });

  // Mutation: Resend OTP
  const resendOtpMutation = useMutation({
    mutationFn: (email: string) => authApi.resendOtp(email),
    onSuccess: () => {
      message.success('Verification code resent successfully.');
    },
    onError: (error: any) => {
      message.error(error.message || 'Resend failed.');
    },
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        message.error('File size must be under 5MB.');
        return;
      }
      setUploadedFile(file);
      setSubStep('uploading');
    }
  };

  const getStep2Progress = () => {
    const vals = getValues();
    const fields = accountType === 'buyer'
      ? [vals.firstName, vals.lastName, vals.email, vals.phone, vals.password, vals.confirmPassword]
      : [vals.firstName, vals.lastName, vals.farmName, vals.experience, vals.email, vals.phone, vals.password, vals.confirmPassword];
    const filledFields = fields.filter(f => f && f.length > 0).length;
    return filledFields / fields.length;
  };

  const getSubStepProgress = () => {
    if (step === 2) return getStep2Progress();
    if (step === 3) {
      if (accountType === 'buyer') return selectedCategories.length > 0 ? 0.8 : 0.2;
      if (subStep === 'uploading') return 0.25;
      if (subStep === 'verifying') return 0.5;
      if (subStep === 'success') return 0.75;
    }
    return 0;
  };

  const nextStep = async () => {
    if (step === 1 && accountType) { setStep(2); return; }
    
    if (step === 2) {
      // Validate only relevant fields before proceeding
      const fieldsToValidate: any[] = accountType === 'buyer'
        ? ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']
        : ['firstName', 'lastName', 'farmName', 'experience', 'email', 'phone', 'password', 'confirmPassword'];
      
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
      setStep(3);
      setSubStep('selection');
      return;
    }
    
    if (step === 3) {
      if (accountType === 'buyer') {
        if (selectedCategories.length === 0) {
          message.warning('Please select at least one category.');
          return;
        }
        registerBuyerMutation.mutate(getValues());
        return;
      }
      if (subStep === 'selection' && selectedDoc !== null) { 
        setSubStep('uploading'); 
        return; 
      }
      if (subStep === 'uploading') {
        if (!uploadedFile) {
          message.warning('Please upload a document to proceed.');
          return;
        }
        setSubStep('verifying');
        
        // Assemble FormData payload for registration
        const values = getValues();
        const payload = new FormData();
        payload.append('firstName', values.firstName);
        payload.append('lastName', values.lastName);
        payload.append('fullname', `${values.firstName} ${values.lastName}`);
        payload.append('email', values.email);
        payload.append('phone', values.phone);
        payload.append('phoneNumber', values.phone);
        payload.append('phone_number', values.phone);
        payload.append('password', values.password);
        payload.append('confirmPassword', values.confirmPassword);
        payload.append('farmName', values.farmName || '');
        payload.append('experience', values.experience || '');
        payload.append('document', uploadedFile);
        payload.append('documentType', ['Government ID', 'Business Permit', 'Farm Certification'][selectedDoc || 0]);

        registerSellerMutation.mutate(payload);
        return;
      }
      if (subStep === 'success') { 
        setStep(4); 
        setSubStep('otp'); 
        return; 
      }
    }
    
    if (step === 4 && subStep === 'otp') {
      if (otpValue.length !== 6) {
        message.warning('Please enter the 6-digit verification code.');
        return;
      }
      verifyEmailMutation.mutate({ email: getValues('email'), code: otpValue });
    }
  };

  const prevStep = () => {
    if (step === 3 && subStep !== 'selection') { setSubStep('selection'); return; }
    setStep(s => Math.max(s - 1, 1));
  };

  const isPending = registerBuyerMutation.isPending || registerSellerMutation.isPending || verifyEmailMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
        <AuthHeader />

        <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 md:px-0">
          <Stepper
            currentStep={step}
            steps={accountType === 'buyer'
              ? ["Choose Account", "Fill Form", "Experience Categories", "Verification"]
              : ["Choose Account", "Fill Form", "Upload Document", "Verification"]}
            subStepProgress={getSubStepProgress()}
          />

          <div className="flex-1 py-8 md:py-12">
            {/* STEP 1: CHOOSE ACCOUNT */}
            {step === 1 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">How would you like to use AllohFarm?</h1>
                  <p className="text-slate-500 max-w-md mx-auto">Select your preferred type of account to get started.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <AccountCard
                    active={accountType === 'buyer'}
                    onClick={() => setAccountType('buyer')}
                    icon={<ShoppingBag size={28} />}
                    title="I’m a Buyer"
                    desc="I want to buy fresh, high-quality produce directly from local farms."
                  />
                  <AccountCard
                    active={accountType === 'seller'}
                    onClick={() => setAccountType('seller')}
                    icon={<Sprout size={28} />}
                    title="I’m a Seller"
                    desc="I want to sell my farm produce and reach a larger community of customers"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: FILL FORM */}
            {step === 2 && (
              <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft size={24} /></button>
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {accountType === 'buyer' ? "Start your Fresh Journey" : "Tell us about you and your farm"}
                    </h1>
                    <p className="text-sm text-slate-500">
                      {accountType === 'buyer'
                        ? "Tell us a bit about yourself so we can find the best local harvest for you."
                        : "Please provide your business details and secure your account."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="First Name"
                      error={errors.firstName?.message}
                      placeholder="Enter your first name"
                      {...register('firstName')}
                    />
                    <InputField
                      label="Last Name"
                      error={errors.lastName?.message}
                      placeholder="Enter your last name"
                      {...register('lastName')}
                    />
                  </div>
                  {accountType === 'seller' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Farm Name"
                        error={errors.farmName?.message}
                        placeholder="Green Valley Organic Farm"
                        {...register('farmName')}
                      />
                      <InputField
                        label="Experience"
                        error={errors.experience?.message}
                        placeholder="e.g. 5 years"
                        {...register('experience')}
                      />
                    </div>
                  )}
                  <InputField
                    label="Email Address"
                    type="email"
                    error={errors.email?.message}
                    placeholder="e.g. name@example.com"
                    {...register('email')}
                  />
                  <InputField
                    label="Phone Number"
                    error={errors.phone?.message}
                    placeholder="+234 **********"
                    {...register('phone')}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Create Password"
                      type={showPassword ? "text" : "password"}
                      error={errors.password?.message}
                      placeholder="*************"
                      {...register('password')}
                      rightElement={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      }
                    />
                    <InputField
                      label="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      error={errors.confirmPassword?.message}
                      placeholder="*************"
                      {...register('confirmPassword')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: UPLOAD / PERSONALIZE */}
            {step === 3 && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                {accountType === 'buyer' ? (
                  <div className="space-y-12 text-center">
                    <div className="flex items-center gap-4 text-left">
                      <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft size={24} /></button>
                      <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Let’s personalise your Experience</h1>
                        <p className="text-sm text-slate-500">Select the categories you care about most to curate your experience.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto pt-8">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => toggleCategory(cat)} className={cn("px-6 py-2.5 rounded-full border text-sm font-medium transition-all shadow-sm", selectedCategories.includes(cat) ? "border-primary bg-emerald-50 text-primary font-bold" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200")}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                      <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft size={24} /></button>
                      <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Upload Identification to build Trust</h1>
                      </div>
                    </div>
                    {subStep === 'selection' && (
                      <div className="space-y-4">
                        {["Government ID", "Business Permit", "Farm Certification"].map((doc, i) => (
                          <button key={i} onClick={() => setSelectedDoc(i)} className={cn("w-full card-premium flex items-center gap-6 group border-2", selectedDoc === i ? "border-primary shadow-md" : "border-transparent bg-white")}>
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary"><ShoppingBag size={20} /></div>
                            <div className="text-left flex-1"><h4 className="text-sm font-bold text-slate-900">{doc}</h4></div>
                            {selectedDoc === i && <CheckCircle2 className="text-primary" size={20} />}
                          </button>
                        ))}
                      </div>
                    )}
                    {subStep === 'uploading' && (
                      <label className="w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white cursor-pointer hover:border-primary/50 transition-colors">
                        <input type="file" className="hidden" accept=".jpg,.png,.pdf,.jpeg" onChange={handleFileChange} />
                        <UploadCloud size={32} className="text-slate-400" />
                        <p className="text-sm font-medium text-slate-600">
                          {uploadedFile ? `Selected: ${uploadedFile.name}` : 'Drag & drop files or browse'}
                        </p>
                        {uploadedFile && <p className="text-xs text-slate-400">Click to change file</p>}
                      </label>
                    )}
                    {subStep === 'verifying' && (
                      <div className="flex flex-col items-center py-10 space-y-4 text-center animate-in zoom-in-95">
                        <Loader2 className="animate-spin text-primary" size={64} />
                        <h2 className="text-2xl font-bold text-slate-900">Verifying and Uploading Document...</h2>
                      </div>
                    )}
                    {subStep === 'success' && (
                      <div className="flex flex-col items-center py-10 space-y-4 text-center animate-in zoom-in-95">
                        <CheckCircle2 size={64} className="text-primary" />
                        <h2 className="text-2xl font-bold text-slate-900">Document Uploaded Successfully!</h2>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: VERIFICATION */}
            {step === 4 && (
              <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-500">
                {subStep === 'otp' ? (
                  <div className="flex flex-col items-center space-y-10 text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center"><Mail size={32} className="text-emerald-700 opacity-30" /></div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">Verify your Email</h2>
                      <p className="text-sm text-slate-500">Enter the 6-digit code sent to your email.</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          pattern="\d*"
                          value={otpValue[index] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              const newOtp = otpValue.split('');
                              newOtp[index] = val;
                              const finalOtp = newOtp.join('').slice(0, 6);
                              setOtpValue(finalOtp);
                              // Auto-focus next input
                              if (val && index < 5) {
                                const nextInput = document.getElementById(`otp-${index + 1}`);
                                nextInput?.focus();
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              if (!otpValue[index] && index > 0) {
                                const prevInput = document.getElementById(`otp-${index - 1}`);
                                prevInput?.focus();
                                const newOtp = otpValue.split('');
                                newOtp[index - 1] = '';
                                setOtpValue(newOtp.join(''));
                              } else {
                                const newOtp = otpValue.split('');
                                newOtp[index] = '';
                                setOtpValue(newOtp.join(''));
                              }
                            }
                          }}
                          id={`otp-${index}`}
                          className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-emerald-500/10 focus:outline-none bg-white shadow-sm transition-all"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => resendOtpMutation.mutate(getValues('email'))}
                      disabled={resendOtpMutation.isPending}
                      className="text-xs font-bold text-primary underline disabled:text-slate-400"
                    >
                      {resendOtpMutation.isPending ? 'Resending...' : 'Resend Code'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-8 text-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center"><CheckCircle2 size={40} className="text-primary" /></div>
                    <h2 className="text-3xl font-bold text-slate-900">Registration Complete!</h2>
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 max-w-3xl mx-auto w-full flex flex-col items-center gap-4 px-4 md:px-0">
              {subStep === 'verified' ? (
                <Link href="/login" className="btn-primary w-full md:max-w-sm h-14 flex items-center justify-center">Go Login</Link>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={(step === 1 && !accountType) || (step === 3 && accountType === 'seller' && subStep === 'selection' && selectedDoc === null) || isPending}
                  className="btn-primary w-full md:max-w-sm h-14 shadow-lg shadow-primary/20 flex items-center justify-center"
                >
                  {isPending ? 'Please wait...' : 'Continue'}
                </button>
              )}
              <p className="text-sm text-slate-400">Already have an account? <Link href="/login" className="text-primary font-bold">Log in</Link></p>
            </div>
          </div>
        </main>

        <AuthFooter />
      </div>
  );
}
