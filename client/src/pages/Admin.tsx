import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Server, Users, ShieldAlert, Cpu, Database, Eye, Trash2, Key,
  FileText, Activity, AlertCircle, RefreshCw, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'keys' | 'feedback' | 'audit'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // API configuration inputs
  const [geminiKey, setGeminiKey] = useState('');
  const [hfKey, setHfKey] = useState('');
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      if (activeTab === 'users') {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
      } else if (activeTab === 'feedback') {
        const feedbackRes = await api.get('/admin/feedback');
        setFeedbacks(feedbackRes.data);
      } else if (activeTab === 'audit') {
        const auditRes = await api.get('/admin/audit');
        setAuditLogs(auditRes.data);
      }
    } catch (error: any) {
      setErrorMsg('Failed to load admin controls. Verification rights required.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleUpdateKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    try {
      const res = await api.put('/admin/settings', {
        geminiApiKey: geminiKey,
        hfApiKey: hfKey
      });
      setSettingsMsg(res.data.message || 'API Keys updated in memory.');
      setGeminiKey('');
      setHfKey('');
    } catch (error: any) {
      setSettingsMsg(error.response?.data?.error || 'Failed to update settings.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user permanently? This cascade deletes their scan logs.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      // Refresh list
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete user.');
    }
  };

  const chartData = stats?.apiStats ? [
    { name: 'Google Gemini', calls: stats.apiStats.gemini, color: '#8b5cf6' },
    { name: 'Hugging Face', calls: stats.apiStats.huggingFace, color: '#ec4899' },
    { name: 'Mock Engine', calls: stats.apiStats.mock, color: '#6366f1' }
  ] : [];

  const tabItems = [
    { id: 'stats', label: 'Server Metrics', icon: Server },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'feedback', label: 'Feedback Feed', icon: MessageSquare },
    { id: 'audit', label: 'Security Logs', icon: FileText }
  ] as const;

  return (
    <div className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-500 mt-1">Review system logs, active integrations, and platform statistics.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center justify-center space-x-2 border border-slate-800 bg-white/5 hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Diagnostics</span>
        </button>
      </div>

      {/* Tabs navigation list */}
      <div className="flex overflow-x-auto space-x-2 p-1.5 bg-slate-900/35 border border-slate-800/60 rounded-xl mb-8">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {errorMsg ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl text-center">
          {errorMsg}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* STATS TAB */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</span>
                  <p className="text-3xl font-extrabold">{stats.totalUsers}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Scanners</span>
                  <p className="text-3xl font-extrabold text-brand-400">{stats.activeUsers}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Accumulated Scans</span>
                  <p className="text-3xl font-extrabold">{stats.totalScans}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reviews Received</span>
                  <p className="text-3xl font-extrabold">{stats.totalFeedback}</p>
                </div>
              </div>

              {/* Hardware diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl space-y-6 lg:col-span-1">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Server Health</h3>
                    <p className="text-xs text-slate-500">Local OS resource benchmarks.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Cpu className="h-4 w-4" />
                        <span>Node Thread Load</span>
                      </span>
                      <span className="font-semibold text-brand-400">{stats.serverStatus.cpuUsage}%</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Database className="h-4 w-4" />
                        <span>Memory Load</span>
                      </span>
                      <span className="font-semibold">{stats.serverStatus.memoryUsage}%</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                      <span className="text-slate-400">System Uptime</span>
                      <span className="font-semibold text-slate-300">{Math.round(stats.serverStatus.uptime / 3600)} hrs</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Node Engine</span>
                      <span className="font-semibold text-slate-400 font-mono">{stats.serverStatus.nodeVersion}</span>
                    </div>
                  </div>
                </div>

                {/* API Usage chart */}
                <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">API Call Distribution</h3>
                    <p className="text-xs text-slate-500">Volume routed through AI providers (average latency: {stats.apiStats.averageResponseTime}ms).</p>
                  </div>
                  
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="calls">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800/40 text-xs">
                  <thead className="bg-slate-900/40">
                    <tr className="text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Email OTP Status</th>
                      <th className="px-6 py-4">Scans Executed</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 font-bold">{u.name}</td>
                        <td className="px-6 py-4 text-slate-350">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                            u.role === 'ADMIN' ? 'bg-purple-500/15 text-brand-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {u.isVerified ? 'Verified' : 'Pending OTP Verification'}
                        </td>
                        <td className="px-6 py-4 font-bold text-center">{u._count.histories}</td>
                        <td className="px-6 py-4 text-slate-450">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-600 inline-flex items-center"
                            title="Delete User"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* API KEY SETTINGS TAB */}
          {activeTab === 'keys' && (
            <div className="glass-panel p-6 rounded-2xl max-w-xl mx-auto space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-brand-500 border border-brand-500/20">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">API Key Credentials</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Directly configure providers without backend restart.</p>
                </div>
              </div>

              {settingsMsg && (
                <div className="p-3 bg-brand-500/10 border border-brand-500/35 text-brand-400 text-xs rounded-xl text-center font-semibold">
                  {settingsMsg}
                </div>
              )}

              <form onSubmit={handleUpdateKeys} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Google Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="Enter key to enable Gemini vision & language parsing..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Hugging Face API Key</label>
                  <input
                    type="password"
                    placeholder="Enter key to route through ViT classifiers & RoBERTa..."
                    value={hfKey}
                    onChange={(e) => setHfKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-brand-500/20"
                >
                  Save Credentials
                </button>
              </form>
            </div>
          )}

          {/* USER FEEDBACKS TAB */}
          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {feedbacks.length === 0 ? (
                <div className="col-span-2 glass-panel p-12 text-center text-slate-500 text-xs rounded-2xl">
                  No feedback submissions recorded in database.
                </div>
              ) : (
                feedbacks.map((f) => (
                  <div key={f.id} className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/70">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          f.category === 'BUG' ? 'bg-red-500/10 text-red-500' : f.category === 'FEATURE' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {f.category}
                        </span>
                        <h4 className="font-bold text-sm mt-1">{f.subject}</h4>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-brand-400">Rating: {f.rating}/5</span>
                        <span className="block text-[9px] text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                      {f.message}
                    </p>
                    <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-800/60 pt-2">
                      User: {f.user.name} ({f.user.email})
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800/40 text-[11px]">
                  <thead className="bg-slate-900/40">
                    <tr className="text-left font-bold text-slate-400 uppercase tracking-wider text-[9px]">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Security Operation / Action</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">User Agent Signature</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-3 font-semibold text-white">
                          {log.user ? `${log.user.name} (${log.user.email})` : 'SYSTEM / GUEST'}
                        </td>
                        <td className="px-6 py-3 text-brand-400 font-bold">{log.action}</td>
                        <td className="px-6 py-3 text-slate-450">{log.ipAddress}</td>
                        <td className="px-6 py-3 text-slate-500 truncate max-w-xs" title={log.userAgent}>
                          {log.userAgent}
                        </td>
                        <td className="px-6 py-3 text-slate-450">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
