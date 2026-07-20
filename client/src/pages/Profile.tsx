import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address')
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  
  const [profileMsg, setProfileMsg] = useState<{ status: 'ok' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ status: 'ok' | 'error'; text: string } | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: errorsProfile } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const { register: regPassword, handleSubmit: handlePassword, reset: resetPasswordForm, formState: { errors: errorsPassword } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema)
  });

  const onUpdateProfile = async (values: ProfileValues) => {
    setProfileMsg(null);
    setIsSubmittingProfile(true);
    try {
      const res = await api.put('/auth/profile', values);
      updateUser(values.name, values.email);
      setProfileMsg({ status: 'ok', text: res.data.message || 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ status: 'error', text: err.response?.data?.error || 'Profile update failed.' });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onChangePassword = async (values: PasswordValues) => {
    setPasswordMsg(null);
    setIsSubmittingPassword(true);
    try {
      const res = await api.put('/auth/change-password', values);
      setPasswordMsg({ status: 'ok', text: res.data.message || 'Password changed successfully.' });
      resetPasswordForm();
    } catch (err: any) {
      setPasswordMsg({ status: 'error', text: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!window.confirm('WARNING: Deleting your account will permanently wipe all scan histories, settings, and profile details. This action CANNOT be undone. Are you absolutely sure?')) {
      return;
    }
    
    try {
      const res = await api.delete('/auth/delete-account');
      alert(res.data.message || 'Account successfully deleted.');
      logout();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete account.');
    }
  };

  return (
    <div className="pt-20 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200 space-y-8">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage profile credentials and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <User className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Profile Details</h3>
          </div>

          {profileMsg && (
            <div className={`p-3 text-xs rounded-xl text-center border ${
              profileMsg.status === 'ok' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfile(onUpdateProfile)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Name</label>
              <input
                type="text"
                {...regProfile('name')}
                className="w-full px-4 py-2 rounded-xl border glass-input text-xs"
              />
              {errorsProfile.name && <span className="text-red-500 text-[10px]">{errorsProfile.name.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Email Address</label>
              <input
                type="email"
                {...regProfile('email')}
                className="w-full px-4 py-2 rounded-xl border glass-input text-xs"
              />
              {errorsProfile.email && <span className="text-red-500 text-[10px]">{errorsProfile.email.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="flex items-center justify-center space-x-2 bg-brand-500 text-white font-semibold py-2 px-6 rounded-lg text-xs hover:bg-brand-600 disabled:opacity-50"
            >
              {isSubmittingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Info</span>}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Change Password</h3>
          </div>

          {passwordMsg && (
            <div className={`p-3 text-xs rounded-xl text-center border ${
              passwordMsg.status === 'ok' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...regPassword('currentPassword')}
                className="w-full px-4 py-2 rounded-xl border glass-input text-xs"
              />
              {errorsPassword.currentPassword && <span className="text-red-500 text-[10px]">{errorsPassword.currentPassword.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...regPassword('newPassword')}
                className="w-full px-4 py-2 rounded-xl border glass-input text-xs"
              />
              {errorsPassword.newPassword && <span className="text-red-500 text-[10px]">{errorsPassword.newPassword.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="flex items-center justify-center space-x-2 bg-brand-500 text-white font-semibold py-2 px-6 rounded-lg text-xs hover:bg-brand-600 disabled:opacity-50"
            >
              {isSubmittingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Password</span>}
            </button>
          </form>
        </div>

      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/10 bg-red-950/5 space-y-4">
        <div>
          <h3 className="font-extrabold text-red-500 text-sm uppercase tracking-wider">Danger Zone</h3>
          <p className="text-slate-500 text-xs mt-0.5">Sensitive profile actions. Use caution.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
          <div className="space-y-1">
            <span className="block text-xs font-bold text-slate-200">Delete Account Permanently</span>
            <span className="block text-[10px] text-slate-500">All data registers and historical scans will be wiped from active nodes.</span>
          </div>
          <button
            onClick={onDeleteAccount}
            className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

    </div>
  );
};
