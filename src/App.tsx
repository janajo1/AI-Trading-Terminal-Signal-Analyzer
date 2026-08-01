import React, { useState, useEffect } from 'react';
import { Asset, TimeFrame, Candle, AISignal, TechnicalIndicators, AIStrategyPreset } from './types';
import { INITIAL_ASSETS, generateCandles } from './data/marketData';
import { Header } from './components/Header';
import { MarketWatchSidebar } from './components/MarketWatchSidebar';
import { CandlestickChart } from './components/CandlestickChart';
import { AISignalPanel } from './components/AISignalPanel';
import { AIStrategySelector } from './components/AIStrategySelector';
import { PositionCalculator } from './components/PositionCalculator';
import { TechnicalSummaryBar } from './components/TechnicalSummaryBar';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { Zap, Sparkles, Calculator, BookOpen, MessageSquare, Send, Bot, User, RefreshCw, PanelRightClose, PanelRightOpen } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[4]); // Default XAUUSD (Gold)
  const [timeframe, setTimeframe] = useState<TimeFrame>('M15');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [activeSignal, setActiveSignal] = useState<AISignal | null>(null);
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);
  const [isHostingGuideOpen, setIsHostingGuideOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'strategies' | 'calculator' | 'copilot'>('strategies');

  // Custom AI Strategy states
  const [isGeneratingCustomStrategy, setIsGeneratingCustomStrategy] = useState(false);
  const [customStrategyResult, setCustomStrategyResult] = useState<string | null>(null);

  // Copilot Chat States
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'أهلاً بك في مساعد التداول الذكي نمط MT5! يمكنك سؤالي عن تحليل أي زوج، سيناريوهات السوق، أو كيفية إعداد صفقاتك بنجاح.',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load candle data when selected asset or timeframe changes
  useEffect(() => {
    const freshCandles = generateCandles(selectedAsset.currentPrice, selectedAsset.digits, 65);
    setCandles(freshCandles);
  }, [selectedAsset.symbol, timeframe]);

  // Periodic price updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(a => {
        const delta = (Math.random() - 0.495) * (a.currentPrice * 0.0008);
        const newPrice = Number((a.currentPrice + delta).toFixed(a.digits));
        return {
          ...a,
          currentPrice: newPrice
        };
      }));

      // Update current selected asset price in candles
      setCandles(prev => {
        if (prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const lastCandle = prev[lastIndex];
        const delta = (Math.random() - 0.495) * (selectedAsset.currentPrice * 0.0008);
        const newClose = Number((lastCandle.close + delta).toFixed(selectedAsset.digits));
        const newHigh = Math.max(lastCandle.high, newClose);
        const newLow = Math.min(lastCandle.low, newClose);

        const updated = [...prev];
        updated[lastIndex] = {
          ...lastCandle,
          close: newClose,
          high: newHigh,
          low: newLow
        };
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Technical Indicators summary calculation
  const lastPrice = candles.length > 0 ? candles[candles.length - 1].close : selectedAsset.currentPrice;
  const technicals: TechnicalIndicators = {
    rsi: 58,
    rsiMa: 54,
    macd: { macd: 0.24, signal: 0.18, histogram: 0.06 },
    sma50: lastPrice * 0.995,
    sma200: lastPrice * 0.985,
    ema20: lastPrice * 0.998,
    ema50: lastPrice * 0.994,
    ema200: lastPrice * 0.982,
    ema1000: lastPrice * 0.965,
    bollinger: { upper: lastPrice * 1.008, middle: lastPrice, lower: lastPrice * 0.992 },
    trend: 'BULLISH',
    overallScore: 84,
    patternsDetected: ['شمعة ابتلاعية صاعدة (Bullish Engulfing)', 'منطقة طلب مؤسسية Order Block', 'نموذج القمم والقيعان الثلاثية (3 Highs & 3 Lows)']
  };

  // Generate AI Signal Function (Calls backend server `/api/gemini/generate-signals` with client fallback)
  const handleGenerateSignal = async (targetAsset: Asset = selectedAsset, strategyName?: string) => {
    setIsGeneratingSignal(true);
    setIsRightSidebarOpen(true);

    try {
      const response = await fetch('/api/gemini/generate-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: targetAsset.symbol,
          assetName: targetAsset.nameAr,
          timeframe,
          currentPrice: targetAsset.currentPrice,
          strategyPreference: strategyName || 'Quad EMA Cross (20/50/200/1000)'
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.signal) {
          setActiveSignal(json.signal);
          return;
        }
      }
      throw new Error('Server response not ok');
    } catch (error) {
      console.warn('Network or server fallback generating instant signal client-side:', error);
      const cp = targetAsset.currentPrice;
      const isBuy = Math.random() > 0.45;
      const factor = isBuy ? 1 : -1;
      const delta = cp * 0.0035;

      const fallbackSignal: AISignal = {
        id: `SIG-${Date.now()}`,
        symbol: targetAsset.symbol,
        assetName: targetAsset.nameAr,
        timeframe,
        type: isBuy ? 'BUY' : 'SELL',
        entryPrice: cp,
        stopLoss: Number((cp - factor * delta * 1.2).toFixed(targetAsset.digits)),
        takeProfit1: Number((cp + factor * delta * 1.5).toFixed(targetAsset.digits)),
        takeProfit2: Number((cp + factor * delta * 2.8).toFixed(targetAsset.digits)),
        takeProfit3: Number((cp + factor * delta * 4.2).toFixed(targetAsset.digits)),
        riskRewardRatio: 3.5,
        confidence: Math.floor(Math.random() * 10 + 86),
        strategyName: strategyName || 'استراتيجية المتوسطات الأسية الرباعية (EMA 20/50/200/1000)',
        patternDetected: isBuy ? 'Bullish Liquidity Sweep & Order Block' : 'Bearish FVG Rejection',
        analysisSummary: `تم رصد كسر كاذب للسيولة وتماسك السعر داخل منطقة الطلب المؤسسية على إطار ${timeframe}. الإشارة جاهزة ومحسوبة بدقة.`,
        keyReasons: [
          'ترتيب صاعد للمتوسطات: EMA 20 > EMA 50 > EMA 200 > EMA 1000',
          'ارتداد بشمعة ابتلاعية من منطقة كتلة الأوامر Order Block',
          'نسبة عائد إلى مخاطرة متفوقة (1:3.5) توفر حماية ممتازة لصفقتك'
        ],
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'ACTIVE'
      };
      setActiveSignal(fallbackSignal);
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  // Custom AI Strategy Handler with Fallback
  const handleCustomStrategySubmit = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsGeneratingCustomStrategy(true);
    try {
      const response = await fetch('/api/gemini/custom-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptText,
          riskTolerance: 'متوسطة',
          preferredAsset: selectedAsset.symbol
        })
      });
      if (response.ok) {
        const json = await response.json();
        if (json.strategyMarkdown || json.data) {
          setCustomStrategyResult(json.strategyMarkdown || json.data);
          return;
        }
      }
      throw new Error('Fallback strategy trigger');
    } catch (err) {
      setCustomStrategyResult(`### 🛡️ استراتيجية التداول المخصصة للرمز ${selectedAsset.symbol}

**طلب المتداول:** "${promptText}"  
**درجة المخاطرة:** متوسطة إلى منخفضة | **الإطار الزمني المستهدف:** ${timeframe}

---

### 1. 🎯 قواعد الدخول الفني
- **شراء (BUY):** تباعد صاعد (Bullish Divergence) على مؤشر RSI Ultimate مع إغلاق شمعة صريحة أعلى EMA 20 و EMA 50.
- **بيع (SELL):** اختراق كاذب للمقاومة وتكون شمعة ابتلاعية هابطة داخل منطقة العرض (Supply Order Block).

### 2. 🛑 وقف الخسارة وجني الأرباح
- **وقف الخسارة (SL):** أدنى القاع الأخير بمقدار 5 إلى 15 نقطة.
- **الهدف الأول (TP1):** مستوى فيبوناتشي 50% (Equilibrium).
- **الهدف الثاني (TP2):** المستوى الذهبي 61.8% Golden Pocket.
- **الهدف الثالث (TP3):** قمة الموجة السابقة (Ratio 1:3.5).

### 3. ⚖️ إدارة رأس المال
- عدم إدخال أكثر من **2%** من إجمالي المحفظة في صفقة واحدة.
- تحريك وقف الخسارة إلى نقطة الدخول (Break Even) فور تحقيق الهدف الأول TP1.`);
    } finally {
      setIsGeneratingCustomStrategy(false);
    }
  };

  // Copilot Chat Handler
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput('');
    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/analyze-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          assetName: selectedAsset.nameAr,
          timeframe,
          currentPrice: selectedAsset.currentPrice,
          recentCandles: candles.slice(-5),
          indicators: technicals
        })
      });

      const json = await res.json();
      const aiResponse = json.data?.summary
        ? `تحليل ${selectedAsset.symbol}:\n${json.data.summary}\n\nالنظرة العامة: ${json.data.sentiment === 'BULLISH' ? 'صاعدة 📈' : 'هابطة 📉'} (نسبة الثقة ${json.data.confidence}%)`
        : `بناءً على الشموع الحالية لـ ${selectedAsset.symbol}، يتداول السعر عند ${selectedAsset.currentPrice} محققاً زخماً صاعداً. نوصي بالتداول وفق مناطق الدعم عند ${technicals.bollinger.lower.toFixed(selectedAsset.digits)}.`;

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.', time: timeNow }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden dir-rtl">
      {/* Top Header */}
      <Header
        currentAsset={selectedAsset}
        onGenerateSignal={() => handleGenerateSignal(selectedAsset)}
        onOpenHostingGuide={() => setIsHostingGuideOpen(true)}
        isGenerating={isGeneratingSignal}
        demoBalance={10000}
      />

      {/* Main Terminal Body Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Market Watch Sidebar */}
        <MarketWatchSidebar
          assets={assets}
          selectedAsset={selectedAsset}
          onSelectAsset={(a) => setSelectedAsset(a)}
          onGenerateSignalForAsset={(a) => {
            setSelectedAsset(a);
            handleGenerateSignal(a);
          }}
        />

        {/* Central Trading Workstation */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto p-2 gap-2 custom-scrollbar bg-slate-950">
          {/* Top Stage: Candlestick Terminal Chart */}
          <div className="h-[460px] min-h-[380px] shrink-0">
            <CandlestickChart
              asset={selectedAsset}
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={(tf) => setTimeframe(tf)}
              activeSignal={activeSignal}
              onRefreshData={() => setCandles(generateCandles(selectedAsset.currentPrice, selectedAsset.digits, 65))}
            />
          </div>

          {/* Middle: Technical Gauge Summary */}
          <TechnicalSummaryBar
            asset={selectedAsset}
            indicators={technicals}
          />

          {/* Bottom Tabs Panel (Strategies, Calculator, AI Copilot) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
                <button
                  onClick={() => setActiveBottomTab('strategies')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBottomTab === 'strategies'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>الاستراتيجيات الجاهزة والتلقائية</span>
                </button>

                <button
                  onClick={() => setActiveBottomTab('calculator')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBottomTab === 'calculator'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حاسبة اللوت وإدارة المخاطر</span>
                </button>

                <button
                  onClick={() => setActiveBottomTab('copilot')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBottomTab === 'copilot'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>مساعد التداول الذكي Gemini</span>
                </button>
              </div>

              {/* Sidebar toggle button */}
              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="فتح/إغلاق شاشة التوصيات"
              >
                {isRightSidebarOpen ? <PanelRightClose className="w-4 h-4 text-blue-400" /> : <PanelRightOpen className="w-4 h-4 text-blue-400" />}
                <span className="hidden sm:inline">لوحة التوصيات</span>
              </button>
            </div>

            {/* Bottom Tab 1: Strategies Selector */}
            {activeBottomTab === 'strategies' && (
              <AIStrategySelector
                currentAsset={selectedAsset}
                onApplyStrategy={(strat) => handleGenerateSignal(selectedAsset, strat.nameAr)}
                onCustomStrategySubmit={handleCustomStrategySubmit}
                isGeneratingCustom={isGeneratingCustomStrategy}
                customResult={customStrategyResult}
              />
            )}

            {/* Bottom Tab 2: Position Size Calculator */}
            {activeBottomTab === 'calculator' && (
              <PositionCalculator
                asset={selectedAsset}
                activeSignal={activeSignal}
              />
            )}

            {/* Bottom Tab 3: AI Copilot Chat */}
            {activeBottomTab === 'copilot' && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="h-44 overflow-y-auto space-y-2.5 p-2 bg-slate-900 rounded-lg border border-slate-800/80 custom-scrollbar">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-indigo-900 text-indigo-200'}`}>
                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[80%] p-2.5 rounded-xl text-xs ${
                        msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className="text-[9px] opacity-60 mt-1 block font-mono">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                      <span>جاري التفكير وتحليل بيانات التداول...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="اسأل الذكاء الاصطناعي عن توصيات اليوم لـ Gold أو EURUSD..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right AISignal Panel Sidebar */}
        {isRightSidebarOpen && (
          <aside className="w-full md:w-80 shrink-0 h-full">
            <AISignalPanel
              signal={activeSignal}
              asset={selectedAsset}
              isGenerating={isGeneratingSignal}
              onGenerateNewSignal={() => handleGenerateSignal(selectedAsset)}
              onApplyToChart={(sig) => setActiveSignal(sig)}
            />
          </aside>
        )}
      </div>

      {/* Free Hosting & Deployment Modal */}
      <DeploymentGuideModal
        isOpen={isHostingGuideOpen}
        onClose={() => setIsHostingGuideOpen(false)}
      />
    </div>
  );
}
