import React from 'react';
import { Asset, TechnicalIndicators } from '../types';
import { TrendingUp, TrendingDown, Gauge, BarChart3, Activity } from 'lucide-react';

interface TechnicalSummaryBarProps {
  asset: Asset;
  indicators: TechnicalIndicators;
}

export const TechnicalSummaryBar: React.FC<TechnicalSummaryBarProps> = ({
  asset,
  indicators
}) => {
  const score = indicators.overallScore || 75;
  
  let gaugeLabel = 'Neutral';
  let gaugeColor = 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';

  if (score >= 80) {
    gaugeLabel = 'شراء قوي (Strong Buy)';
    gaugeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
  } else if (score >= 60) {
    gaugeLabel = 'شراء (Buy)';
    gaugeColor = 'text-emerald-300 border-emerald-500/30 bg-emerald-500/5';
  } else if (score <= 20) {
    gaugeLabel = 'بيع قوي (Strong Sell)';
    gaugeColor = 'text-rose-500 border-rose-500/50 bg-rose-500/10';
  } else if (score <= 40) {
    gaugeLabel = 'بيع (Sell)';
    gaugeColor = 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  }

  return (
    <div id="technical-summary-bar" className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-white space-y-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            مقياس التحليل الفني والإشارات المدمجة لـ {asset.symbol}
          </h3>
        </div>

        {/* Overall Sentiment Badge */}
        <div className={`px-3 py-1 rounded-full border text-xs font-bold font-mono flex items-center gap-1.5 ${gaugeColor}`}>
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>{gaugeLabel}</span>
          <span className="text-[10px] opacity-80">({score}/100)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* RSI Indicator */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">RSI (14)</span>
            <div className="text-sm font-bold font-mono text-purple-300">{indicators.rsi}</div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            indicators.rsi > 70 ? 'bg-rose-950 text-rose-300' : indicators.rsi < 30 ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
          }`}>
            {indicators.rsi > 70 ? 'تشبع شرائي' : indicators.rsi < 30 ? 'تشبع بيعي' : 'منطقة متوازنة'}
          </span>
        </div>

        {/* MACD Indicator */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">MACD (12,26,9)</span>
            <div className="text-sm font-bold font-mono text-blue-300">{indicators.macd.macd.toFixed(3)}</div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            indicators.macd.histogram >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
          }`}>
            {indicators.macd.histogram >= 0 ? 'زخم صاعد 🟢' : 'زخم هابط 🔴'}
          </span>
        </div>

        {/* Moving Averages Trend */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">الاتجاه العام (Moving Avg)</span>
            <div className="text-sm font-bold font-mono text-emerald-300">{indicators.trend}</div>
          </div>
          <span className="text-[10px] text-slate-400">SMA50 &gt; SMA200</span>
        </div>

        {/* Candlestick Pattern */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">نمط الشمعة اليابانية</span>
            <div className="text-xs font-bold text-yellow-300 line-clamp-1">
              {indicators.patternsDetected[0] || 'Bullish Rejection'}
            </div>
          </div>
          <BarChart3 className="w-4 h-4 text-yellow-400" />
        </div>
      </div>
    </div>
  );
};
