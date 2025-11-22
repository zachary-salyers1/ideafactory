import React, { useState, useEffect } from 'react';
import { Idea, BuildPlan } from '../types';
import { X, CheckCircle, Code, Target, Rocket, Copy } from 'lucide-react';

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea | null;
  plan: BuildPlan | null;
  isLoading: boolean;
}

export const BuildModal: React.FC<BuildModalProps> = ({ isOpen, onClose, idea, plan, isLoading }) => {
  const [exportStatus, setExportStatus] = useState<'idle' | 'exported'>('idle');

  useEffect(() => {
    if (isOpen) {
        setExportStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportToLinear = async () => {
      if (!plan || !idea) return;

      const textToCopy = `
# Project: ${idea.name}
> ${idea.one_liner}

**Platform**: ${idea.platform}
**Success Probability**: ${idea.success_probability}%

---

## 1. Strategy & GTM
**GTM Strategy**: ${plan.marketing.gtm_strategy}
**Channels**: ${plan.marketing.launch_channels.join(', ')}
**Target Audience**: ${plan.marketing.target_audience.join(', ')}

---

## 2. Technical Spec
**Stack**: ${plan.product.tech_stack.join(', ')}

**MVP Roadmap**:
${plan.product.mvp_roadmap}

---

## 3. Full Detailed Plan
${plan.markdown_full}
      `.trim();

      try {
          await navigator.clipboard.writeText(textToCopy);
          setExportStatus('exported');
          setTimeout(() => setExportStatus('idle'), 2000);
      } catch (err) {
          console.error("Failed to copy", err);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-surface border border-slate-800 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
                {isLoading ? 'Initializing Builder Swarm...' : `Blueprint: ${idea?.name}`}
            </h2>
            {!isLoading && idea && (
                <p className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Project Initialized & Ready for Execution
                </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 animate-pulse">Consulting AI Architects...</p>
            </div>
          ) : plan ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Snapshot */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                            <Rocket className="w-4 h-4" /> GTM Strategy
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            {plan.marketing.gtm_strategy}
                        </p>
                        <div className="space-y-3">
                             <div>
                                <span className="text-slate-500 text-xs uppercase font-bold">Channels</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {plan.marketing.launch_channels.map(c => (
                                        <span key={c} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">{c}</span>
                                    ))}
                                </div>
                             </div>
                             <div>
                                <span className="text-slate-500 text-xs uppercase font-bold">Target Audience</span>
                                <ul className="mt-1 space-y-1">
                                    {plan.marketing.target_audience.map(t => (
                                        <li key={t} className="text-slate-300 text-xs flex items-center gap-2">
                                            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4" /> Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {plan.product.tech_stack.map(t => (
                                <span key={t} className="px-2.5 py-1 bg-blue-950/30 text-blue-300 border border-blue-900/50 rounded-md text-xs font-mono">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed PRD */}
                <div className="lg:col-span-2 space-y-6">
                     <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-purple-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Execution Roadmap
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                                {plan.markdown_full}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
          ) : (
            <div className="text-center text-red-400">Failed to load plan.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
                Close
            </button>
            <button 
                onClick={handleExportToLinear}
                disabled={exportStatus === 'exported' || isLoading || !plan}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    exportStatus === 'exported'
                    ? 'bg-emerald-500 text-white cursor-default hover:bg-emerald-600'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
            >
                {exportStatus === 'exported' ? (
                    <>
                        <CheckCircle className="w-4 h-4" /> Copied to Clipboard
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" /> Export to Linear
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};