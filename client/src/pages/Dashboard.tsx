import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, Scan, Image, Play, AlignLeft, AlertCircle, Clock,
  ArrowRight, ShieldCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

interface DashboardStats {
  total: number;
  image: { total: number; ai: number; human: number };
  video: { total: number; ai: number; human: number };
  text: { total: number; ai: number; human: number };
  accuracyAvg: number;
  confidenceAvg: number;
}

interface ActivityItem {
  id: string;
  fileName: string;
  fileType: string;
  result: 'AI' | 'HUMAN';
  confidence: number;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyUsage, setWeeklyUsage] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const statsRes = await api.get('/history/dashboard');
      setStats(statsRes.data.stats);
      setWeeklyUsage(statsRes.data.weeklyUsage);

      const historyRes = await api.get('/history?page=1&limit=4');
      setRecentActivity(historyRes.data.items);
    } catch (error: any) {
      setErrorMsg('Failed to load dashboard data. Check database connections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cardItems = stats
    ? [
        { label: 'Image Scan Results', total: stats.image.total, ai: stats.image.ai, human: stats.image.human, type: 'IMAGE', icon: Image, color: 'text-purple-500 bg-purple-500/10' },
        { label: 'Video Scan Results', total: stats.video.total, ai: stats.video.ai, human: stats.video.human, type: 'VIDEO', icon: Play, color: 'text-indigo-500 bg-indigo-500/10' },
        { label: 'Text Scan Results', total: stats.text.total, ai: stats.text.ai, human: stats.text.human, type: 'TEXT', icon: AlignLeft, color: 'text-pink-500 bg-pink-500/10' }
      ]
    : [];

  return (
    <div className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-500">{user?.name}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review automated scanning history and verify new media payloads.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 md:mt-0 flex items-center space-x-2 border border-slate-200 dark:border-slate-800 bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Console</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 glass-panel rounded-2xl" />
          <div className="h-48 glass-panel rounded-2xl" />
          <div className="h-48 glass-panel rounded-2xl" />
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl text-center">
          {errorMsg}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top Level Numeric KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Scans Run</span>
              <p className="text-3xl font-extrabold">{stats?.total}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Content Flagged</span>
              <p className="text-3xl font-extrabold text-brand-400">
                {stats ? stats.image.ai + stats.video.ai + stats.text.ai : 0}
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Human Content Confirmed</span>
              <p className="text-3xl font-extrabold text-emerald-400">
                {stats ? stats.image.human + stats.video.human + stats.text.human : 0}
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Confidence</span>
              <p className="text-3xl font-extrabold">{stats?.confidenceAvg}%</p>
            </div>
          </div>

          {/* Core Categories detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="glass-panel p-6 rounded-2xl space-y-4 hover:border-brand-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-2 rounded-xl bg-slate-900/20 border border-slate-800/40">
                      <span className="block text-xs text-slate-400">Scans</span>
                      <span className="text-lg font-bold">{item.total}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-950/10 border border-purple-500/10">
                      <span className="block text-xs text-purple-400">AI</span>
                      <span className="text-lg font-bold text-brand-400">{item.ai}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-950/10 border border-emerald-500/10">
                      <span className="block text-xs text-emerald-400">Human</span>
                      <span className="text-lg font-bold text-emerald-400">{item.human}</span>
                    </div>
                  </div>
                  <Link
                    to={`/scan/${item.type.toLowerCase()}`}
                    className="w-full flex items-center justify-center space-x-2 py-2 border border-brand-500/20 hover:border-brand-500/60 bg-brand-500/5 hover:bg-brand-500/15 rounded-xl text-xs font-semibold text-brand-400 transition-all"
                  >
                    <span>Analyze new {item.type.toLowerCase()}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Interactive Recharts Graph Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Weekly Scan Volume</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500">Scan throughput recorded daily over the last week.</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="scans" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent activity sidebar feed */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Recent Activity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Your latest uploaded file statuses.</p>
                </div>

                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center text-xs text-slate-500 py-8">
                      No scan history yet.
                    </div>
                  ) : (
                    recentActivity.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/10 border border-slate-800/40 hover:bg-slate-900/30 transition-all">
                        <div className="flex items-center space-x-3 min-w-0">
                          {item.result === 'AI' ? (
                            <AlertCircle className="h-5 w-5 text-brand-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold truncate">{item.fileName}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{item.fileType}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`block text-xs font-bold ${item.result === 'AI' ? 'text-brand-400' : 'text-emerald-400'}`}>
                            {item.result}
                          </span>
                          <span className="text-[9px] text-slate-400">{item.confidence}% confidence</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {recentActivity.length > 0 && (
                <Link
                  to="/history"
                  className="w-full text-center block text-xs font-semibold text-brand-400 hover:text-brand-500 pt-4"
                >
                  View Full History Logs
                </Link>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
