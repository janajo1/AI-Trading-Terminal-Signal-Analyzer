export type MarketCategory = 'forex' | 'crypto' | 'commodities' | 'indices' | 'stocks';

export type TimeFrame = 'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1';

export type ChartType = 'candlestick' | 'heikin_ashi' | 'line' | 'area';

export type DrawingTool = 'none' | 'fibonacci' | 'trendline' | 'horizontal_line' | 'order_block' | 'three_peaks';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  symbol: string;
  name: string;
  nameAr: string;
  category: MarketCategory;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  spread: number;
  digits: number;
  icon: string;
}

export interface TechnicalIndicators {
  rsi: number;
  rsiMa: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  ema200: number;
  ema1000: number;
  sma50: number;
  sma200: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  overallScore: number; // 0 (Strong Sell) to 100 (Strong Buy)
  patternsDetected: string[];
}

export interface ChartDrawing {
  id: string;
  type: DrawingTool;
  price1: number;
  price2?: number;
  index1?: number;
  index2?: number;
  label?: string;
  color?: string;
}

export interface AISignal {
  id: string;
  symbol: string;
  assetName: string;
  timeframe: TimeFrame;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  confidence: number; // e.g. 89%
  strategyName: string;
  patternDetected: string;
  analysisSummary: string;
  keyReasons: string[];
  timestamp: string;
  status: 'ACTIVE' | 'TARGET_HIT' | 'STOP_HIT' | 'EXPIRED';
  lotSizeRecommendation?: number;

  // Capital & Price tailored recommendation fields
  userCapital?: number;
  riskPercent?: number;
  calculatedLotSize?: number;
  maxRiskDollar?: number;
  expectedProfitTp1Dollar?: number;
  expectedProfitTp2Dollar?: number;
  expectedProfitTp3Dollar?: number;
  capitalAdvice?: string;
}

export interface AIStrategyPreset {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  winRate: number;
  timeframes: TimeFrame[];
  description: string;
  descriptionAr: string;
  rules: string[];
  bestAssets: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  icon: string;
}

export interface TradeCalculation {
  accountBalance: number;
  riskPercentage: number;
  riskAmount: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  lotSize: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
}

export interface Position {
  id: string;
  symbol: string;
  assetName: string;
  type: 'BUY' | 'SELL';
  lotSize: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
  pnl: number;
  pnlPercent: number;
  signalId?: string;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  assetName: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP';
  targetPrice: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  createdTime: string;
  signalId?: string;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  assetName: string;
  type: 'BUY' | 'SELL';
  lotSize: number;
  entryPrice: number;
  closePrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
  closeTime: string;
  pnl: number;
  closeReason: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS';
}

