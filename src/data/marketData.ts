import { Asset, AIStrategyPreset, Candle, TimeFrame } from '../types';

export const INITIAL_ASSETS: Asset[] = [
  // Forex
  { symbol: 'EURUSD', name: 'Euro / US Dollar', nameAr: 'اليورو / الدولار الأمريكي', category: 'forex', currentPrice: 1.08542, change24h: 0.35, high24h: 1.08820, low24h: 1.08210, spread: 0.8, digits: 5, icon: '💶' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', nameAr: 'الجنيه الإسترليني / الدولار', category: 'forex', currentPrice: 1.29415, change24h: -0.18, high24h: 1.29850, low24h: 1.29110, spread: 1.1, digits: 5, icon: '💷' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', nameAr: 'الدولار / الين الياباني', category: 'forex', currentPrice: 154.230, change24h: 0.62, high24h: 154.800, low24h: 153.600, spread: 0.9, digits: 3, icon: '💴' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', nameAr: 'الدولار الأسترالي / الدولار', category: 'forex', currentPrice: 0.65820, change24h: -0.42, high24h: 0.66150, low24h: 0.65600, spread: 1.0, digits: 5, icon: '🇦🇺' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', nameAr: 'الذهب / الدولار الأمريكي', category: 'commodities', currentPrice: 2435.60, change24h: 1.24, high24h: 2448.90, low24h: 2418.20, spread: 2.2, digits: 2, icon: '🥇' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', nameAr: 'الفضة / الدولار الأمريكي', category: 'commodities', currentPrice: 28.450, change24h: 0.88, high24h: 28.900, low24h: 28.100, spread: 1.8, digits: 3, icon: '🥈' },
  { symbol: 'USOIL', name: 'WTI Crude Oil', nameAr: 'نفط برنت الخام', category: 'commodities', currentPrice: 77.85, change24h: -1.15, high24h: 79.20, low24h: 77.10, spread: 3.0, digits: 2, icon: '🛢️' },

  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', nameAr: 'البيتكوين / الدولار', category: 'crypto', currentPrice: 64850.00, change24h: 3.45, high24h: 66200.00, low24h: 62400.00, spread: 12.0, digits: 2, icon: '₿' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', nameAr: 'الإيثيريوم / الدولار', category: 'crypto', currentPrice: 3420.50, change24h: 2.10, high24h: 3490.00, low24h: 3310.00, spread: 4.5, digits: 2, icon: '🔹' },
  { symbol: 'SOLUSD', name: 'Solana / US Dollar', nameAr: 'سولانا / الدولار', category: 'crypto', currentPrice: 178.40, change24h: 5.60, high24h: 184.20, low24h: 168.00, spread: 0.5, digits: 2, icon: '☀️' },

  // Indices
  { symbol: 'US30', name: 'Dow Jones Industrial 30', nameAr: 'مؤشر داو جونز 30', category: 'indices', currentPrice: 40580.00, change24h: 0.45, high24h: 40720.00, low24h: 40310.00, spread: 2.0, digits: 1, icon: '📈' },
  { symbol: 'NAS100', name: 'Nasdaq 100 Index', nameAr: 'مؤشر ناسداك 100', category: 'indices', currentPrice: 19850.25, change24h: 1.12, high24h: 20010.00, low24h: 19620.00, spread: 1.5, digits: 2, icon: '💻' },
  { symbol: 'GER40', name: 'DAX 40 Germany', nameAr: 'مؤشر داكس الألماني 40', category: 'indices', currentPrice: 18320.50, change24h: -0.25, high24h: 18450.00, low24h: 18210.00, spread: 1.8, digits: 2, icon: '🇩🇪' },

  // Stocks
  { symbol: 'NVDA', name: 'NVIDIA Corporation', nameAr: 'أسهم إنفيديا', category: 'stocks', currentPrice: 124.50, change24h: 4.25, high24h: 126.80, low24h: 119.30, spread: 0.05, digits: 2, icon: '🟢' },
  { symbol: 'AAPL', name: 'Apple Inc.', nameAr: 'أسهم أبل', category: 'stocks', currentPrice: 222.80, change24h: 0.75, high24h: 224.50, low24h: 220.10, spread: 0.04, digits: 2, icon: '🍎' },
  { symbol: 'TSLA', name: 'Tesla Inc.', nameAr: 'أسهم تسلا', category: 'stocks', currentPrice: 218.60, change24h: -2.30, high24h: 225.00, low24h: 214.20, spread: 0.08, digits: 2, icon: '⚡' }
];

