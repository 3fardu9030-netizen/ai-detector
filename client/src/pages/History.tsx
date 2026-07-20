import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Search, Filter, Trash2, Eye, Download, ChevronLeft, ChevronRight,
  ShieldCheck, AlertTriangle, X, Play, Image as ImageIcon, AlignLeft, Info
} from 'lucide-react';

export const History: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('ALL');
  const [result, setResult] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected item modal details state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `/history?page=${page}&limit=8&search=${search}&fileType=${fileType}&result=${result}`
      );
      setHistoryItems(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, fileType, result]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scan from history?')) return;
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      alert('Delete failed.');
    }
  };

  const handleExportCSV = () => {
    // Generate simple CSV payload string
    const headers = 'File Name,File Type,Verdict,Confidence,Processing Time (ms),Scan Date\n';
    const rows = historyItems.map(item => 
      `"${item.fileName}",${item.fileType},${item.result},${item.confidence}%,${item.processingTime},"${new Date(item.createdAt).toLocaleDateString()}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truthlens-scan-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Detection Logs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Search, sort, filter, and inspect your full content scans catalog.
          </p>
        </div>
        
        {historyItems.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center space-x-2 border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/15 text-brand-400 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        )}
      </div>

      {/* Query Filters row */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-lg border glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Media Type</span>
            <select
              value={fileType}
              onChange={(e) => { setFileType(e.target.value); setPage(1); }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Types</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="TEXT">Text</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Verdict</span>
            <select
              value={result}
              onChange={(e) => { setResult(e.target.value); setPage(1); }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Verdicts</option>
              <option value="AI">AI Flagged</option>
              <option value="HUMAN">Human Verified</option>
            </select>
          </div>
          
          <button type="submit" className="hidden" />
        </div>
      </form>

      {/* Main Table Grid */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-12 glass-panel rounded-xl" />
          <div className="h-12 glass-panel rounded-xl" />
          <div className="h-12 glass-panel rounded-xl" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-500 text-xs">
          No logs found matching selected constraints. Let's run a new scan.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl overflow-hidden border-b border-opacity-40">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800/40">
                <thead className="bg-slate-900/40">
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Source Name</th>
                    <th className="px-6 py-4">Media Type</th>
                    <th className="px-6 py-4">Verdict</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Scan Speed</th>
                    <th className="px-6 py-4">Scan Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/20 text-xs">
                  {historyItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-semibold truncate max-w-xs">{item.fileName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 uppercase tracking-widest text-[9px] font-bold text-brand-400">
                          {item.fileType === 'IMAGE' ? <ImageIcon className="h-3 w-3 shrink-0" /> : item.fileType === 'VIDEO' ? <Play className="h-3 w-3 shrink-0" /> : <AlignLeft className="h-3 w-3 shrink-0" />}
                          <span>{item.fileType}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          item.result === 'AI' 
                            ? 'bg-red-500/10 border border-red-500/20 text-red-500' 
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                        }`}>
                          {item.result === 'AI' ? <AlertTriangle className="h-2.5 w-2.5" /> : <ShieldCheck className="h-2.5 w-2.5" />}
                          <span>{item.result}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{item.confidence}%</td>
                      <td className="px-6 py-4 text-slate-400 font-mono">{item.processingTime} ms</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-brand-400 hover:text-brand-500 inline-flex items-center"
                          title="Inspect Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-600 inline-flex items-center"
                          title="Delete Scan Log"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs px-2">
              <span className="text-slate-500">
                Showing page <strong className="text-slate-300">{page}</strong> of <strong className="text-slate-300">{totalPages}</strong> ({totalItems} total logs)
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 border border-slate-800 rounded-lg bg-slate-900/40 hover:bg-slate-900 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 border border-slate-800 rounded-lg bg-slate-900/40 hover:bg-slate-900 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Inspector Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-panel p-6 rounded-2xl space-y-6 relative max-h-[85vh] overflow-y-auto animate-fade-in">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-widest block">{selectedItem.fileType} Scan Log</span>
              <h2 className="text-lg font-bold truncate max-w-md mt-1">{selectedItem.fileName}</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center py-2">
              <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl">
                <span className="block text-[10px] text-slate-400 uppercase">Verdict</span>
                <span className={`text-base font-extrabold ${selectedItem.result === 'AI' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {selectedItem.result}
                </span>
              </div>
              <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl">
                <span className="block text-[10px] text-slate-400 uppercase">Confidence</span>
                <span className="text-base font-extrabold text-white">{selectedItem.confidence}%</span>
              </div>
              <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl">
                <span className="block text-[10px] text-slate-400 uppercase">Speed</span>
                <span className="text-base font-extrabold text-slate-300 font-mono">{selectedItem.processingTime}ms</span>
              </div>
            </div>

            {/* Sub-result details display */}
            <div className="space-y-4">
              <span className="inline-flex items-center space-x-1 text-xs text-brand-400 font-bold">
                <Info className="h-4 w-4" />
                <span>Detection Explanation</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed p-4 bg-slate-900/30 border border-slate-850 rounded-xl">
                {selectedItem.details?.explanation || 'No detailed technical explanation stored.'}
              </p>
              
              {/* Media Preview if available locally */}
              {selectedItem.fileUrl && selectedItem.fileType === 'IMAGE' && (
                <div className="text-center pt-2">
                  <span className="text-[9px] text-slate-500 block mb-2">Saved Image Signature</span>
                  <img
                    src={`http://localhost:5000${selectedItem.fileUrl}`}
                    alt="Scan preview"
                    className="max-h-48 mx-auto rounded-lg border border-slate-800"
                    onError={(e) => {
                      // Fallback if port changed or server static root was reset
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
