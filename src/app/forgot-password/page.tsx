'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';
import { ArrowLeft, KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth.api';
import { message } from '@/components/ui/message';

const requestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const resetSchema = z.object({
  otp: z.string().min(6, 'Reset code must be 6 digits').max(6, 'Reset code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RequestInput = z.infer<typeof requestSchema>;
type ResetInput = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [emailAddress, setEmailAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form for requesting reset OTP
  const requestForm = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
  });

  // Form for resetting password
  const resetForm = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  // Mutation: Request Reset Code (Forgot Password)
  const requestMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (_, email) => {
      setEmailAddress(email);
      message.success('Verification code sent to your email.');
      setStep('reset');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to send reset code.');
    },
  });

  // Mutation: Reset Password
  const resetMutation = useMutation({
    mutationFn: (data: any) => authApi.resetPassword(data),
    onSuccess: () => {
      message.success('Password reset successfully!');
      setStep('success');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to reset password. Please check the code.');
    },
  });

  const onRequestSubmit = (data: RequestInput) => {
    requestMutation.mutate(data.email);
  };

  const onResetSubmit = (data: ResetInput) => {
    resetMutation.mutate({
      email: emailAddress,
      otp: data.otp,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <AuthHeader loginLink={true} />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-soft border border-slate-100 p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {step === 'request' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider mb-2"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Forgot Password?</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Enter your email address below and we&apos;ll send you a 6-digit code to reset your password.
                </p>
              </div>

              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6">
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={requestForm.formState.errors.email?.message}
                  {...requestForm.register('email')}
                  leftElement={<Mail size={18} className="text-slate-400" />}
                />

                <button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="btn-primary w-full h-14 text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {requestMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Sending Code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <button
                  onClick={() => setStep('request')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider mb-2 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Use a different email
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Reset Password</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  We sent a 6-digit verification code to <span className="font-semibold text-slate-900">{emailAddress}</span>. Enter it along with your new password.
                </p>
              </div>

              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                <InputField
                  label="Reset Code (OTP)"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  error={resetForm.formState.errors.otp?.message}
                  {...resetForm.register('otp')}
                  leftElement={<KeyRound size={18} className="text-slate-400" />}
                />

                <InputField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  error={resetForm.formState.errors.newPassword?.message}
                  {...resetForm.register('newPassword')}
                  leftElement={<Lock size={18} className="text-slate-400" />}
                  rightElement={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />

                <InputField
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register('confirmPassword')}
                  leftElement={<Lock size={18} className="text-slate-400" />}
                />

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="btn-primary w-full h-14 text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 font-display">Password Reset!</h1>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Your password has been successfully reset. You can now log in using your new credentials.
                </p>
              </div>
              <Link 
                href="/login" 
                className="btn-primary w-full h-14 flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20"
              >
                Go to Login
              </Link>
            </div>
          )}

        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
