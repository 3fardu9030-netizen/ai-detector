import React from 'react';
import { ShieldAlert, Github, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-opacity-50 dark:border-opacity-50 bg-opacity-40 dark:bg-opacity-40 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-6 w-6 text-brand-500" />
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">TruthLens AI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Securing content authenticity in the age of generative media. Instantly verify if files or copy are human-authored or synthesized by deep learning networks.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/#features" className="hover:text-brand-500 transition-colors">Features</a></li>
              <li><a href="/#pricing" className="hover:text-brand-500 transition-colors">Pricing Options</a></li>
              <li><a href="/#faq" className="hover:text-brand-500 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Get in Touch</h4>
            <div className="flex space-x-4 text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-brand-500 transition-colors" aria-label="GitHub"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              <a href="mailto:support@truthlens.ai" className="hover:text-brand-500 transition-colors" aria-label="Email Support"><Mail className="h-5 w-5" /></a>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
              Email: support@truthlens.ai
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/60 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} TruthLens AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
