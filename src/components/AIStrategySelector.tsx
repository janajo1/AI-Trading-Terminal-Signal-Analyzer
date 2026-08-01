import React, { useState } from 'react';
import { AIStrategyPreset, Asset } from '../types';
import { AI_STRATEGIES } from '../data/marketData';
import { Sparkles, Zap, Shield, ChevronRight, Play, BookOpen } from 'lucide-react';

interface AIStrategySelectorProps {
  currentAsset: Asset;
  onApplyStrategy: (strategy: AIStrategyPreset) => void;
  onCustomStrategySubmit: (prompt: string) => void;
  isGeneratingCustom: boolean;
  customResult: string | null;
}

export const AIStrategySelector: React.FC<AIStrategySelectorProps> = ({
  currentAsset,
  onApplyStrategy,
  onCustomStrategySubmit,
  isGeneratingCustom,
  customResult
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<AIStrategyPreset>(AI_STRATEGIES[0]);
  const [customPrompt, setCustomPrompt] = useState('');

  return (
    <div id="ai-strategy-selector" className="p-4 bg-slate-900 text-white rounded-lg border border-slate-800 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            استراتيجيات التداول الجاهزة والمؤتمتة بالذكاء الاصطناعي
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            اختر استراتيجية جاهزة واضغط لتطبيقها فوراً وتوليد توصيات مخصصة لـ <strong className="text-yellow-300 font-mono">{currentAsset.symbol}</strong>.
          </p>
        </div>
      </div>

      {/* Preset Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AI_STRATEGIES.map((strat) => {
          const isSelected = selectedStrategy.id === strat.id;

          return (
            <div
              key={strat.id}
              onClick={() => setSelectedStrategy(strat)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{strat.icon}</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-100">{strat.nameAr}</h3>
                    <span className="text-[10px] text-blue-400 font-mono">{strat.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                    {strat.winRate}% WinRate
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {strat.descriptionAr}
              </p>

              {/* Timeframes & Best Assets */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">الأطر:</span>
                  {strat.timeframes.map((tf) => (
                    <span key={tf} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      {tf}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyStrategy(strat);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>توليد توصية</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Strategy Details & Rules */}
      {selectedStrategy && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              قواعد تنفيذ استراتيجية: {selectedStrategy.nameAr}
            </h4>
            <span className="text-[10px] text-slate-400">مستوى المخاطرة: {selectedStrategy.riskLevel}</span>
          </div>

          <ul className="space-y-1.5 pt-1 text-slate-300">
            {selectedStrategy.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-900/80 text-blue-300 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom AI Strategy Generator Input */}
      <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900/60 space-y-3">
        <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          ولّد استراتيجيتك الخاصة بالذكاء الاصطناعي (Custom AI Strategy Builder)
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="مثال: استراتيجية تداول الذهب 5 دقائق تعتمد على الفجوات السعرية وحجم التداول..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => onCustomStrategySubmit(customPrompt)}
            disabled={isGeneratingCustom || !customPrompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingCustom ? 'جاري البناء...' : 'بناء الاستراتيجية'}</span>
          </button>
        </div>

        {customResult && (
          <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-indigo-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {customResult}
          </div>
        )}
      </div>
    </div>
  );
};
