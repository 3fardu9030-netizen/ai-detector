import React, { useState } from 'react';
import { api } from '../services/api';
import {
  AlignLeft, Upload, Loader2, RefreshCw, AlertTriangle, ShieldCheck,
  FileText, Info, HelpCircle
} from 'lucide-react';

export const TextDetect: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [provider, setProvider] = useState('AUTO');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoveredSentence, setHoveredSentence] = useState<{ idx: number; score: number; perplexity: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Document file size exceeds 2MB limit for text extractors.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleScanSubmit = async () => {
    if (inputText.trim().length < 10) {
      setErrorMsg('Please enter at least 10 characters to perform statistical analysis.');
      return;
    }

    setErrorMsg(null);
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await api.post('/detect/text', {
        text: inputText,
        provider
      });
      setScanResult(res.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Text analysis failed. Try checking provider.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setInputText('');
    setScanResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="pt-20 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Automated Text Detection</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analyze vocabulary variation and syntax predictability (Perplexity & Burstiness) to identify LLM signatures.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl text-center mb-6 max-w-xl mx-auto">
          {errorMsg}
        </div>
      )}

      {!scanResult ? (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Controls bar */}
          <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Classifier</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="bg-slate-900 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="AUTO">Auto Engine</option>
                <option value="MOCK">Mock Statistical Analyzer</option>
                <option value="GEMINI">Google Gemini Language</option>
                <option value="HUGGING_FACE">Hugging Face RoBERTa Detector</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400 w-full sm:w-auto justify-end">
              <label className="flex items-center space-x-2 cursor-pointer border border-slate-800 bg-white/5 hover:bg-slate-900 px-3 py-1.5 rounded-lg">
                <Upload className="h-4 w-4 text-brand-400" />
                <span>Upload TXT file</span>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Textarea Input Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the text or essays you wish to scan here (minimum 10 characters)..."
              className="w-full bg-slate-900/40 dark:bg-slate-900/25 border border-slate-800/60 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-600 resize-none"
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Word count: {inputText.split(/\s+/).filter(w => w.length > 0).length}</span>
              <div className="flex space-x-3">
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 border border-slate-800 rounded-lg font-semibold hover:bg-slate-900"
                >
                  Reset
                </button>
                <button
                  onClick={handleScanSubmit}
                  disabled={isScanning}
                  className="flex items-center space-x-2 bg-brand-500 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:bg-brand-600 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing perplexity...</span>
                    </>
                  ) : (
                    <>
                      <AlignLeft className="h-4 w-4" />
                      <span>Scan Content</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results Panels */
        <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KPI Card */}
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
                  {scanResult.result === 'AI' ? 'AI GENERATED' : 'HUMAN AUTHENTIC'}
                </h2>
                <p className="text-xs text-slate-500">Language Model Probability</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Confidence Match</span>
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
                <span>Verify Another Text</span>
              </button>
            </div>

            {/* Detailed Stats Column */}
            <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Statistical Metrics</h3>
                <p className="text-xs text-slate-500 mt-1">Linguistic analysis metrics evaluated across copy.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Perplexity rating</span>
                    <span title="Measures how predictable word choices are. AI text is typically low.">
  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
</span>
                  </div>
                  <span className="text-2xl font-bold">{scanResult.details?.perplexity || 0}</span>
                  <span className="block text-[9px] text-slate-500">Lower implies higher AI likelihood</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Burstiness rating</span>
                    <span title="Measures sentence length variations. AI sentences are highly uniform.">
  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
</span>
                  </div>
                  <span className="text-2xl font-bold">{scanResult.details?.burstiness || 0}</span>
                  <span className="block text-[9px] text-slate-500">Lower implies uniform/synthesized text</span>
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
            </div>
          </div>

          {/* Interactive sentence highlighting area */}
          {scanResult.details?.sentenceAnalysis?.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl space-y-4 relative">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Sentence Level Map</h3>
                <p className="text-[10px] text-slate-500 mt-1">Hover over highlighted sentences to examine AI scores and perplexity.</p>
              </div>

              {/* Floating Tooltip Box */}
              {hoveredSentence && (
                <div className="absolute top-1 right-6 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] space-y-0.5 shadow-xl animate-fade-in z-10">
                  <div>AI Score: <span className="font-bold text-brand-400">{(hoveredSentence.score * 100).toFixed(0)}%</span></div>
                  <div>Sentence Perplexity: <span className="font-bold text-white">{hoveredSentence.perplexity}</span></div>
                </div>
              )}

              <div className="p-4 bg-slate-900/10 border border-slate-800/40 rounded-xl leading-relaxed text-sm space-y-2 select-text">
                {scanResult.details.sentenceAnalysis.map((item: any, idx: number) => {
                  let highlightColor = 'transparent';
                  if (item.score > 0.7) highlightColor = 'rgba(139, 92, 246, 0.25) border-b-2 border-brand-500/60';
                  else if (item.score > 0.4) highlightColor = 'rgba(99, 102, 241, 0.15) border-b border-indigo-500/30';
                  
                  return (
                    <span
                      key={idx}
                      onMouseEnter={() => setHoveredSentence({ idx, score: item.score, perplexity: item.perplexity })}
                      onMouseLeave={() => setHoveredSentence(null)}
                      className={`inline transition-all duration-150 px-1 py-0.5 rounded cursor-pointer ${highlightColor}`}
                    >
                      {item.sentence}.{' '}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
