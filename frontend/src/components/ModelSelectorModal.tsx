import React from 'react';
import { Sparkles, Zap, Cpu, Check, X, ShieldCheck, Info } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  speed: 'Fastest' | 'Very Fast' | 'Standard';
  accuracy: 'High' | 'Very High' | 'Maximum';
  description: string;
  recommendedFor: string;
  tagColor: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Free Tier • Recommended',
    speed: 'Very Fast',
    accuracy: 'Very High',
    description: 'High-performance multimodal workhorse with superb optical recognition of handwritten forms, tables, addresses, and family records.',
    recommendedFor: 'Standard & multi-page handwritten employee forms',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Free Tier • High Speed',
    speed: 'Very Fast',
    accuracy: 'Very High',
    description: 'Versatile multimodal model with fast response times and robust handling of documents and forms.',
    recommendedFor: 'General document extraction & tables',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    badge: 'Free Tier • Zero Spikes & Fast',
    speed: 'Fastest',
    accuracy: 'High',
    description: 'Ultra-low latency model engineered for high availability on Free Tier. Best resistance to temporary high-demand 503 spikes.',
    recommendedFor: 'High reliability, quick turnaround & bulk scans on Free Tier',
    tagColor: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Free Tier • Deep Reasoning',
    speed: 'Standard',
    accuracy: 'Maximum',
    description: 'Advanced reasoning engine with maximum precision for complex, faded, cursive handwriting and challenging multi-document synthesis.',
    recommendedFor: 'Degraded scans, difficult cursive handwriting & complex tables',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-300'
  }
];

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="model-selector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="model-selector-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gemini Models (Free Tier Optimized)
              </h2>
              <p className="text-xs text-slate-500">
                Choose the model used for OCR, handwritten form recognition, and master column mapping
              </p>
            </div>
          </div>
          <button
            id="close-model-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Model Options */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Free Tier Support:</strong> All models below are optimized for Free Tier API keys with automatic failover to alternative models if temporary high-demand (503) spikes occur.
            </span>
          </div>

          <div className="space-y-3">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  id={`model-card-${model.id}`}
                  onClick={() => onSelectModel(model.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 font-mono">
                            {model.id}
                          </h3>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${model.tagColor}`}>
                            {model.badge}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {model.description}
                        </p>

                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Speed: <strong className="text-slate-700">{model.speed}</strong>
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1 font-medium">
                            <Cpu className="w-3 h-3 text-emerald-600" />
                            Accuracy: <strong className="text-slate-700">{model.accuracy}</strong>
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-slate-600 italic">
                            Best for: {model.recommendedFor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Active model: <strong className="font-mono text-slate-800">{selectedModel}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="model-modal-done-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
