import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const Register: React.FC = () => {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema)
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signUp(values.name, values.email, values.password);
      // Redirect to verification, forwarding user email state
      navigate('/verify-email', { state: { email: values.email } });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Try again.');
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
          <h2 className="text-2xl font-bold tracking-tight mt-4">Create Your Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join the platform and scan content automatically
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Alex Johnson"
                {...register('name')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm"
              />
            </div>
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="alex@example.com"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm"
              />
            </div>
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="Min. 6 characters"
                {...register('password')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm"
              />
            </div>
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
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
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
