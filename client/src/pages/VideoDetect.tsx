import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import {
  Upload, Play, Loader2, RefreshCw, AlertTriangle, ShieldCheck,
  Cpu, Activity, Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const VideoDetect: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('AUTO');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 20MB limit.');
      return;
    }
    
    setSelectedFile(file);
    const videoUrl = URL.createObjectURL(file);
    setPreviewUrl(videoUrl);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['mp4', 'mov', 'avi'].includes(ext || '')) {
        handleFileChange(file);
      } else {
        setErrorMsg('Invalid file extension. Standard videos only.');
      }
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleScanSubmit = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setIsScanning(true);
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('provider', provider);

    try {
      const res = await api.post('/detect/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScanResult(res.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Video scanning failed. Try checking local codecs.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="pt-20 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Deepfake Video Detection</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload video files to verify frame-level mouth syncs, face boundary consistency, and compression noise.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl text-center mb-6 max-w-xl mx-auto">
          {errorMsg}
        </div>
      )}

      {!scanResult ? (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* AI Settings Box */}
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Engine</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="bg-slate-900 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="AUTO">Auto Resolver</option>
              <option value="MOCK">Mock Spatiotemporal Engine</option>
              <option value="GEMINI">Google Gemini Pro Vision</option>
            </select>
          </div>

          {/* Drag & Drop File Loader */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel border-dashed border-2 rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800/60 hover:border-brand-500/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="video/mp4, video/mov, video/avi"
              className="hidden"
            />

            {!previewUrl ? (
              <div className="space-y-4">
                <div className="mx-auto p-4 rounded-full bg-slate-900/40 w-fit text-brand-500 border border-slate-800/85">
                  <Play className="h-8 w-8 text-brand-500" />
                </div>
                <div>
                  <button onClick={triggerInputClick} className="text-brand-500 font-bold hover:underline">
                    Browse videos
                  </button>{' '}
                  or drop your video file here
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500">
                  Supports MP4, MOV, or AVI up to 20MB
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <video
                  src={previewUrl}
                  controls
                  className="max-h-64 mx-auto rounded-xl shadow-md border border-slate-800/80"
                />
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                  <Play className="h-4 w-4 text-brand-400" />
                  <span className="font-semibold">{selectedFile?.name}</span>
                  <span>({formatSize(selectedFile?.size || 0)})</span>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2 border border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-900"
                  >
                    Clear Video
                  </button>
                  <button
                    onClick={handleScanSubmit}
                    disabled={isScanning}
                    className="flex items-center space-x-2 bg-brand-500 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:bg-brand-600 disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Rendering frames...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="h-4 w-4" />
                        <span>Run Deepfake Check</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results Report Grid */
        <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verdict KPI Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-center text-center space-y-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Platform Verdict</h3>
              
              <div className="space-y-3">
                {scanResult.result === 'AI' ? (
                  <div className="mx-auto p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full w-fit">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                  </div>
                ) : (
                  <div className="mx-auto p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full w-fit">
                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                  </div>
                )}
                <h2 className="text-2xl font-black tracking-wide">
                  {scanResult.result === 'AI' ? 'DEEPFAKE DETECTED' : 'ORGANIC AUTHENTIC'}
                </h2>
                <p className="text-xs text-slate-500">Video Inconsistency Score</p>
              </div>

              {/* Progress Confidence */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Confidence rating</span>
                  <span>{scanResult.confidence}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${scanResult.result === 'AI' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${scanResult.confidence}%` }}
                  />
                </div>
              </div>

              <button
                onClick={resetScanner}
                className="w-full py-2.5 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Verify Another Clip</span>
              </button>
            </div>

            {/* Analysis Grid Metrics */}
            <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Deepfake Indicators</h3>
                <p className="text-xs text-slate-500 mt-1">Spatiotemporal factors evaluated across video frame grids.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Face Alignment</span>
                  <span className="text-xl font-bold">{Math.round((scanResult.details?.faceConsistency || 0.8) * 100)}%</span>
                  <span className="block text-[9px] text-slate-500">Vector node stability</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Lip Sound Sync</span>
                  <span className="text-xl font-bold">{Math.round((scanResult.details?.lipSyncScore || 0.8) * 100)}%</span>
                  <span className="block text-[9px] text-slate-500">Audio coordinate correlation</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Temporal Noise</span>
                  <span className="text-xl font-bold">{Math.round((scanResult.details?.temporalInconsistency || 0.2) * 100)}%</span>
                  <span className="block text-[9px] text-slate-500">Frame-to-frame pixel drift</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl space-y-1.5">
                <span className="inline-flex items-center space-x-1 text-xs text-brand-400 font-bold">
                  <Info className="h-4.5 w-4.5" />
                  <span>Technical Assessment</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {scanResult.details?.explanation}
                </p>
              </div>

              {scanResult.details?.suspiciousFrames?.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-400">Flagged Anomalous Frames</span>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.details.suspiciousFrames.map((frame: number) => (
                      <span key={frame} className="px-2 py-1 bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] rounded-lg font-mono">
                        Frame #{frame}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Timeline Graph Card */}
          {scanResult.details?.timelineAnalysis?.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Activity className="h-4 w-4 text-brand-400" />
                  <span>Frame Analysis Timeline</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Real-time deepfake probability graphed across timestamps.</p>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scanResult.details.timelineAnalysis} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.3)" fontSize={10} unit="s" />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="aiScore" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
