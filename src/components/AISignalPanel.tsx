import React, { useState } from 'react';
import { AISignal, Asset } from '../types';
import { Sparkles, ArrowUpRight, ArrowDownRight, CheckCircle2, Copy, Check, ShieldAlert, Target, Percent, Clock, ChevronDown, ChevronUp, Share2 } from 'lucide-react';

interface AISignalPanelProps {
  signal: AISignal | null;
  asset: Asset;
  isGenerating: boolean;
  onGenerateNewSignal: () => void;
  onApplyToChart: (signal: AISignal) => void;
}

export const AISignalPanel: React.FC<AISignalPanelProps> = ({
  signal,
  asset,
  isGenerating,
  onGenerateNewSignal,
  onApplyToChart
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullReasons, setShowFullReasons] = useState(true);

  if (isGenerating) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 select-none">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <Sparkles className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">يقوم الذكاء الاصطناعي بتوليد التوصية...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            تحليل نماذج الشموع اليابانية، مستويات السيولة المؤسسية (Order Blocks)، ومؤشرات الزخم لـ {asset.symbol}...
          </p>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 select-none">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <Target className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">لا توجد توصية نشطة حالياً</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            اضغط على زر التوصيات التلقائية للحصول على إشارة تداول دقيقة بنقاط الدخول، وقف الخسارة، والأهداف.
          </p>
        </div>
        <button
          onClick={onGenerateNewSignal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>ولّد توصية الآن لـ {asset.symbol}</span>
        </button>
      </div>
    );
  }

  const isBuy = signal.type === 'BUY';

  const copySignalToClipboard = () => {
    const text = `🚨 **توصية تداول ذكية تلقائية (AI MT5 SIGNAL)** 🚨

الرمز: ${signal.symbol} (${signal.assetName})
الإطار الزمني: ${signal.timeframe}
نوع التوصية: ${signal.type === 'BUY' ? '🔵 شراء (BUY)' : '🔴 بيع (SELL)'}
الاستراتيجية: ${signal.strategyName}

📍 **سعر الدخول (Entry):** ${signal.entryPrice}
⛔ **وقف الخسارة (Stop Loss):** ${signal.stopLoss}

🎯 **الهدف الأول (TP1):** ${signal.takeProfit1}
🎯 **الهدف الثاني (TP2):** ${signal.takeProfit2}
🎯 **الهدف الثالث (TP3):** ${signal.takeProfit3}

📊 **نسبة المخاطرة للعائد:** 1:${signal.riskRewardRatio}
🛡️ **نسبة الثقة:** ${signal.confidence}%

ملاحظة التحليل: ${signal.analysisSummary}
---
تم التوليد بواسطة منصة الذكاء الاصطناعي للتداول`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="ai-signal-panel" className="h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto custom-scrollbar select-none">
      {/* Header Banner */}
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wide">
            مركز التوصيات التلقائية
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copySignalToClipboard}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="نسخ التوصية"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{copied ? 'تم النسخ!' : 'نسخ'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Signal Buy/Sell Card Header */}
        <div className={`p-4 rounded-xl border relative overflow-hidden ${
          isBuy
            ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/50 text-emerald-100'
            : 'bg-gradient-to-br from-rose-950/80 to-slate-900 border-rose-500/50 text-rose-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400">{signal.symbol} • {signal.timeframe}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-black px-3 py-1 rounded-lg tracking-wider flex items-center gap-1 ${
                  isBuy ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-950'
                }`}>
                  {isBuy ? <ArrowUpRight className="w-6 h-6 stroke-[3]" /> : <ArrowDownRight className="w-6 h-6 stroke-[3]" />}
                  <span>{signal.type}</span>
                </span>
                <span className="text-xs font-semibold text-slate-300">{signal.assetName}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">نسبة الثقة</div>
              <div className="text-xl font-mono font-black text-yellow-400 flex items-center gap-1 justify-end">
                <span>{signal.confidence}%</span>
                <Percent className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">1:{signal.riskRewardRatio} R:R</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-blue-300">الاستراتيجية: {signal.strategyName}</span>
            <span className="text-slate-400 font-mono">{signal.timestamp}</span>
          </div>
        </div>

        {/* Entry / Stop Loss / Take Profit Grid */}
        <div className="space-y-2">
          {/* Entry Price */}
          <div className="p-3 bg-slate-950 rounded-lg border border-blue-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">سعر الدخول (Entry Price)</div>
                <div className="text-sm font-bold font-mono text-blue-300">{signal.entryPrice}</div>
              </div>
            </div>
            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              دخول مباشر
            </span>
          </div>

          {/* Stop Loss (SL) */}
          <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[10px] text-rose-400 uppercase font-bold">إيقاف الخسارة (Stop Loss)</div>
                <div className="text-sm font-bold font-mono text-rose-300">{signal.stopLoss}</div>
              </div>
            </div>
            <span className="text-[10px] text-rose-400 font-mono">حماية الحساب</span>
          </div>

          {/* Take Profit 1 */}
          <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-emerald-400 uppercase font-bold">الهدف الأول (Take Profit 1)</div>
                <div className="text-sm font-bold font-mono text-emerald-300">{signal.takeProfit1}</div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              TP 1 (آمن)
            </span>
          </div>

          {/* Take Profit 2 */}
          <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-[10px] text-emerald-400 uppercase font-bold">الهدف الثاني (Take Profit 2)</div>
                <div className="text-sm font-bold font-mono text-emerald-300">{signal.takeProfit2}</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">TP 2 (متوسط)</span>
          </div>

          {/* Take Profit 3 */}
          <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[10px] text-emerald-400 uppercase font-bold">الهدف الثالث (Take Profit 3)</div>
                <div className="text-sm font-bold font-mono text-emerald-300">{signal.takeProfit3}</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">TP 3 (أقصى عائد)</span>
          </div>
        </div>

        {/* AI Rationale Accordion */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
          <div
            onClick={() => setShowFullReasons(!showFullReasons)}
            className="flex items-center justify-between cursor-pointer font-bold text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              سبب التوصية والرؤية الفنية (AI Rationale)
            </span>
            {showFullReasons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {showFullReasons && (
            <div className="space-y-2 pt-1 border-t border-slate-900 text-slate-300">
              <p className="leading-relaxed text-[11px] text-slate-300">
                {signal.analysisSummary}
              </p>
              <ul className="space-y-1 text-[11px]">
                {signal.keyReasons?.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Button: Apply signal & Regenerate */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => onApplyToChart(signal)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Target className="w-4 h-4 text-yellow-300" />
            <span>رسم خطوط الدخول ووقف الخسارة على الشاشة</span>
          </button>

          <button
            onClick={onGenerateNewSignal}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>تحديث وتوليد توصية جديدة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
