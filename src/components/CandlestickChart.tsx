import React, { useState, useRef, useEffect } from 'react';
import { Candle, Asset, TimeFrame, ChartType, AISignal, DrawingTool, ChartDrawing } from '../types';
import { Eye, EyeOff, SlidersHorizontal, RefreshCw, Layers, TrendingUp, Sparkles, Activity, Trash2, Edit3, ShieldAlert } from 'lucide-react';

interface CandlestickChartProps {
  asset: Asset;
  candles: Candle[];
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  activeSignal: AISignal | null;
  onRefreshData: () => void;
}

// EMA Helper function
function calculateEMA(data: number[], period: number): (number | null)[] {
  if (data.length < period) return data.map(() => null);
  const k = 2 / (period + 1);
  const result: (number | null)[] = new Array(data.length).fill(null);
  
  // First value is simple SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  let prevVal = sum / period;
  result[period - 1] = prevVal;

  for (let i = period; i < data.length; i++) {
    const currentVal = data[i] * k + prevVal * (1 - k);
    result[i] = currentVal;
    prevVal = currentVal;
  }
  return result;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  asset,
  candles,
  timeframe,
  onTimeframeChange,
  activeSignal,
  onRefreshData
}) => {
  const [chartType, setChartType] = useState<ChartType>('candlestick');

  // Indicators toggles
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showEMA1000, setShowEMA1000] = useState(true);
  const [showRSIUltimate, setShowRSIUltimate] = useState(true);
  const [showOrderBlocks, setShowOrderBlocks] = useState(true);
  const [showFibonacci, setShowFibonacci] = useState(true);
  const [show3HighsLows, setShow3HighsLows] = useState(true);
  const [showSignalOverlay, setShowSignalOverlay] = useState(true);

  // Drawing tools state
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [drawingStart, setDrawingStart] = useState<{ price: number; x: number; y: number } | null>(null);

  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 440 });

  // Handle responsive resize with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({
          width: Math.max(300, width),
          height: Math.max(350, height || 440)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950 text-slate-400">
        جاري تحميل بيانات الشموع اليابانية...
      </div>
    );
  }

  // Calculate Price Range
  const prices = candles.flatMap(c => [c.high, c.low]);
  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);

  // Extend range if signal overlays exist
  if (activeSignal && showSignalOverlay && activeSignal.symbol === asset.symbol) {
    const sigPrices = [activeSignal.entryPrice, activeSignal.stopLoss, activeSignal.takeProfit1, activeSignal.takeProfit2, activeSignal.takeProfit3];
    minPrice = Math.min(minPrice, ...sigPrices);
    maxPrice = Math.max(maxPrice, ...sigPrices);
  }

  const pricePadding = (maxPrice - minPrice) * 0.08 || 1;
  minPrice -= pricePadding;
  maxPrice += pricePadding;

  const chartHeight = showRSIUltimate ? dimensions.height * 0.70 : dimensions.height - 40;
  const rsiHeight = showRSIUltimate ? dimensions.height * 0.24 : 0;
  const chartWidth = dimensions.width - 70; // 70px right Y-axis for prices

  const candleWidth = Math.max(4, (chartWidth / candles.length) - 2);

  // Helper to map price to Y SVG coordinate
  const priceToY = (price: number) => {
    return chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
  };

  const yToPrice = (y: number) => {
    return maxPrice - (y / chartHeight) * (maxPrice - minPrice);
  };

  // Helper to map index to X SVG coordinate
  const indexToX = (index: number) => {
    return (index / (candles.length - 1 || 1)) * (chartWidth - candleWidth) + candleWidth / 2;
  };

  // Calculate EMAs (20, 50, 200, 1000)
  const closePrices = candles.map(c => c.close);
  const ema20Raw = calculateEMA(closePrices, 20);
  const ema50Raw = calculateEMA(closePrices, 50);
  const ema200Raw = calculateEMA(closePrices, 200);
  const ema1000Raw = calculateEMA(closePrices, 30); // Adaptive scaling for chart preview size

  const ema20Points = ema20Raw.map((v, i) => v !== null ? { x: indexToX(i), y: priceToY(v) } : null).filter(Boolean) as { x: number; y: number }[];
  const ema50Points = ema50Raw.map((v, i) => v !== null ? { x: indexToX(i), y: priceToY(v) } : null).filter(Boolean) as { x: number; y: number }[];
  const ema200Points = ema200Raw.map((v, i) => v !== null ? { x: indexToX(i), y: priceToY(v) } : null).filter(Boolean) as { x: number; y: number }[];
  const ema1000Points = ema1000Raw.map((v, i) => v !== null ? { x: indexToX(i), y: priceToY(v) } : null).filter(Boolean) as { x: number; y: number }[];

  // Calculate RSI Ultimate & RSI Signal Line (MA of RSI)
  const rsiValues: number[] = [];
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);

    if (i >= 14) {
      const avgGain = gains / 14;
      const avgLoss = losses / 14;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    } else {
      rsiValues.push(50);
    }
  }

  // Calculate RSI Moving Average
  const rsiMaValues: number[] = [];
  const rsiPeriod = 9;
  for (let i = 0; i < rsiValues.length; i++) {
    if (i < rsiPeriod - 1) {
      rsiMaValues.push(rsiValues[i]);
    } else {
      const sum = rsiValues.slice(i - rsiPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      rsiMaValues.push(sum / rsiPeriod);
    }
  }

  const rsiToY = (rsiVal: number) => {
    const rsiTop = chartHeight + 32;
    return rsiTop + rsiHeight - (rsiVal / 100) * rsiHeight;
  };

  // Find swing highs and swing lows for 3 Highs & 3 Lows Pattern detection
  const swingHighs: { index: number; price: number; label: string }[] = [];
  const swingLows: { index: number; price: number; label: string }[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const isHigh = candles[i].high > candles[i - 1].high && candles[i].high > candles[i - 2].high &&
                   candles[i].high > candles[i + 1].high && candles[i].high > candles[i + 2].high;
    const isLow = candles[i].low < candles[i - 1].low && candles[i].low < candles[i - 2].low &&
                  candles[i].low < candles[i + 1].low && candles[i].low < candles[i + 2].low;

    if (isHigh) {
      const label = `H${swingHighs.length + 1}`;
      if (swingHighs.length < 3) swingHighs.push({ index: i, price: candles[i].high, label });
    }
    if (isLow) {
      const label = `L${swingLows.length + 1}`;
      if (swingLows.length < 3) swingLows.push({ index: i, price: candles[i].low, label });
    }
  }

  // Institutional Order Blocks calculation (Highest/Lowest zones)
  const highestCandle = candles.reduce((prev, curr) => curr.high > prev.high ? curr : prev, candles[0]);
  const lowestCandle = candles.reduce((prev, curr) => curr.low < prev.low ? curr : prev, candles[0]);

  const supplyOrderBlock = {
    top: highestCandle.high,
    bottom: highestCandle.open > highestCandle.close ? highestCandle.open : highestCandle.high * 0.998,
    label: 'Supply Order Block (منطقة عرض مؤسسية)'
  };
  const demandOrderBlock = {
    bottom: lowestCandle.low,
    top: lowestCandle.open < lowestCandle.close ? lowestCandle.open : lowestCandle.low * 1.002,
    label: 'Demand Order Block (منطقة طلب مؤسسية)'
  };

  // Auto Fibonacci levels calculation between min and max price
  const fibHigh = maxPrice - pricePadding;
  const fibLow = minPrice + pricePadding;
  const fibDiff = fibHigh - fibLow;

  const fibLevels = [
    { level: 0, price: fibHigh, label: '0.0%', color: '#94a3b8' },
    { level: 0.236, price: fibHigh - fibDiff * 0.236, label: '23.6%', color: '#38bdf8' },
    { level: 0.382, price: fibHigh - fibDiff * 0.382, label: '38.2%', color: '#818cf8' },
    { level: 0.5, price: fibHigh - fibDiff * 0.5, label: '50.0% (Equilibrium)', color: '#f59e0b' },
    { level: 0.618, price: fibHigh - fibDiff * 0.618, label: '61.8% (Golden Pocket)', color: '#10b981' },
    { level: 0.786, price: fibHigh - fibDiff * 0.786, label: '78.6%', color: '#ec4899' },
    { level: 1.0, price: fibLow, label: '100.0%', color: '#94a3b8' }
  ];

  // Canvas click to add drawings
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'none') return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const price = yToPrice(y);

    if (!drawingStart) {
      if (activeTool === 'horizontal_line') {
        const newDrawing: ChartDrawing = {
          id: `draw-${Date.now()}`,
          type: 'horizontal_line',
          price1: price,
          label: `خط دعم/مقاومة (${price.toFixed(asset.digits)})`,
          color: '#38bdf8'
        };
        setDrawings(prev => [...prev, newDrawing]);
        setActiveTool('none');
      } else {
        setDrawingStart({ price, x, y });
      }
    } else {
      const newDrawing: ChartDrawing = {
        id: `draw-${Date.now()}`,
        type: activeTool,
        price1: drawingStart.price,
        price2: price,
        color: activeTool === 'order_block' ? '#10b981' : '#f59e0b'
      };
      setDrawings(prev => [...prev, newDrawing]);
      setDrawingStart(null);
      setActiveTool('none');
    }
  };

  const currentCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div id="chart-terminal-container" className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Top Chart Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframes */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          {(['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* EMA Toggles Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-bold ml-1">المتوسطات EMA:</span>
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer transition-colors ${
              showEMA20 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            EMA 20
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer transition-colors ${
              showEMA50 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            EMA 50
          </button>
          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer transition-colors ${
              showEMA200 ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            EMA 200
          </button>
          <button
            onClick={() => setShowEMA1000(!showEMA1000)}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer transition-colors ${
              showEMA1000 ? 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            EMA 1000
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowRSIUltimate(!showRSIUltimate)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              showRSIUltimate ? 'border-purple-500/60 bg-purple-500/10 text-purple-300' : 'border-slate-800 text-slate-500'
            }`}
          >
            <Activity className="w-3 h-3 text-purple-400" />
            <span>RSI Ultimate</span>
          </button>

          <button
            onClick={() => setShowFibonacci(!showFibonacci)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              showFibonacci ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 text-slate-500'
            }`}
          >
            <span>فيبوناتشي 61.8%</span>
          </button>

          <button
            onClick={() => setShowOrderBlocks(!showOrderBlocks)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              showOrderBlocks ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-slate-800 text-slate-500'
            }`}
          >
            <span>كتل الأوامر OrderBlocks</span>
          </button>

          <button
            onClick={() => setShow3HighsLows(!show3HighsLows)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              show3HighsLows ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300' : 'border-slate-800 text-slate-500'
            }`}
          >
            <span>3 قمم وقيعان</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawing Tools Sub-bar */}
      <div className="bg-slate-950 px-3 py-1 flex items-center justify-between border-b border-slate-900 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            أدوات الرسم والتحديد:
          </span>

          <button
            onClick={() => setActiveTool(activeTool === 'horizontal_line' ? 'none' : 'horizontal_line')}
            className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
              activeTool === 'horizontal_line' ? 'bg-blue-600 text-white border-blue-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            ➖ خط أفقي (دعم/مقاومة)
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'trendline' ? 'none' : 'trendline')}
            className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
              activeTool === 'trendline' ? 'bg-blue-600 text-white border-blue-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            📈 خط اتجاه (Trendline)
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'order_block' ? 'none' : 'order_block')}
            className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
              activeTool === 'order_block' ? 'bg-blue-600 text-white border-blue-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            🧱 صندوق كتلة الأوامر
          </button>

          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="px-2 py-0.5 rounded text-[11px] bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>مسح الرسم</span>
            </button>
          )}
        </div>

        {/* OHLC summary header */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">سعر: <strong className="text-white">{currentCandle.close.toFixed(asset.digits)}</strong></span>
          <span className="text-emerald-400">أعلى: {currentCandle.high.toFixed(asset.digits)}</span>
          <span className="text-rose-400">أدنى: {currentCandle.low.toFixed(asset.digits)}</span>
        </div>
      </div>

      {/* Main SVG Interactive Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-slate-950 cursor-crosshair overflow-hidden"
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMousePos({ x, y });

          const idx = Math.min(candles.length - 1, Math.max(0, Math.floor((x / chartWidth) * candles.length)));
          setHoveredCandle(candles[idx]);
        }}
        onMouseLeave={() => {
          setMousePos(null);
          setHoveredCandle(null);
        }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
          onClick={handleCanvasClick}
        >
          {/* Grid lines */}
          <g className="opacity-20">
            {Array.from({ length: 6 }).map((_, i) => {
              const y = (chartHeight / 5) * i;
              const pVal = maxPrice - ((maxPrice - minPrice) / 5) * i;
              return (
                <g key={`grid-y-${i}`}>
                  <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#334155" strokeDasharray="3 3" />
                  <text x={chartWidth + 6} y={y + 4} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    {pVal.toFixed(asset.digits)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Fibonacci Retracement Bands */}
          {showFibonacci && (
            <g id="fibonacci-bands">
              {fibLevels.map((fib, idx) => {
                const y = priceToY(fib.price);
                const isGolden = fib.level === 0.618;
                return (
                  <g key={`fib-${idx}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke={fib.color}
                      strokeWidth={isGolden ? 2 : 1}
                      strokeDasharray={isGolden ? 'none' : '4 2'}
                      opacity={0.85}
                    />
                    <text
                      x={10}
                      y={y - 3}
                      fill={fib.color}
                      fontSize="10"
                      fontWeight={isGolden ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      FIB {fib.label} - {fib.price.toFixed(asset.digits)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Institutional Order Blocks (Supply & Demand Boxes) */}
          {showOrderBlocks && (
            <g id="order-blocks">
              {/* Supply Order Block (Sell Zone) */}
              <rect
                x={0}
                y={priceToY(supplyOrderBlock.top)}
                width={chartWidth}
                height={Math.max(12, priceToY(supplyOrderBlock.bottom) - priceToY(supplyOrderBlock.top))}
                fill="#ef4444"
                fillOpacity={0.12}
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <text x={chartWidth - 220} y={priceToY(supplyOrderBlock.top) + 12} fill="#fca5a5" fontSize="10" fontWeight="bold">
                {supplyOrderBlock.label}
              </text>

              {/* Demand Order Block (Buy Zone) */}
              <rect
                x={0}
                y={priceToY(demandOrderBlock.top)}
                width={chartWidth}
                height={Math.max(12, priceToY(demandOrderBlock.bottom) - priceToY(demandOrderBlock.top))}
                fill="#10b981"
                fillOpacity={0.12}
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <text x={chartWidth - 220} y={priceToY(demandOrderBlock.bottom) - 4} fill="#6ee7b7" fontSize="10" fontWeight="bold">
                {demandOrderBlock.label}
              </text>
            </g>
          )}

          {/* Candlesticks Render */}
          {chartType === 'candlestick' && (
            <g>
              {candles.map((candle, idx) => {
                const x = indexToX(idx);
                const openY = priceToY(candle.open);
                const closeY = priceToY(candle.close);
                const highY = priceToY(candle.high);
                const lowY = priceToY(candle.low);
                const isBullish = candle.close >= candle.open;

                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));
                const color = isBullish ? '#10b981' : '#f43f5e';

                return (
                  <g key={`candle-${idx}`}>
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx={1}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Line or Area Chart */}
          {(chartType === 'line' || chartType === 'area') && (
            <g>
              {chartType === 'area' && (
                <polygon
                  points={`0,${chartHeight} ${candles.map((c, i) => `${indexToX(i)},${priceToY(c.close)}`).join(' ')} ${chartWidth},${chartHeight}`}
                  fill="url(#area-gradient)"
                  opacity={0.4}
                />
              )}
              <polyline
                points={candles.map((c, i) => `${indexToX(i)},${priceToY(c.close)}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </g>
          )}

          {/* EMA Lines (20, 50, 200, 1000) */}
          {showEMA20 && ema20Points.length > 1 && (
            <polyline
              points={ema20Points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
            />
          )}

          {showEMA50 && ema50Points.length > 1 && (
            <polyline
              points={ema50Points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
            />
          )}

          {showEMA200 && ema200Points.length > 1 && (
            <polyline
              points={ema200Points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.2"
            />
          )}

          {showEMA1000 && ema1000Points.length > 1 && (
            <polyline
              points={ema1000Points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeDasharray="6 2"
            />
          )}

          {/* 3 Highs & 3 Lows Pattern Overlay Markers */}
          {show3HighsLows && (
            <g id="pattern-3highs-3lows">
              {swingHighs.map((sh, idx) => {
                const x = indexToX(sh.index);
                const y = priceToY(sh.price) - 14;
                return (
                  <g key={`sh-${idx}`}>
                    <circle cx={x} cy={y} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x} y={y + 3} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {sh.label}
                    </text>
                  </g>
                );
              })}

              {swingLows.map((sl, idx) => {
                const x = indexToX(sl.index);
                const y = priceToY(sl.price) + 18;
                return (
                  <g key={`sl-${idx}`}>
                    <circle cx={x} cy={y} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x} y={y + 3} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {sl.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Custom User Drawings */}
          {drawings.map((draw) => {
            if (draw.type === 'horizontal_line') {
              const y = priceToY(draw.price1);
              return (
                <g key={draw.id}>
                  <line x1={0} y1={y} x2={chartWidth} y2={y} stroke={draw.color || '#38bdf8'} strokeWidth="2" strokeDasharray="5 3" />
                  <text x={10} y={y - 4} fill={draw.color || '#38bdf8'} fontSize="10" fontWeight="bold">
                    {draw.label}
                  </text>
                </g>
              );
            }
            if (draw.type === 'trendline' && draw.price2) {
              return (
                <line
                  key={draw.id}
                  x1={20}
                  y1={priceToY(draw.price1)}
                  x2={chartWidth - 20}
                  y2={priceToY(draw.price2)}
                  stroke={draw.color || '#f59e0b'}
                  strokeWidth="2.5"
                />
              );
            }
            if (draw.type === 'order_block' && draw.price2) {
              const topY = priceToY(Math.max(draw.price1, draw.price2));
              const botY = priceToY(Math.min(draw.price1, draw.price2));
              return (
                <rect
                  key={draw.id}
                  x={10}
                  y={topY}
                  width={chartWidth - 20}
                  height={Math.max(10, botY - topY)}
                  fill="#10b981"
                  fillOpacity={0.2}
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
              );
            }
            return null;
          })}

          {/* Active Signal Overlay Lines (SL / TP1 / TP2 / TP3) */}
          {activeSignal && showSignalOverlay && activeSignal.symbol === asset.symbol && (
            <g id="signal-overlay-lines">
              {/* Entry */}
              <g>
                <line x1={0} y1={priceToY(activeSignal.entryPrice)} x2={chartWidth} y2={priceToY(activeSignal.entryPrice)} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3" />
                <rect x={chartWidth + 2} y={priceToY(activeSignal.entryPrice) - 10} width="65" height="18" fill="#3b82f6" rx="3" />
                <text x={chartWidth + 6} y={priceToY(activeSignal.entryPrice) + 3} fill="#ffffff" fontSize="10" fontWeight="bold">ENTRY</text>
              </g>
              {/* Stop Loss */}
              <g>
                <line x1={0} y1={priceToY(activeSignal.stopLoss)} x2={chartWidth} y2={priceToY(activeSignal.stopLoss)} stroke="#ef4444" strokeWidth="2.5" />
                <rect x={chartWidth + 2} y={priceToY(activeSignal.stopLoss) - 10} width="65" height="18" fill="#ef4444" rx="3" />
                <text x={chartWidth + 6} y={priceToY(activeSignal.stopLoss) + 3} fill="#ffffff" fontSize="10" fontWeight="bold">SL: {activeSignal.stopLoss.toFixed(asset.digits)}</text>
              </g>
              {/* TP1 */}
              <g>
                <line x1={0} y1={priceToY(activeSignal.takeProfit1)} x2={chartWidth} y2={priceToY(activeSignal.takeProfit1)} stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                <rect x={chartWidth + 2} y={priceToY(activeSignal.takeProfit1) - 10} width="65" height="18" fill="#10b981" rx="3" />
                <text x={chartWidth + 6} y={priceToY(activeSignal.takeProfit1) + 3} fill="#ffffff" fontSize="10" fontWeight="bold">TP1: {activeSignal.takeProfit1.toFixed(asset.digits)}</text>
              </g>
            </g>
          )}

          {/* RSI Ultimate Sub-chart */}
          {showRSIUltimate && (
            <g id="rsi-ultimate-subchart">
              <line x1={0} y1={chartHeight + 28} x2={dimensions.width} y2={chartHeight + 28} stroke="#334155" />

              {/* Overbought 70 Box */}
              <rect x={0} y={rsiToY(100)} width={chartWidth} height={rsiToY(70) - rsiToY(100)} fill="#ef4444" fillOpacity={0.08} />
              <line x1={0} y1={rsiToY(70)} x2={chartWidth} y2={rsiToY(70)} stroke="#ef4444" strokeDasharray="3 3" opacity={0.7} />
              <text x={chartWidth + 6} y={rsiToY(70) + 3} fill="#ef4444" fontSize="9" fontWeight="bold">70 OB</text>

              {/* Oversold 30 Box */}
              <rect x={0} y={rsiToY(30)} width={chartWidth} height={rsiToY(0) - rsiToY(30)} fill="#10b981" fillOpacity={0.08} />
              <line x1={0} y1={rsiToY(30)} x2={chartWidth} y2={rsiToY(30)} stroke="#10b981" strokeDasharray="3 3" opacity={0.7} />
              <text x={chartWidth + 6} y={rsiToY(30) + 3} fill="#10b981" fontSize="9" fontWeight="bold">30 OS</text>

              {/* RSI Main Line */}
              {rsiValues.length > 1 && (
                <polyline
                  points={rsiValues.map((v, i) => `${indexToX(i + 1)},${rsiToY(v)}`).join(' ')}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
              )}

              {/* RSI Moving Average (Signal Line) */}
              {rsiMaValues.length > 1 && (
                <polyline
                  points={rsiMaValues.map((v, i) => `${indexToX(i + 1)},${rsiToY(v)}`).join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
            </g>
          )}

          {/* Crosshair Cursor */}
          {mousePos && mousePos.x <= chartWidth && (
            <g id="crosshair">
              <line x1={mousePos.x} y1={0} x2={mousePos.x} y2={dimensions.height} stroke="#94a3b8" strokeDasharray="2 2" opacity={0.6} />
              <line x1={0} y1={mousePos.y} x2={chartWidth} y2={mousePos.y} stroke="#94a3b8" strokeDasharray="2 2" opacity={0.6} />
              {mousePos.y <= chartHeight && (
                <g>
                  <rect x={chartWidth} y={mousePos.y - 10} width={68} height={20} fill="#3b82f6" rx="2" />
                  <text x={chartWidth + 4} y={mousePos.y + 3} fill="#ffffff" fontSize="10" fontWeight="bold">
                    {yToPrice(mousePos.y).toFixed(asset.digits)}
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
