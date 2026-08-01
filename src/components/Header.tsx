import React from 'react';
import { Asset } from '../types';
import { Sparkles, Server, DollarSign, BookOpen, Layers, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  currentAsset: Asset;
  onGenerateSignal: () => void;
  onOpenHostingGuide: () => void;
  isGenerating: boolean;
  demoBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentAsset,
  onGenerateSignal,
  onOpenHostingGuide,
  isGenerating,
  demoBalance
}) => {
  return (
    <header id="mt5-header" className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none">
      {/* Brand & Terminal Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">
          <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="font-bold text-base tracking-wide text-white">MT5 AI Terminal</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>سيرفر التداول: <strong className="text-slate-200">AI-Studio-Live-01</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
      </div>

      {/* Active Symbol Banner */}
      <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800">
        <span className="text-xl">{currentAsset.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-yellow-400 tracking-wider">{currentAsset.symbol}</span>
            <span className="text-xs text-slate-400">({currentAsset.nameAr})</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-300">{currentAsset.currentPrice.toFixed(currentAsset.digits)}</span>
            <span className={`font-bold ${currentAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentAsset.change24h >= 0 ? '+' : ''}{currentAsset.change24h}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions & Balance & Free Hosting */}
      <div className="flex items-center gap-2.5">
        {/* Account Balance Ticker */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <div className="text-slate-400 text-[10px]">حساب تجريبي MT5</div>
            <div className="font-mono font-bold text-emerald-300">${demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* AI Instant Signal Button */}
        <button
          id="btn-auto-signal"
          onClick={onGenerateSignal}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-lg shadow-emerald-900/40 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 text-yellow-300 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'جاري تحليل الذكاء الاصطناعي...' : 'توصية تلقائية للزوج الحالي'}</span>
        </button>

        {/* Free Hosting & Deployment Button */}
        <button
          id="btn-hosting-guide"
          onClick={onOpenHostingGuide}
          className="flex items-center gap-1.5 bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-700 text-indigo-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
          title="دليل استضافة المنصة مجاناً"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">كيف تستضيف المنصة مجاناً؟</span>
        </button>
      </div>
    </header>
  );
};
