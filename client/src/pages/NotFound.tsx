import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center px-4 text-center text-slate-800 dark:text-slate-200">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-brand-500 animate-bounce" />
          <h1 className="text-4xl font-extrabold tracking-tight">404 Error</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The page you are looking for has been moved or does not exist on this server.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Safety</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
