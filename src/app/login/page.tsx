"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { InputField } from '@/components/shared/InputField';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';
import { message } from 'antd';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setCredentials, setRole: setStoreRole } = useAuthStore();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginInput & { role: 'buyer' | 'seller' }) => authApi.login(data),
    onSuccess: (data) => {
      setCredentials(data);
      setStoreRole(role);
      message.success('Welcome back to Alloh!');
      router.push('/demands');
    },
    onError: (error: any) => {
      message.error(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate({ ...data, role });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <AuthHeader loginLink={false} />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-soft border border-slate-100 p-8 md:p-12 space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 font-display">Welcome Back</h1>
            <p className="text-sm text-slate-500">Login to access your account</p>
          </div>

          {/* Role Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-xs font-bold transition-colors", role === 'buyer' ? "text-primary" : "text-slate-300 uppercase tracking-widest")}>Buyer</span>
            <button
              type="button"
              onClick={() => setRole(role === 'buyer' ? 'seller' : 'buyer')}
              className="w-12 h-6 bg-slate-100 rounded-full relative p-1 transition-colors group"
            >
              <div className={cn(
                "w-4 h-4 bg-primary rounded-full transition-all duration-300 shadow-sm",
                role === 'seller' ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
            <span className={cn("text-xs font-bold transition-colors", role === 'seller' ? "text-primary" : "text-slate-300 uppercase tracking-widest")}>Seller</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="***********"
              error={errors.password?.message}
              {...register('password')}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm font-medium text-slate-600">Remember me</label>
              </div>
              <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full h-14 text-base shadow-lg shadow-primary/20 flex items-center justify-center"
            >
              {mutation.isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <span className="bg-white px-4">OR</span>
            </div>
          </div>

          <button className="w-full h-14 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-sm text-slate-700">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-500 font-medium pt-4">
            Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
