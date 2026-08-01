import React, { useState } from 'react';
import { Asset, AISignal } from '../types';
import { Calculator, DollarSign, ShieldAlert, TrendingUp, RefreshCw } from 'lucide-react';

interface PositionCalculatorProps {
  asset: Asset;
  activeSignal: AISignal | null;
  userCapital?: number;
  setUserCapital?: (val: number) => void;
  riskPercent?: number;
  setRiskPercent?: (val: number) => void;
}

export const PositionCalculator: React.FC<PositionCalculatorProps> = ({
  asset,
  activeSignal,
  userCapital: externalCapital,
  setUserCapital: externalSetCapital,
  riskPercent: externalRiskPercent,
  setRiskPercent: externalSetRiskPercent
}) => {
  const [internalBalance, setInternalBalance] = useState<number>(1000);
  const [internalRiskPercent, setInternalRiskPercent] = useState<number>(2);

  const balance = externalCapital !== undefined ? externalCapital : internalBalance;
  const setBalance = (val: number) => {
    setInternalBalance(val);
    if (externalSetCapital) externalSetCapital(val);
  };

  const riskPercent = externalRiskPercent !== undefined ? externalRiskPercent : internalRiskPercent;
  const setRiskPercent = (val: number) => {
    setInternalRiskPercent(val);
    if (externalSetRiskPercent) externalSetRiskPercent(val);
  };

  const [entryPrice, setEntryPrice] = useState<number>(activeSignal?.entryPrice || asset.currentPrice);
  const [stopLoss, setStopLoss] = useState<number>(activeSignal?.stopLoss || Number((asset.currentPrice * 0.992).toFixed(asset.digits)));
  const [takeProfit, setTakeProfit] = useState<number>(activeSignal?.takeProfit1 || Number((asset.currentPrice * 1.015).toFixed(asset.digits)));

  // Calculate risk amount
  const maxRiskAmount = (balance * riskPercent) / 100;

  // Calculate distance in pips/points
  const priceDiffSL = Math.abs(entryPrice - stopLoss);
  const priceDiffTP = Math.abs(takeProfit - entryPrice);

  // Approximate lot size formula (assuming 1 standard lot = 100,000 units for Forex or standard contract size)
  const lotSize = priceDiffSL > 0
    ? Math.max(0.01, Number((maxRiskAmount / (priceDiffSL * (asset.category === 'crypto' ? 1 : 1000))).toFixed(2)))
    : 0.01;

  const potentialProfit = priceDiffSL > 0
    ? Number(((priceDiffTP / priceDiffSL) * maxRiskAmount).toFixed(2))
    : 0;

  const rrRatio = priceDiffSL > 0 ? Number((priceDiffTP / priceDiffSL).toFixed(2)) : 1;

  return (
    <div id="position-calculator" className="p-4 bg-slate-900 text-white rounded-lg border border-slate-800 space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          حاسبة حجم اللوت وإدارة المخاطر (MT5 Risk & Lot Size Calculator)
        </h2>
        <span className="text-[10px] text-slate-400 font-mono">حساب دقيق لـ {asset.symbol}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Account Balance */}
        <div className="space-y-1">
          <label className="text-slate-400 text-[11px] block">رأس المال الكلي ($):</label>
          <div className="relative">
            <DollarSign className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
            <input
              type="number"
              min="1"
              step="any"
              value={balance}
              onChange={(e) => setBalance(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-2 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              placeholder="مثال: 1 أو 3"
            />
          </div>
        </div>

        {/* Risk Percentage */}
        <div className="space-y-1">
          <label className="text-slate-400 text-[11px] block">نسبة المخاطرة (%):</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 5].map((p) => (
              <button
                key={p}
                onClick={() => setRiskPercent(p)}
                className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border ${
                  riskPercent === p
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        {/* Entry Price */}
        <div className="space-y-1">
          <label className="text-slate-400 text-[11px] block">سعر الدخول:</label>
          <input
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stop Loss Price */}
        <div className="space-y-1">
          <label className="text-slate-400 text-[11px] block">وقف الخسارة (SL):</label>
          <input
            type="number"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-rose-300 font-mono focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Results Ticker Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold">حجم اللوت الموصى به</div>
          <div className="text-xl font-mono font-black text-yellow-400 mt-1">{lotSize} Lot</div>
          <div className="text-[9px] text-slate-500 mt-0.5">عقود MT5 القياسية</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 text-center">
          <div className="text-[10px] text-rose-400 uppercase font-bold">أقصى مبلغ للمخاطرة</div>
          <div className="text-xl font-mono font-bold text-rose-300 mt-1">${maxRiskAmount.toFixed(2)}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">{riskPercent}% من حسابك</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/40 text-center">
          <div className="text-[10px] text-emerald-400 uppercase font-bold">الربح المتوقع عند TP</div>
          <div className="text-xl font-mono font-bold text-emerald-300 mt-1">${potentialProfit.toFixed(2)}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">عند تحقيق الهدف</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-blue-900/40 text-center">
          <div className="text-[10px] text-blue-400 uppercase font-bold">نسبة العائد للمخاطرة</div>
          <div className="text-xl font-mono font-bold text-blue-300 mt-1">1:{rrRatio} R:R</div>
          <div className="text-[9px] text-slate-500 mt-0.5">المعدل الممتاز &gt; 1:2</div>
        </div>
      </div>
    </div>
  );
};
