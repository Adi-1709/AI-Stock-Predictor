import bcrypt from 'bcryptjs';

const initialPasswordHash = await bcrypt.hash('password123', 10);

export const sandboxUsers = [
  {
    _id: '1',
    name: 'Alex Mercer',
    email: 'alex@alpha.ai',
    password: initialPasswordHash,
    plan: 'Pro Elite',
    avatar: 'AM',
    bio: 'Fintech Analyst & Quantitative Developer.',
    company: 'Alpha AI Capital',
    phone: '+1 (555) 019-2834',
    location: 'New York, NY',
    createdAt: new Date('2026-01-15T09:00:00Z'),
  }
];

export const sandboxPredictions = [
  // AAPL (3 Wins / 1 Loss = 75%)
  {
    _id: 'p1',
    symbol: 'AAPL',
    prediction: 'BUY',
    confidence: 87,
    actual: 185.20,
    status: 'Complied',
    targetPrice: 198.50,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Strong Buy',
    strength: 'High',
    reasoning: 'Strong iPhone sales forecasts in Asia coupled with aggressive AI chip design expansion plans.',
    technicals: {
      rsi: { value: 68, status: 'Bullish', progress: 68, color: 'text-neon-emerald' },
      macd: { value: 1.45, status: 'Positive Crossover', progress: 85, color: 'text-neon-emerald' }
    },
    sentiment: { positive: 78, negative: 12, neutral: 10, explanation: 'Consensus upgrades from Tier-1 institutions.' },
    date: '2026-06-05 15:30:12',
    createdAt: new Date('2026-06-05T15:30:12Z')
  },
  {
    _id: 'p1_2',
    symbol: 'AAPL',
    prediction: 'BUY',
    confidence: 72,
    actual: 181.10,
    status: 'Complied',
    targetPrice: 190.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Buy',
    strength: 'Moderate',
    reasoning: 'Accumulation signs at 50 MA.',
    technicals: { rsi: { value: 55, status: 'Neutral', progress: 55, color: 'text-amber-450' } },
    sentiment: { positive: 60, negative: 20, neutral: 20, explanation: 'Positive updates.' },
    date: '2026-06-04 11:20:00',
    createdAt: new Date('2026-06-04T11:20:00Z')
  },
  {
    _id: 'p1_3',
    symbol: 'AAPL',
    prediction: 'BUY',
    confidence: 81,
    actual: 175.40,
    status: 'Refuted',
    targetPrice: 192.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Strong Buy',
    strength: 'High',
    reasoning: 'Macro headwinds triggered short-term volatility breakout.',
    technicals: { rsi: { value: 62, status: 'Bullish', progress: 62, color: 'text-neon-emerald' } },
    sentiment: { positive: 70, negative: 15, neutral: 15, explanation: 'Favorable upgrades.' },
    date: '2026-06-02 09:30:00',
    createdAt: new Date('2026-06-02T09:30:00Z')
  },
  {
    _id: 'p1_4',
    symbol: 'AAPL',
    prediction: 'SELL',
    confidence: 65,
    actual: 178.50,
    status: 'Complied',
    targetPrice: 170.00,
    forecastDays: 7,
    direction: 'bearish',
    recommendation: 'Sell',
    strength: 'Moderate',
    reasoning: 'Short term correction compiled with technical moving average crossovers.',
    technicals: { rsi: { value: 38, status: 'Bearish', progress: 38, color: 'text-neon-rose' } },
    sentiment: { positive: 25, negative: 60, neutral: 15, explanation: 'Bearish consensus.' },
    date: '2026-05-30 14:00:00',
    createdAt: new Date('2026-05-30T14:00:00Z')
  },

  // NVDA (3 Wins / 1 Loss = 75%)
  {
    _id: 'p2',
    symbol: 'NVDA',
    prediction: 'BUY',
    confidence: 94,
    actual: 884.80,
    status: 'Complied',
    targetPrice: 940.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Strong Buy',
    strength: 'High',
    reasoning: 'Next-gen Blackwell server configurations outperforming early benchmarks. Supply chains indicate strong backlog.',
    technicals: {
      rsi: { value: 78, status: 'Overbought', progress: 78, color: 'text-neon-rose' },
      macd: { value: 4.90, status: 'Strong Trend', progress: 96, color: 'text-neon-emerald' }
    },
    sentiment: { positive: 85, negative: 8, neutral: 7, explanation: 'Blackwell order backlog extensions.' },
    date: '2026-06-05 14:15:45',
    createdAt: new Date('2026-06-05T14:15:45Z')
  },
  {
    _id: 'p2_2',
    symbol: 'NVDA',
    prediction: 'BUY',
    confidence: 89,
    actual: 845.20,
    status: 'Complied',
    targetPrice: 910.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Strong Buy',
    strength: 'High',
    reasoning: 'Strong GPU demands.',
    technicals: { rsi: { value: 72, status: 'Bullish', progress: 72, color: 'text-neon-emerald' } },
    sentiment: { positive: 80, negative: 10, neutral: 10, explanation: 'Growth upgrades.' },
    date: '2026-06-03 13:10:00',
    createdAt: new Date('2026-06-03T13:10:00Z')
  },
  {
    _id: 'p2_3',
    symbol: 'NVDA',
    prediction: 'BUY',
    confidence: 76,
    actual: 830.50,
    status: 'Complied',
    targetPrice: 870.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Buy',
    strength: 'Moderate',
    reasoning: 'Healthy price levels on daily chart.',
    technicals: { rsi: { value: 65, status: 'Bullish', progress: 65, color: 'text-neon-emerald' } },
    sentiment: { positive: 70, negative: 15, neutral: 15, explanation: 'Positive signals.' },
    date: '2026-06-01 10:45:00',
    createdAt: new Date('2026-06-01T10:45:00Z')
  },
  {
    _id: 'p2_4',
    symbol: 'NVDA',
    prediction: 'SELL',
    confidence: 78,
    actual: 820.40,
    status: 'Refuted',
    targetPrice: 770.00,
    forecastDays: 7,
    direction: 'bearish',
    recommendation: 'Strong Sell',
    strength: 'High',
    reasoning: 'Momentum index broke resistance levels instead of correcting.',
    technicals: { rsi: { value: 75, status: 'Overbought', progress: 75, color: 'text-neon-rose' } },
    sentiment: { positive: 20, negative: 70, neutral: 10, explanation: 'Sell-off worries.' },
    date: '2026-05-28 15:15:00',
    createdAt: new Date('2026-05-28T15:15:00Z')
  },

  // TSLA (1 Win / 2 Losses = 33.3%)
  {
    _id: 'p3',
    symbol: 'TSLA',
    prediction: 'HOLD',
    confidence: 52,
    actual: 175.34,
    status: 'Complied',
    targetPrice: 176.00,
    forecastDays: 7,
    direction: 'neutral',
    recommendation: 'Hold',
    strength: 'Low',
    reasoning: 'Regulatory credits offset supply chain delivery bottlenecks in Europe. Price actions consolidate.',
    technicals: {
      rsi: { value: 49, status: 'Neutral', progress: 49, color: 'text-amber-450' },
      macd: { value: -0.12, status: 'Flatline', progress: 50, color: 'text-amber-450' }
    },
    sentiment: { positive: 40, negative: 42, neutral: 18, explanation: 'Sideways consolidation vectors.' },
    date: '2026-06-05 11:22:00',
    createdAt: new Date('2026-06-05T11:22:00Z')
  },
  {
    _id: 'p3_2',
    symbol: 'TSLA',
    prediction: 'BUY',
    confidence: 74,
    actual: 172.90,
    status: 'Refuted',
    targetPrice: 195.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Buy',
    strength: 'Moderate',
    reasoning: 'Expected bullish breakout on low volume, failed to trigger.',
    technicals: { rsi: { value: 58, status: 'Bullish', progress: 58, color: 'text-neon-emerald' } },
    sentiment: { positive: 65, negative: 20, neutral: 15, explanation: 'Upward trend forecast.' },
    date: '2026-06-03 10:15:00',
    createdAt: new Date('2026-06-03T10:15:00Z')
  },
  {
    _id: 'p3_3',
    symbol: 'TSLA',
    prediction: 'SELL',
    confidence: 68,
    actual: 178.40,
    status: 'Refuted',
    targetPrice: 165.00,
    forecastDays: 7,
    direction: 'bearish',
    recommendation: 'Sell',
    strength: 'Moderate',
    reasoning: 'Expected downside continuation, but buyers stepped in at key support level.',
    technicals: { rsi: { value: 34, status: 'Bearish', progress: 34, color: 'text-neon-rose' } },
    sentiment: { positive: 20, negative: 65, neutral: 15, explanation: 'Negative sentiment.' },
    date: '2026-05-30 09:45:00',
    createdAt: new Date('2026-05-30T09:45:00Z')
  },

  // RELIANCE.NS (2 Wins / 1 Loss = 66.7%)
  {
    _id: 'p4',
    symbol: 'RELIANCE.NS',
    prediction: 'SELL',
    confidence: 64,
    actual: 2905.00,
    status: 'Complied',
    targetPrice: 2880.00,
    forecastDays: 7,
    direction: 'bearish',
    recommendation: 'Sell',
    strength: 'Moderate',
    reasoning: 'Brief compression margins on refining cycles coupled with increased capital outlays for telecom infrastructure.',
    technicals: {
      rsi: { value: 41, status: 'Bearish Bias', progress: 41, color: 'text-neon-rose' },
      macd: { value: -2.10, status: 'Negative Cross', progress: 38, color: 'text-neon-rose' }
    },
    sentiment: { positive: 35, negative: 55, neutral: 10, explanation: 'Margins cuts pressuring local brokers.' },
    date: '2026-06-05 09:45:30',
    createdAt: new Date('2026-06-05T09:45:30Z')
  },
  {
    _id: 'p4_2',
    symbol: 'RELIANCE.NS',
    prediction: 'BUY',
    confidence: 71,
    actual: 2962.00,
    status: 'Complied',
    targetPrice: 3040.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Buy',
    strength: 'Moderate',
    reasoning: 'Support bounced off 200 EMA.',
    technicals: { rsi: { value: 60, status: 'Bullish', progress: 60, color: 'text-neon-emerald' } },
    sentiment: { positive: 65, negative: 20, neutral: 15, explanation: 'Buying support.' },
    date: '2026-06-03 14:30:00',
    createdAt: new Date('2026-06-03T14:30:00Z')
  },
  {
    _id: 'p4_3',
    symbol: 'RELIANCE.NS',
    prediction: 'BUY',
    confidence: 83,
    actual: 2980.00,
    status: 'Refuted',
    targetPrice: 3100.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Strong Buy',
    strength: 'High',
    reasoning: 'Expected continuation did not sustain and hit stop losses.',
    technicals: { rsi: { value: 64, status: 'Bullish', progress: 64, color: 'text-neon-emerald' } },
    sentiment: { positive: 70, negative: 15, neutral: 15, explanation: 'Favorable audits.' },
    date: '2026-06-01 11:00:00',
    createdAt: new Date('2026-06-01T11:00:00Z')
  },

  // MSFT (1 Win / 1 Loss = 50%)
  {
    _id: 'p5',
    symbol: 'MSFT',
    prediction: 'BUY',
    confidence: 91,
    actual: 417.20,
    status: 'Complied',
    targetPrice: 435.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Strong Buy',
    strength: 'High',
    reasoning: 'Azure Copilot growth vector accelerates. Expansion of cloud licensing contracts across Fortune 500.',
    technicals: {
      rsi: { value: 72, status: 'Overbought', progress: 72, color: 'text-neon-emerald' },
      macd: { value: 2.80, status: 'Positive Cross', progress: 92, color: 'text-neon-emerald' }
    },
    sentiment: { positive: 78, negative: 12, neutral: 10, explanation: 'Azure enterprise contract renewals.' },
    date: '2026-06-04 16:00:00',
    createdAt: new Date('2026-06-04T16:00:00Z')
  },
  {
    _id: 'p5_2',
    symbol: 'MSFT',
    prediction: 'SELL',
    confidence: 70,
    actual: 408.20,
    status: 'Refuted',
    targetPrice: 395.00,
    forecastDays: 7,
    direction: 'bearish',
    recommendation: 'Sell',
    strength: 'Moderate',
    reasoning: 'Profit taking triggered buyback instead of correction.',
    technicals: { rsi: { value: 42, status: 'Bearish Bias', progress: 42, color: 'text-neon-rose' } },
    sentiment: { positive: 30, negative: 55, neutral: 15, explanation: 'Weak forecasts.' },
    date: '2026-06-01 09:30:00',
    createdAt: new Date('2026-06-01T09:30:00Z')
  },

  // TCS.NS (1 Win / 2 Losses = 33.3%)
  {
    _id: 'p6',
    symbol: 'TCS.NS',
    prediction: 'BUY',
    confidence: 76,
    actual: 3810.00,
    status: 'Refuted',
    targetPrice: 4080.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Buy',
    strength: 'Moderate',
    reasoning: 'Steady client accretion in digital cloud solutions along with banking sector contracts renewal.',
    technicals: {
      rsi: { value: 62, status: 'Bullish', progress: 62, color: 'text-neon-emerald' },
      macd: { value: 12.4, status: 'Positive Cross', progress: 74, color: 'text-neon-emerald' }
    },
    sentiment: { positive: 65, negative: 20, neutral: 15, explanation: 'Order backlog renewals.' },
    date: '2026-06-04 13:10:15',
    createdAt: new Date('2026-06-04T13:10:15Z')
  },
  {
    _id: 'p6_2',
    symbol: 'TCS.NS',
    prediction: 'SELL',
    confidence: 65,
    actual: 3740.00,
    status: 'Complied',
    targetPrice: 3660.00,
    forecastDays: 7,
    direction: 'bearish',
    recommendation: 'Sell',
    strength: 'Moderate',
    reasoning: 'Sell off triggered on corporate structure change reports.',
    technicals: { rsi: { value: 36, status: 'Bearish Bias', progress: 36, color: 'text-neon-rose' } },
    sentiment: { positive: 25, negative: 65, neutral: 10, explanation: 'Negative rumors.' },
    date: '2026-06-02 12:45:00',
    createdAt: new Date('2026-06-02T12:45:00Z')
  },
  {
    _id: 'p6_3',
    symbol: 'TCS.NS',
    prediction: 'BUY',
    confidence: 70,
    actual: 3680.00,
    status: 'Refuted',
    targetPrice: 3800.00,
    forecastDays: 7,
    direction: 'bullish',
    recommendation: 'Buy',
    strength: 'Moderate',
    reasoning: 'Target hit resistance levels and consolidated downwards.',
    technicals: { rsi: { value: 58, status: 'Bullish', progress: 58, color: 'text-neon-emerald' } },
    sentiment: { positive: 60, negative: 20, neutral: 20, explanation: 'Moderate buy flow.' },
    date: '2026-05-29 11:30:00',
    createdAt: new Date('2026-05-29T11:30:00Z')
  }
];

export const sandboxWatchlists = [
  { _id: 'w1', user: '1', symbol: 'AAPL' },
  { _id: 'w2', user: '1', symbol: 'MSFT' },
  { _id: 'w3', user: '1', symbol: 'NVDA' },
  { _id: 'w4', user: '1', symbol: 'TSLA' },
  { _id: 'w5', user: '1', symbol: 'TCS.NS' },
  { _id: 'w6', user: '1', symbol: 'RELIANCE.NS' }
];

export const sandboxActivityLogs = [
  {
    _id: 'l1',
    user: '1',
    action: 'SANDBOX_MODE',
    details: 'Database sandbox fallbacks enabled (Offline simulation active).',
    createdAt: new Date()
  }
];

export const sandboxHoldings = [
  { _id: 'h1', user: '1', symbol: 'AAPL', shares: 5, buyPrice: 172.50 },
  { _id: 'h2', user: '1', symbol: 'RELIANCE.NS', shares: 10, buyPrice: 2850.00 }
];
