import React, { useState, useEffect } from 'react';
import { AISignal, Asset } from '../types';
import { Sparkles, ArrowUpRight, ArrowDownRight, CheckCircle2, Copy, Check, ShieldAlert, Target, Percent, Clock, ChevronDown, ChevronUp, Share2, DollarSign, Calculator, AlertTriangle, Coins } from 'lucide-react';

interface AISignalPanelProps {
  signal: AISignal | null;
  asset: Asset;
  isGenerating: boolean;
  userCapital: number;
  setUserCapital: (val: number) => void;
  riskPercent: number;
  setRiskPercent: (val: number) => void;
  onGenerateNewSignal: () => void;
  onApplyToChart: (signal: AISignal) => void;
  onExecuteDemoTrade?: (signal: AISignal, lotSize: number) => void;
  onPlacePendingOrder?: (order: { symbol: string; type: 'BUY_LIMIT' | 'SELL_LIMIT'; targetPrice: number; lotSize: number; stopLoss: number; takeProfit: number }) => void;
}

export const AISignalPanel: React.FC<AISignalPanelProps> = ({
  signal,
  asset,
  isGenerating,
  userCapital,
  setUserCapital,
  riskPercent,
  setRiskPercent,
  onGenerateNewSignal,
  onApplyToChart,
  onExecuteDemoTrade,
  onPlacePendingOrder
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullReasons, setShowFullReasons] = useState(true);
  
  // Local price customization for price-tailored signals (تحديد حسب السعر)
  const [customEntryPrice, setCustomEntryPrice] = useState<number>(signal?.entryPrice || asset.currentPrice);
  const [customStopLoss, setCustomStopLoss] = useState<number>(signal?.stopLoss || Number((asset.currentPrice * 0.992).toFixed(asset.digits)));

  // Sync when signal or asset updates
  useEffect(() => {
    if (signal) {
      setCustomEntryPrice(signal.entryPrice);
      setCustomStopLoss(signal.stopLoss);
    } else {
      setCustomEntryPrice(asset.currentPrice);
      setCustomStopLoss(Number((asset.currentPrice * 0.992).toFixed(asset.digits)));
    }
  }, [signal, asset]);

  if (isGenerating) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 select-none">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <Sparkles className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">يقوم الذكاء الاصطناعي بتوليد التوصية المخصصة...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            حساب اللوت المناسب لرأس مالك (${userCapital.toLocaleString()}) وسعر {asset.symbol} الحالي...
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
            اضغط على زر التوصيات التلقائية للحصول على إشارة تداول مخصصة لحجم رأس مالك (${userCapital.toLocaleString()}) وسعر {asset.symbol}.
          </p>
        </div>
        <button
          onClick={onGenerateNewSignal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>ولّد توصية مخصصة لرأس مالك</span>
        </button>
      </div>
    );
  }

  const isBuy = signal.type === 'BUY';

  // Capital & Price calculations
  const maxRiskDollar = (userCapital * riskPercent) / 100;
  const priceDiffSL = Math.abs(customEntryPrice - customStopLoss);
  const multiplier = asset.category === 'crypto' ? 1 : (asset.category === 'commodities' ? 100 : 1000);
  const calculatedLot = priceDiffSL > 0
    ? Math.max(0.01, Number((maxRiskDollar / (priceDiffSL * multiplier)).toFixed(2)))
    : 0.01;

  const profitTp1Dollar = Number((Math.abs(signal.takeProfit1 - customEntryPrice) * multiplier * calculatedLot).toFixed(2));
  const profitTp2Dollar = Number((Math.abs(signal.takeProfit2 - customEntryPrice) * multiplier * calculatedLot).toFixed(2));
  const profitTp3Dollar = Number((Math.abs(signal.takeProfit3 - customEntryPrice) * multiplier * calculatedLot).toFixed(2));

  // Capital-tailored guidance
  let capitalAdvice = "";
  if (userCapital < 10) {
    capitalAdvice = `🌱 رأس مال ميكرو/سريع ($${userCapital}): ممتازة جداً لتداول عملات الكريبتو والميكرو-لوت! يمكنك التداول بدءاً من 1$ أو 3$ بحجم عقد ميكرو آمن مع متابعة الأهداف.`;
  } else if (userCapital < 500) {
    capitalAdvice = `⚠️ حساب صغير ($${userCapital}): ننصح بمخاطرة منخفضة (1-2%) واستخدام أصغر لوت ممكن (0.01) وإغلاق الصفقة أو تأمينها فور تحقيق Target 1 لحماية الحساب.`;
  } else if (userCapital <= 2500) {
    capitalAdvice = `✅ حساب متوسط ($${userCapital}): اللوت الموصى به لصفقة ${signal.symbol} هو ${calculatedLot} Lot بحد أقصى للمخاطرة ${maxRiskDollar.toFixed(2)}$. يفضل جني 50% من الربح عند Target 1.`;
  } else {
    capitalAdvice = `🚀 حساب ممتاز ($${userCapital}): اللوت المحسوب لصفقتك ${calculatedLot} Lot مع نسبة مخاطرة آمنة (${riskPercent}%). يمكنك تقسيم العقد على الأهداف الثلاثة لتحقيق أقصى عائد ممكن ($${profitTp3Dollar}).`;
  }

  const copySignalToClipboard = () => {
    const text = `🚨 **توصية تداول ذكية مخصصة حسب رأس المال** 🚨

الرمز: ${signal.symbol} (${signal.assetName})
الإطار الزمني: ${signal.timeframe}
نوع التوصية: ${signal.type === 'BUY' ? '🔵 شراء (BUY)' : '🔴 بيع (SELL)'}
الاستراتيجية: ${signal.strategyName}

💵 **رأس المال المستخدم:** $${userCapital.toLocaleString()}
📊 **حجم اللوت الموصى به:** ${calculatedLot} Lot (مخاطرة ${riskPercent}% = $${maxRiskDollar.toFixed(2)})

📍 **سعر الدخول:** ${customEntryPrice}
⛔ **وقف الخسارة:** ${customStopLoss} (خسارة متوقعة: -$${maxRiskDollar.toFixed(2)})

🎯 **الهدف 1:** ${signal.takeProfit1} (ربح متوقع: +$${profitTp1Dollar})
🎯 **الهدف 2:** ${signal.takeProfit2} (ربح متوقع: +$${profitTp2Dollar})
🎯 **الهدف 3:** ${signal.takeProfit3} (ربح متوقع: +$${profitTp3Dollar})

💡 **ملاحظة رأس المال:** ${capitalAdvice}
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
            مركز التوصيات المخصصة لـ {signal.symbol}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copySignalToClipboard}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="نسخ التوصية مع حساب الأرباح واللوت"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{copied ? 'تم النسخ!' : 'نسخ التوصية'}</span>
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

        {/* --- CAPITAL & PRICE TAILORED CALCULATOR PANEL (ميزة التوصية حسب المبلغ والسعر) --- */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-yellow-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-yellow-400" />
              تخصيص التوصية حسب رأس مالك وسعرك
            </span>
            <span className="text-[10px] bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded border border-yellow-800 font-semibold">
              حاسبة ذكية تلقائية
            </span>
          </div>

          {/* Capital Input & Quick Presets */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-300 block font-semibold">
              أدخل رأس مالك المستثمر ($):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="w-4 h-4 absolute right-2.5 top-2 text-emerald-400" />
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={userCapital}
                  onChange={(e) => setUserCapital(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-2 py-1 text-white font-mono font-bold text-xs focus:outline-none focus:border-yellow-500"
                  placeholder="مثال: 3 أو 10"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {[1, 3, 10, 50, 100, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setUserCapital(val)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      userCapital === val
                        ? 'bg-yellow-500 text-slate-950 border-yellow-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ${val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Selector & Custom Price input */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">نسبة المخاطرة للحساب:</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskPercent(r)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      riskPercent === r
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-400 block">سعر الدخول للشمعة:</label>
                <button
                  onClick={() => {
                    setCustomEntryPrice(asset.currentPrice);
                    const delta = asset.currentPrice * 0.0035;
                    const isB = signal.type === 'BUY';
                    const f = isB ? 1 : -1;
                    setCustomStopLoss(Number((asset.currentPrice - f * delta * 1.2).toFixed(asset.digits)));
                  }}
                  className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/80"
                  title="مزامنة فورية مع سعر الشمعة النشطة الآن"
                >
                  <span>⚡ سعر الشمعة الآن ({asset.currentPrice})</span>
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={customEntryPrice}
                onChange={(e) => setCustomEntryPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-blue-300 font-mono text-[11px] focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          {/* Live Tailored Capital Output Cards */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 bg-slate-900 rounded-lg border border-yellow-500/40">
              <div className="text-[9px] text-slate-400 uppercase font-bold">اللوت المناسب لك</div>
              <div className="text-base font-mono font-black text-yellow-400 mt-0.5">{calculatedLot} Lot</div>
              <div className="text-[9px] text-slate-500">موصى به لحسابك</div>
            </div>

            <div className="p-2 bg-slate-900 rounded-lg border border-rose-500/40">
              <div className="text-[9px] text-rose-400 uppercase font-bold">أقصى خسارة ($)</div>
              <div className="text-base font-mono font-bold text-rose-300 mt-0.5">-${maxRiskDollar.toFixed(2)}</div>
              <div className="text-[9px] text-slate-500">{riskPercent}% عند الوقف</div>
            </div>

            <div className="p-2 bg-slate-900 rounded-lg border border-emerald-500/40">
              <div className="text-[9px] text-emerald-400 uppercase font-bold">ربح متوقع (TP1)</div>
              <div className="text-base font-mono font-bold text-emerald-300 mt-0.5">+${profitTp1Dollar}</div>
              <div className="text-[9px] text-slate-500">في الحساب</div>
            </div>
          </div>

          {/* Tailored AI Capital Guidance Note */}
          <div className="p-2 bg-slate-900/90 rounded border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="leading-tight text-[10px] text-slate-300">{capitalAdvice}</p>
          </div>
        </div>

        {/* Entry / Stop Loss / Take Profit Grid with Dollar Profit Indicators */}
        <div className="space-y-2">
          {/* Entry Price */}
          <div className="p-3 bg-slate-950 rounded-lg border border-blue-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">سعر الدخول المقترح</div>
                <div className="text-sm font-bold font-mono text-blue-300">{customEntryPrice}</div>
              </div>
            </div>
            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-mono">
              {asset.symbol}
            </span>
          </div>

          {/* Stop Loss (SL) */}
          <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[10px] text-rose-400 uppercase font-bold">إيقاف الخسارة (Stop Loss)</div>
                <div className="text-sm font-bold font-mono text-rose-300">{customStopLoss}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-rose-400 font-mono block">-${maxRiskDollar.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 font-mono">({riskPercent}% من حسابك)</span>
            </div>
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
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">+${profitTp1Dollar}</span>
              <span className="text-[9px] text-slate-500 font-mono">TP1 (آمن)</span>
            </div>
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
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">+${profitTp2Dollar}</span>
              <span className="text-[9px] text-slate-500 font-mono">TP2 (متوسط)</span>
            </div>
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
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">+${profitTp3Dollar}</span>
              <span className="text-[9px] text-slate-500 font-mono">TP3 (أقصى عائد)</span>
            </div>
          </div>
        </div>

        {/* AI Rationale Accordion & Entry Timing Explanation */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded border border-emerald-800/60">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              توقيت الدخول الفوري للشمعة الأخيرة:
            </span>
            <span className="font-mono text-white text-[10px]">دخول الآن ({customEntryPrice})</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            💡 التوصية محسوبة على **سعر الشمعة النشطة حالياً** لتتمكن من الدخول فوراً بدون إضاعة الوقت، أو اختيار **أمر معلق Limit** إذا أردت الانتظار لحين هبوط السعر لمستوى أفضل.
          </p>

          <div
            onClick={() => setShowFullReasons(!showFullReasons)}
            className="flex items-center justify-between cursor-pointer font-bold text-slate-300 pt-1 border-t border-slate-900"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              لماذا هذا هو وقت الدخول المناسب؟ (AI Rationale)
            </span>
            {showFullReasons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {showFullReasons && (
            <div className="space-y-2 pt-1 text-slate-300">
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

        {/* Action Buttons: Execute Demo Trade, Pending Order, Apply signal & Regenerate */}
        <div className="space-y-2 pt-1">
          {onExecuteDemoTrade && (
            <button
              onClick={() => onExecuteDemoTrade({ ...signal, entryPrice: customEntryPrice, stopLoss: customStopLoss }, calculatedLot)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98 border border-emerald-400/40"
              title="تنفيد التوصية فوراً بأموال تجريبية مطابقة لسعر السوق الحقيقي"
            >
              <Coins className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>⚡ تطبيق التوصية فوراً في الحساب التجريبي Demo ({calculatedLot} Lot)</span>
            </button>
          )}

          {onPlacePendingOrder && (
            <button
              onClick={() => onPlacePendingOrder({
                symbol: signal.symbol,
                type: signal.type === 'BUY' ? 'BUY_LIMIT' : 'SELL_LIMIT',
                targetPrice: Number((customEntryPrice * (signal.type === 'BUY' ? 0.998 : 1.002)).toFixed(asset.digits)),
                lotSize: calculatedLot,
                stopLoss: customStopLoss,
                takeProfit: signal.takeProfit1
              })}
              className="w-full bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="إنشاء أمر معلق ليتم التنفيذ تلقائياً عند النزول لطلب أفضل"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>⏳ تعيين أمر معلق (Limit Order) للانتظار حتى السعر الأنسب</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onApplyToChart({ ...signal, entryPrice: customEntryPrice, stopLoss: customStopLoss })}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 shadow transition-colors cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-yellow-300" />
              <span>رسم الخريطة بالألوان</span>
            </button>

            <button
              onClick={onGenerateNewSignal}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>تحديث التوصية</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

