import React, { useState } from 'react';
import { Position, PendingOrder, ClosedTrade, Asset } from '../types';
import {
  TrendingUp, TrendingDown, XCircle, Clock, CheckCircle2,
  AlertTriangle, DollarSign, Layers, Play, RefreshCw, Zap
} from 'lucide-react';

interface PositionsPanelProps {
  positions: Position[];
  pendingOrders: PendingOrder[];
  closedTrades: ClosedTrade[];
  currentAsset?: Asset;
  asset?: Asset;
  demoBalance: number;
  onClosePosition: (id: string) => void;
  onCancelPendingOrder: (id: string) => void;
  onExecuteInstantTrade: (type: 'BUY' | 'SELL', lotSize: number) => void;
  onResetDemoBalance?: () => void;
}

export const PositionsPanel: React.FC<PositionsPanelProps> = ({
  positions,
  pendingOrders,
  closedTrades,
  currentAsset: propCurrentAsset,
  asset,
  demoBalance,
  onClosePosition,
  onCancelPendingOrder,
  onExecuteInstantTrade,
  onResetDemoBalance
}) => {
  const currentAsset = propCurrentAsset || asset;
  const currentPrice = currentAsset?.currentPrice ?? 0;
  const [activeTab, setActiveTab] = useState<'positions' | 'pending' | 'history'>('positions');
  const [quickLot, setQuickLot] = useState<number>(0.01);

  // Calculate total unrealized PnL
  const totalUnrealizedPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const currentEquity = demoBalance + totalUnrealizedPnl;

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-3 select-none">
      {/* Top Demo Account Summary & Quick Instant Execution Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
        {/* Account Financial Status */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">رأس المال (Balance):</span>
            <span className="font-mono font-bold text-white">${demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <span className="text-slate-400 block text-[10px]">السيولة الكلية (Equity):</span>
            <span className={`font-mono font-bold ${currentEquity >= demoBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <span className="text-slate-400 block text-[10px]">الأرباح/الخسائر المفتوحة:</span>
            <span className={`font-mono font-bold flex items-center gap-0.5 ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick Instant Execution on Active Candle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
            <span className="text-[10px] text-slate-400">اللوت:</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quickLot}
              onChange={(e) => setQuickLot(Math.max(0.01, Number(e.target.value)))}
              className="w-14 bg-transparent text-emerald-300 font-mono font-bold text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={() => onExecuteInstantTrade('BUY', quickLot)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-all cursor-pointer active:scale-95"
            title={`دخول فوري صفقة شراء BUY بسعر الشمعة الحالية (${currentPrice})`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>شراء BUY ({currentPrice || ''})</span>
          </button>

          <button
            onClick={() => onExecuteInstantTrade('SELL', quickLot)}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-all cursor-pointer active:scale-95"
            title={`دخول فوري صفقة بيع SELL بسعر الشمعة الحالية (${currentPrice})`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>بيع SELL ({currentPrice || ''})</span>
          </button>

          {onResetDemoBalance && (
            <button
              onClick={onResetDemoBalance}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="إعادة شحن الحساب التجريبي"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>الصفقات المفتوحة ({positions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>الأوامر المعلقة ({pendingOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>سجل المغلقة ({closedTrades.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Active Positions */}
      {activeTab === 'positions' && (
        <div className="space-y-2">
          {positions.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-lg border border-slate-900">
              لا توجد صفقات مفتوحة حالياً. يمكنك ضغط &quot;تطبيق التوصية في الحساب التجريبي&quot; أو التداول الفوري مباشرة!
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                    <th className="p-2">الرمز والنوع</th>
                    <th className="p-2">اللوت (Lot)</th>
                    <th className="p-2">سعر الدخول</th>
                    <th className="p-2">السعر الحالي</th>
                    <th className="p-2">وقف الخسارة (SL)</th>
                    <th className="p-2">جني الأرباح (TP)</th>
                    <th className="p-2 text-center">الربح/الخسارة الحية</th>
                    <th className="p-2 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {positions.map((pos) => {
                    const isProfit = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-2 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            pos.type === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {pos.type}
                          </span>
                          <span className="font-bold text-white">{pos.symbol}</span>
                        </td>
                        <td className="p-2 text-slate-300">{pos.lotSize}</td>
                        <td className="p-2 text-slate-200">{pos.entryPrice}</td>
                        <td className="p-2 text-blue-300 font-bold">{pos.currentPrice}</td>
                        <td className="p-2 text-rose-400">{pos.stopLoss ? pos.stopLoss : '-'}</td>
                        <td className="p-2 text-emerald-400">{pos.takeProfit ? pos.takeProfit : '-'}</td>
                        <td className={`p-2 text-center font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 px-2 py-1 rounded text-[11px] font-sans font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
                            title="إغلاق الصفقة بسعر السوق الحالي"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>إغلاق</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Pending Orders */}
      {activeTab === 'pending' && (
        <div className="space-y-2">
          {pendingOrders.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-lg border border-slate-900">
              لا توجد أوامر معلقة حالياً. يمكنك إنشاء امر معلق Limit/Stop عندما ترغب بالانتظار حتى يصل السعر لنقطة أفضل!
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                    <th className="p-2">الرمز والنوع</th>
                    <th className="p-2">اللوت</th>
                    <th className="p-2">السعر المستهدف (Target)</th>
                    <th className="p-2">سعر السوق الان</th>
                    <th className="p-2">وقف الخسارة</th>
                    <th className="p-2">جني الأرباح</th>
                    <th className="p-2 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pendingOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-2 flex items-center gap-1.5">
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          {ord.type}
                        </span>
                        <span className="font-bold text-white">{ord.symbol}</span>
                      </td>
                      <td className="p-2 text-slate-300">{ord.lotSize}</td>
                      <td className="p-2 text-yellow-300 font-bold">{ord.targetPrice}</td>
                      <td className="p-2 text-slate-400">{currentPrice || ord.targetPrice}</td>
                      <td className="p-2 text-rose-400">{ord.stopLoss || '-'}</td>
                      <td className="p-2 text-emerald-400">{ord.takeProfit || '-'}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => onCancelPendingOrder(ord.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer"
                        >
                          إلغاء الأمر
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Closed Trades History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {closedTrades.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-lg border border-slate-900">
              سجل الصفقات المغلقة فارغ. أي صفقة تكتمل أو يتم إغلاقها ستظهر هنا مع تحليل النتيجة بالأرقام.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                    <th className="p-2">الرمز والنوع</th>
                    <th className="p-2">اللوت</th>
                    <th className="p-2">سعر الدخول</th>
                    <th className="p-2">سعر الإغلاق</th>
                    <th className="p-2">سبب الإغلاق</th>
                    <th className="p-2 text-center">الربح المحقق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {closedTrades.map((trd) => {
                    const isWin = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-2 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            trd.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {trd.type}
                          </span>
                          <span className="font-bold text-white">{trd.symbol}</span>
                        </td>
                        <td className="p-2 text-slate-300">{trd.lotSize}</td>
                        <td className="p-2 text-slate-300">{trd.entryPrice}</td>
                        <td className="p-2 text-blue-300 font-bold">{trd.closePrice}</td>
                        <td className="p-2 text-slate-400 font-sans text-[11px]">
                          {trd.closeReason === 'TAKE_PROFIT' ? '🎯 جني أرباح (TP)' : trd.closeReason === 'STOP_LOSS' ? '🛑 وقف خسارة (SL)' : '✋ إغلاق يدوياً'}
                        </td>
                        <td className={`p-2 text-center font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isWin ? '+' : ''}${trd.pnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
