import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Image, Play, AlignLeft, CheckCircle, ArrowRight, Star, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const features = [
    {
      title: 'Automated Image Scan',
      desc: 'Analyze uploads for generative noise patterns, camera metadata irregularities, and compression frequencies common in Midjourney, DALL-E, and Stable Diffusion.',
      icon: Image,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Real-Time Video Check',
      desc: 'Scan frame sequences for face warping, lip sync offsets, and temporal noise inconsistencies to instantly isolate Deepfake synthesizers and generated clips.',
      icon: Play,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Statistical Text Analyzer',
      desc: 'Analyze sentence-level complexity. Our models compute true Perplexity and Burstiness indices to identify ChatGPT, Claude, and Gemini text compositions.',
      icon: AlignLeft,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
    }
  ];

  const pricing = [
    { name: 'Starter', price: '$0', desc: 'Perfect for basic testing', features: ['10 scans per month', 'Image & Text detection', 'Mock engine analysis', 'Standard logs'] },
    { name: 'Pro Plan', price: '$29', desc: 'For content creators & editors', features: ['500 scans per month', 'Image, Text, & Video scans', 'Gemini & HF model access', 'Export PDF/CSV logs', 'API keys integration'], popular: true },
    { name: 'Enterprise', price: 'Custom', desc: 'For corporate scale compliance', features: ['Unlimited automated scans', 'Shared team folders', 'SLA dedicated server routing', 'Custom detection heuristics', '24/7 Priority support'] }
  ];

  const faqs = [
    { q: 'How does TruthLens AI detect AI content?', a: 'TruthLens uses automated statistical and neural analyzers. For text, it computes vocabulary predictability (perplexity) and sentence length variability (burstiness). For images/videos, it scans pixel histograms for artificial lighting gradients and frame consistency markers.' },
    { q: 'Can I connect my own AI keys?', a: 'Yes! Admin settings allow users to connect Google Gemini or Hugging Face API keys directly, routing calculations through advanced LLMs and neural pipelines.' },
    { q: 'What file sizes are supported?', a: 'We support uploads up to 20MB in standard media extensions: JPG, PNG, WEBP, MP4, MOV, AVI, PDF, DOCX, and TXT.' }
  ];

  return (
    <div className="pt-16 pb-12 space-y-24 bg-mesh-light dark:bg-mesh-dark min-h-screen text-slate-800 dark:text-slate-200">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 text-center relative overflow-hidden">
        {/* Glow circles behind hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/5 text-xs text-brand-400 font-medium">
            <Sparkles className="h-4.5 w-4.5 text-brand-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Instant Automated Content Authentication</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Reveal the Invisible Boundary of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-500 to-pink-500">
              Generative AI
            </span>
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            TruthLens AI runs automatic, statistical, and neural scans to detect whether uploaded images, video frame streams, or copy were synthesized by machine models or authored by humans.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/55 transition-all duration-200"
            >
              <span>Scan Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center border border-slate-300 dark:border-slate-800 bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-900/60 font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight">AI Content Detection Engines</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Our platform features specialized decoders that analyze content structural patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-panel p-8 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 hover:shadow-md hover:shadow-brand-500/5"
              >
                <div className="space-y-4">
                  <div className={`p-3.5 rounded-xl border w-fit ${feat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{feat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section (Demo Tiers) */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Flexible Demo Tiers</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose the volume that fits your editorial workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricing.map((tier) => (
            <div
              key={tier.name}
              className={`glass-panel p-8 rounded-2xl flex flex-col justify-between relative hover:border-brand-500/40 transition-all duration-300 ${
                tier.popular ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-brand-500/5' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-xs text-slate-500 ml-1">/mo</span>}
                </div>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center space-x-2">
                      <CheckCircle className="h-4.5 w-4.5 text-brand-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 block text-center ${
                    tier.popular
                      ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20'
                      : 'border border-slate-300 dark:border-slate-800 bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  Start Scanning
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Answers to common questions about automated detection logic.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-brand-500 shrink-0" />
                  <span>{faq.q}</span>
                </span>
                <span className="text-brand-500 font-bold text-lg leading-none">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/40 leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
