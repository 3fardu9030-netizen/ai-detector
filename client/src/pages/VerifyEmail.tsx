import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, Mail, Key, Loader2, ArrowRight } from 'lucide-react';

const verifySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits')
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export const VerifyEmail: React.FC = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const defaultEmail = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: defaultEmail,
      code: ''
    }
  });

  // Handle resend countdown cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (values: VerifyFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(values.email, values.code);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Invalid verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (email: string) => {
    if (!email) {
      setErrorMsg('Please input your email address first to request a code.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resendOtp(email);
      setSuccessMsg('A new verification code has been generated. Check your email (or server log console).');
      setResendCooldown(60); // 1-minute cooldown
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to resend code.');
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
          <h2 className="text-2xl font-bold tracking-tight mt-4">Verify Your Email</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please enter the 6-digit code sent to your registered email
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

          {/* OTP Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">6-Digit Code</label>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleSubmit((vals) => handleResend(vals.email))}
                className="text-xs text-brand-400 hover:underline disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP Code'}
              </button>
            </div>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 disabled:opacity-50 transition-all duration-200 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Verify Account</span>
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
