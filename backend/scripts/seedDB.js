import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Prediction from '../models/Prediction.js';
import Watchlist from '../models/Watchlist.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

// Standard Technical indicators template
const mockTechnicals = (dir) => ({
  rsi: { value: dir === 'bullish' ? 68 : 42, status: dir === 'bullish' ? 'Bullish' : 'Neutral', progress: dir === 'bullish' ? 68 : 42, color: dir === 'bullish' ? 'text-neon-emerald' : 'text-amber-450' },
  macd: { value: dir === 'bullish' ? 1.45 : -0.12, status: dir === 'bullish' ? 'Positive Crossover' : 'Flatline', progress: 85, color: dir === 'bullish' ? 'text-neon-emerald' : 'text-amber-450' },
  momentum: { value: dir === 'bullish' ? 12.4 : -1.1, status: dir === 'bullish' ? 'Strong' : 'Weak', progress: 78, color: dir === 'bullish' ? 'text-neon-emerald' : 'text-neon-rose' },
  volatility: { value: 18, status: 'Medium', progress: 45, color: 'text-neon-cyan' },
  adx: { value: 28, status: 'Strong Trend', progress: 70, color: 'text-neon-emerald' },
  obv: { value: 89, status: 'Positive Flow', progress: 89, color: 'text-neon-emerald' }
});

const mockSentiment = (dir) => ({
  positive: dir === 'bullish' ? 78 : 35,
  negative: dir === 'bearish' ? 78 : 35,
  neutral: dir === 'neutral' ? 50 : 10,
  explanation: 'Consensus upgrades from Tier-1 institutions matching quantitative technical breakout parameters.'
});

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-stock-predictor');
    console.log(`⚡ Connected to MongoDB for seeding: ${conn.connection.host}`);

    // Clean existing database collections
    await User.deleteMany();
    await Prediction.deleteMany();
    await Watchlist.deleteMany();
    await ActivityLog.deleteMany();
    console.log('🗑️ Existing collection records cleaned.');

    // 1. Create Default User
    // Note: Password hashing happens in the User schema save middleware automatically
    const user = await User.create({
      name: 'Alex Mercer',
      email: 'alex@alpha.ai',
      password: 'password123', // will be hashed by save hook
      plan: 'Pro Elite',
      avatar: 'AM',
      bio: 'Fintech Analyst & Quantitative Developer.',
      company: 'Alpha AI Capital',
      phone: '+1 (555) 019-2834',
      location: 'New York, NY'
    });
    console.log('👤 Default User seeded successfully.');

    // 2. Seed default stocks predictions
    const seededStocks = [
      {
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
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-05 15:30:12'
      },
      {
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
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-05 14:15:45'
      },
      {
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
        technicals: mockTechnicals('neutral'),
        sentiment: mockSentiment('neutral'),
        date: '2026-06-05 11:22:00'
      },
      {
        symbol: 'RELIANCE',
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
        technicals: mockTechnicals('bearish'),
        sentiment: mockSentiment('bearish'),
        date: '2026-06-05 09:45:30'
      },
      {
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
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-04 16:00:00'
      },
      {
        symbol: 'TCS',
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
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-04 13:10:15'
      },
      {
        symbol: 'GOOGL',
        prediction: 'SELL',
        confidence: 68,
        actual: 146.80,
        status: 'Complied',
        targetPrice: 140.00,
        forecastDays: 7,
        direction: 'bearish',
        recommendation: 'Sell',
        strength: 'Moderate',
        reasoning: 'AI Search margins compression fears and advertising volume consolidation trends.',
        technicals: mockTechnicals('bearish'),
        sentiment: mockSentiment('bearish'),
        date: '2026-06-04 10:30:22'
      },
      {
        symbol: 'NVDA',
        prediction: 'BUY',
        confidence: 89,
        actual: 852.67,
        status: 'Complied',
        targetPrice: 890.00,
        forecastDays: 7,
        direction: 'bullish',
        recommendation: 'Strong Buy',
        strength: 'High',
        reasoning: 'Blackwell order leaks trigger aggressive short covering across trading panels.',
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-03 15:45:00'
      },
      {
        symbol: 'AAPL',
        prediction: 'HOLD',
        confidence: 58,
        actual: 180.90,
        status: 'Complied',
        targetPrice: 181.00,
        forecastDays: 7,
        direction: 'neutral',
        recommendation: 'Hold',
        strength: 'Low',
        reasoning: 'Consolidating on flat option volume ahead of WWDC keynote releases.',
        technicals: mockTechnicals('neutral'),
        sentiment: mockSentiment('neutral'),
        date: '2026-06-03 12:12:18'
      },
      {
        symbol: 'TSLA',
        prediction: 'SELL',
        confidence: 72,
        actual: 178.45,
        status: 'Refuted',
        targetPrice: 165.00,
        forecastDays: 7,
        direction: 'bearish',
        recommendation: 'Sell',
        strength: 'Moderate',
        reasoning: 'Q2 deliveries concerns trigger technical breakdowns on moving averages.',
        technicals: mockTechnicals('bearish'),
        sentiment: mockSentiment('bearish'),
        date: '2026-06-03 09:30:00'
      },
      {
        symbol: 'MSFT',
        prediction: 'BUY',
        confidence: 85,
        actual: 410.20,
        status: 'Complied',
        targetPrice: 420.00,
        forecastDays: 7,
        direction: 'bullish',
        recommendation: 'Buy',
        strength: 'Moderate',
        reasoning: 'Azure enterprise contract renewals show significant volume expansions.',
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-02 16:00:00'
      },
      {
        symbol: 'RELIANCE',
        prediction: 'BUY',
        confidence: 70,
        actual: 2950.00,
        status: 'Complied',
        targetPrice: 3100.00,
        forecastDays: 7,
        direction: 'bullish',
        recommendation: 'Buy',
        strength: 'Moderate',
        reasoning: 'Telecom subscriber price hikes expected to boost operating margins.',
        technicals: mockTechnicals('bullish'),
        sentiment: mockSentiment('bullish'),
        date: '2026-06-02 11:15:30'
      }
    ];

    await Prediction.insertMany(seededStocks);
    console.log(`📈 Seeded ${seededStocks.length} Predictions records successfully.`);

    // 3. Seed Watchlist entries for user
    const watchlistSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'TCS', 'RELIANCE'];
    const watchlistPromises = watchlistSymbols.map(sym => 
      Watchlist.create({ user: user._id, symbol: sym })
    );
    await Promise.all(watchlistPromises);
    console.log(`⭐ Seeded Watchlist with ${watchlistSymbols.length} tickers.`);

    // 4. Seed system activity log
    await ActivityLog.create({
      user: user._id,
      action: 'SYSTEM_SEED',
      details: 'Initial database collections successfully populated via scripts/seedDB.js',
      ipAddress: '127.0.0.1',
      userAgent: 'Node/Script'
    });
    console.log('📜 Seed Activity Log entry registered.');

    console.log('✅ [Database Seed] Seeding operation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ [Database Seed] Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
