import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, Mail, Key, Lock, Loader2, ArrowRight } from 'lucide-react';

const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().length(6, 'Reset code must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultEmail = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      code: '',
      newPassword: ''
    }
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: values.email,
        code: values.code,
        newPassword: values.newPassword
      });
      setSuccessMsg(res.data?.message || 'Password successfully updated.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to reset password. Verify the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark pt-24 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center space-x-2">
            <ShieldAlert className="h-8 w-8 text-brand-500" />
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-500">
              TruthLens AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight mt-4">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your reset code and set your new password
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-xl text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm"
              />
            </div>
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          {/* Reset Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">6-Digit Code</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                {...register('code')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-center text-lg font-bold letter-spacing-2"
              />
            </div>
            {errors.code && <span className="text-red-500 text-xs">{errors.code.message}</span>}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="Min. 6 characters"
                {...register('newPassword')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm"
              />
            </div>
            {errors.newPassword && <span className="text-red-500 text-xs">{errors.newPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 disabled:opacity-50 transition-all duration-200 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Change Password</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