export const AI_STRATEGIES: AIStrategyPreset[] = [
  {
    id: 'quad_ema_cross',
    name: 'Quad EMA Trend Master (EMA 20, 50, 200, 1000)',
    nameAr: 'استراتيجية المتوسطات الأسية الرباعية (EMA 20 / 50 / 200 / 1000)',
    category: 'Trend Following',
    winRate: 88.2,
    timeframes: ['M5', 'M15', 'H1', 'H4'],
    description: 'Ultimate trend-following system using EMA 20/50 for momentum, EMA 200 for dynamic trend direction, and EMA 1000 for macro institutional baseline.',
    descriptionAr: 'نظام تتبع الاتجاه الفائق باستعمال EMA 20/50 للزخم، EMA 200 لاتجاه الدعم والمقاومة، و EMA 1000 كخط أساس مؤسسي للاتجاه الكلي.',
    rules: [
      'التأكد من ترتيب المتوسطات: EMA 20 > EMA 50 > EMA 200 > EMA 1000 في حالة الشراء (Buy Trend)',
      'انتظار ارتداد (Pullback) السعر لإعادة اختبار EMA 20 أو EMA 50',
      'الدخول مع شمعة تأكيدية صاعدة بنسبة مخاطرة إلى عائد 1:2.5',
      'إغلاق الصفقة فور تقاطع EMA 20 أسفل EMA 50'
    ],
    bestAssets: ['XAUUSD', 'EURUSD', 'NAS100', 'BTCUSD', 'US30'],
    riskLevel: 'Low',
    icon: '📈'
  },
  {
    id: 'smc_ict',
    name: 'Smart Money Concepts (SMC / ICT)',
    nameAr: 'استراتيجية صُنّاع السوق والسيولة المؤسسية (SMC & ICT)',
    category: 'Institutional Trading',
    winRate: 85.5,
    timeframes: ['M15', 'H1', 'H4'],
    description: 'Identifies Liquidity Sweeps, Order Blocks, and Fair Value Gaps (FVG) used by institutional smart money.',
    descriptionAr: 'تحدد سحوبات السيولة (Liquidity Sweeps)، كتل الأوامر (Order Blocks)، والفجوات السعرية العادلة (FVG) للتداول مع البنوك والمؤسسات.',
    rules: [
      'تحديد كسر الهيكل السعري (BOS) أو تغير الاتجاه الهيكلي (CHoCH)',
      'انتظار ارتداد السعر إلى منطقة الطلب أو العرض غير المغطاة (Order Block / FVG)',
      'تحديد الدخول مع رفض شمعة ابتلاعية وتحديد وقف الخسارة أسفل/أعلى كتلة الأوامر',
      'الهدف جني أرباح بنسبة مخاطرة لا تقل عن 1:3'
    ],
    bestAssets: ['XAUUSD', 'EURUSD', 'NAS100', 'BTCUSD'],
    riskLevel: 'Medium',
    icon: '🏛️'
  },
  {
    id: 'three_peaks_valleys',
    name: '3 Highs & 3 Lows Pattern Master',
    nameAr: 'استراتيجية نموذج القمم والقيعان الثلاثية المتتالية (3 Highs & 3 Lows)',
    category: 'Market Structure',
    winRate: 83.4,
    timeframes: ['M15', 'H1', 'D1'],
    description: 'Structure strategy capturing the 3rd swing high/low completion before major wave extensions or reversals.',
    descriptionAr: 'تعتمد على رصد تشكل 3 قمم صاعدة متتالية (HH) أو 3 قيعان هابطة (LL) لاقتناص بداية الموجة الثالثة القوية أو الانعكاس.',
    rules: [
      'تتبع تشكل القمة الأولى ثم الثانية والثالثة أعلى من سابقتها (Higher Highs)',
      'انتظار كسر خط الاتجاه الواصل بين القاعين الأول والثاني (TL Breakout)',
      'الدخول بيع هجومي بعد القمة الثالثة H3 مباشرة مع وقف أعلى H3',
      'استهداف القاع الأول L1 كهدف رئيسي'
    ],
    bestAssets: ['GBPUSD', 'XAUUSD', 'US30', 'TSLA'],
    riskLevel: 'Medium',
    icon: '📊'
  },
  {
    id: 'rsi_ultimate_div',
    name: 'RSI Ultimate Divergence & Exhaustion',
    nameAr: 'استراتيجية RSI Ultimate والانحراف السعري',
    category: 'Momentum Reversal',
    winRate: 82.0,
    timeframes: ['M5', 'M15', 'H1'],
    description: 'Combines RSI 14, RSI Moving Average signal line, and Bullish/Bearish Divergences at key liquidity levels.',
    descriptionAr: 'دمج مؤشر القوة النسبية المتقدم مع متوسطه المتحرك ورصد الدايفرجنس الإيجابي والسلبي عند قمم وقيعان التداول.',
    rules: [
      'رصد تباين (Divergence) بين اتجاه حركة السعر ومؤشر RSI Ultimate',
      'تقاطع خط RSI (14) مع خط المتوسط الخاص به RSI MA في منطقة التشبع (<30 أو >70)',
      'الدخول مع أول شمعة إغلاق صريحة باتجاه الانحراف',
      'وقف الخسارة خلف آخر قاع/قمة متشكّلة'
    ],
    bestAssets: ['EURUSD', 'SOLUSD', 'NVDA', 'XAUUSD', 'ETHUSD'],
    riskLevel: 'Medium',
    icon: '🎯'
  },
  {
    id: 'fibonacci_golden_pocket',
    name: 'Fibonacci 61.8% Golden Pocket Reversal',
    nameAr: 'استراتيجية فيبوناتشي الجيب الذهبي 61.8% - 78.6%',
    category: 'Price Action & Fib',
    winRate: 84.0,
    timeframes: ['M15', 'H1', 'H4'],
    description: 'Precision entry strategy built around the institutional 61.8% & 78.6% Golden Pocket Fib retracement levels.',
    descriptionAr: 'استراتيجية صيد الارتدادات الدقيقة من المستوى الذهبي لفيبوناتشي (61.8% و 78.6%) بعد موجات الاندفاع السعرية.',
    rules: [
      'رسم شبكة فيبوناتشي من بداية الموجة الاندفاعية إلى قمتها',
      'مراقبة تباطؤ السعر عند ملامسة النطاق الذهبي 61.8% - 78.6%',
      'تأكيد الدخول بشمعة المطرقة (Hammer) أو الشمعة الابتلاعية',
      'هدف جني الأرباح عند مستوى فيبوناتشي 0% ثم الامتداد 127.2%'
    ],
    bestAssets: ['XAUUSD', 'GBPUSD', 'NAS100', 'USOIL'],
    riskLevel: 'Low',
    icon: '📐'
  },
  {
    id: 'gold_volatility',
    name: 'Gold Volatility Supply & Demand',
    nameAr: 'استراتيجية الذهب الهجومية (العرض والطلب وساعات السيولة)',
    category: 'Commodities Scalp',
    winRate: 87.5,
    timeframes: ['M15', 'H1'],
    description: 'Custom optimized strategy for XAUUSD (Gold) exploiting London/NY session open volatility spikes.',
    descriptionAr: 'استراتيجية مخصصة للذهب لاستغلال تقلبات افتتاحات جلسات لندن ونيويورك واختراق مناطق العرض والطلب.',
    rules: [
      'تحديد نطاق أسعار جلسة آسيا (Asian Session High/Low)',
      'انتظار كسر وهمي (Fakeout) لسيولة آسيا في بداية جلسة لندن',
      'الدخول المعاكس السريع عند العودة داخل النطاق مع استهداف قمة/قاع الجلسة',
      'جني أرباح مقسم على 3 أهداف (TP1, TP2, TP3)'
    ],
    bestAssets: ['XAUUSD', 'USOIL', 'XAGUSD'],
    riskLevel: 'Medium',
    icon: '👑'
  }
];

// Helper to generate realistic interactive candle series for any timeframe
export function generateCandles(basePrice: number, digits: number, count: number = 60): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const intervalMs = 15 * 60 * 1000; // 15m default
  
  let currentClose = basePrice;
  const volatility = basePrice * 0.0025; // 0.25% step volatility

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * intervalMs);
    const timestamp = time.getTime();
    
    const change = (Math.random() - 0.49) * volatility;
    const open = currentClose;
    currentClose = Number((open + change).toFixed(digits));
    
    const highVol = Math.random() * volatility * 0.8;
    const lowVol = Math.random() * volatility * 0.8;
    
    const high = Number((Math.max(open, currentClose) + highVol).toFixed(digits));
    const low = Number((Math.min(open, currentClose) - lowVol).toFixed(digits));
    const volume = Math.floor(Math.random() * 4000 + 1200);

    const timeStr = time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    candles.push({
      time: timeStr,
      timestamp,
      open,
      high,
      low,
      close: currentClose,
      volume
    });
  }

  return candles;
}
