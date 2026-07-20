import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import {
  Upload, Image as ImageIcon, Loader2, RefreshCw, AlertTriangle, ShieldCheck,
  Cpu, FileText, Info
} from 'lucide-react';

export const ImageDetect: React.FC = () => {
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
        handleFileChange(file);
      } else {
        setErrorMsg('Invalid file extension. Standard images only.');
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
      const res = await api.post('/detect/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScanResult(res.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Image scanning failed. Check engine settings.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
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
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Automated Image Detection</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload images to scan pixel distributions for synthetic diffusion noise or GAN artifacts.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl text-center mb-6 max-w-xl mx-auto">
          {errorMsg}
        </div>
      )}

      {!scanResult ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Engine Selector */}
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Scanning Model</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="bg-slate-900 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="AUTO">Auto Detect Engine</option>
              <option value="MOCK">Mock Heuristic Engine</option>
              <option value="GEMINI">Google Gemini Vision</option>
              <option value="HUGGING_FACE">Hugging Face ViT Classifier</option>
            </select>
          </div>

          {/* Drag and Drop Container */}
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
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            {!previewUrl ? (
              <div className="space-y-4">
                <div className="mx-auto p-4 rounded-full bg-slate-900/40 w-fit text-brand-500 border border-slate-800/85">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <button
                    onClick={triggerInputClick}
                    className="text-brand-500 font-bold hover:underline"
                  >
                    Click to browse
                  </button>{' '}
                  or drag and drop your image here
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500">
                  Supports PNG, JPG, JPEG, or WEBP up to 20MB
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-64 mx-auto rounded-xl shadow-md border border-slate-800/80"
                />
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                  <ImageIcon className="h-4 w-4 text-brand-400" />
                  <span className="font-semibold">{selectedFile?.name}</span>
                  <span>({formatSize(selectedFile?.size || 0)})</span>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2 border border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-900"
                  >
                    Clear File
                  </button>
                  <button
                    onClick={handleScanSubmit}
                    disabled={isScanning}
                    className="flex items-center space-x-2 bg-brand-500 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:bg-brand-600 disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Scanning Matrix...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="h-4 w-4" />
                        <span>Run Detection Scan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Scan Result Display Cards */
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          
          {/* Main Verdict Card */}
          <div className="glass-panel p-6 rounded-2xl md:col-span-1 flex flex-col justify-between items-center text-center space-y-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Platform Verdict</h3>
            
            <div className="space-y-3">
              {scanResult.result === 'AI' ? (
                <div className="mx-auto p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full w-fit">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
              ) : (
                <div className="mx-auto p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full w-fit">
                  <ShieldCheck className="h-10 w-10 text-emerald-500 animate-pulse" />
                </div>
              )}
              <h2 className="text-2xl font-black tracking-wide">
                {scanResult.result === 'AI' ? 'AI GENERATED' : 'HUMAN AUTHENTIC'}
              </h2>
              <p className="text-xs text-slate-500">Confidence Match Score</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className={scanResult.result === 'AI' ? 'stroke-brand-500' : 'stroke-emerald-500'}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * scanResult.confidence) / 100}
                />
              </svg>
              <span className="absolute font-bold text-lg">{scanResult.confidence}%</span>
            </div>

            <button
              onClick={resetScanner}
              className="w-full py-2 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Scan Another Image</span>
            </button>
          </div>

          {/* Details / Metric Breakdown Column */}
          <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Analysis Breakdown</h3>
              <p className="text-xs text-slate-500 mt-1">Mathematical indicators scanned by the auto-detector.</p>
            </div>

            {/* Micro details bar scores */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Noise Uniformity Score</span>
                  <span className="font-semibold">{Math.round((scanResult.details?.noiseScore || 0.4) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-2.5 rounded-full"
                    style={{ width: `${(scanResult.details?.noiseScore || 0.4) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Compression Artifact Factor</span>
                  <span className="font-semibold">{Math.round((scanResult.details?.compressionFactor || 0.5) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-2.5 rounded-full"
                    style={{ width: `${(scanResult.details?.compressionFactor || 0.5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">GAN/Diffusion Artifact Score</span>
                  <span className="font-semibold">{Math.round((scanResult.details?.ganArtifactScore || 0.3) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-2.5 rounded-full"
                    style={{ width: `${(scanResult.details?.ganArtifactScore || 0.3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl space-y-2">
              <span className="inline-flex items-center space-x-1 text-xs text-brand-400 font-bold">
                <Info className="h-4.5 w-4.5" />
                <span>Detection Explanation</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {scanResult.details?.explanation}
              </p>
            </div>

            {/* File info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs border-t border-slate-800/50">
              <div>
                <span className="block text-slate-500">File Name</span>
                <span className="font-semibold truncate block">{scanResult.fileName}</span>
              </div>
              <div>
                <span className="block text-slate-500">File Extension</span>
                <span className="font-semibold block">{scanResult.fileType}</span>
              </div>
              <div>
                <span className="block text-slate-500">Processing Time</span>
                <span className="font-semibold block">{scanResult.processingTime} ms</span>
              </div>
              <div>
                <span className="block text-slate-500">EXIF Signatures</span>
                <span className="font-semibold block text-brand-400">
                  {scanResult.details?.metadata ? 'Missing/Stripped' : 'Organic Valid'}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
