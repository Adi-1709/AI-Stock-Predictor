import { admin, db, auth } from '../config/firebase.js';
import dotenv from 'dotenv';

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

const clearCollection = async (collectionPath) => {
  const snapshot = await db.collection(collectionPath).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};

const seedFirestore = async () => {
  try {
    console.log('⚡ Connected to Firestore for seeding.');

    // Clean existing database collections
    await clearCollection('users');
    await clearCollection('predictions');
    await clearCollection('watchlists');
    await clearCollection('activityLogs');
    await clearCollection('portfolios');
    await clearCollection('alerts');
    await clearCollection('notifications');
    console.log('🗑️ Existing collection records cleaned.');

    // Check if the auth user exists and delete
    try {
      const userRecord = await auth.getUserByEmail('alex@alpha.ai');
      await auth.deleteUser(userRecord.uid);
      console.log('🗑️ Existing Auth user deleted.');
    } catch (e) {
      if (e.code !== 'auth/user-not-found') {
        console.warn('⚠️ Could not delete auth user:', e.message);
      }
    }

    // 1. Create Default User in Auth & Firestore
    const userRecord = await auth.createUser({
      email: 'alex@alpha.ai',
      password: 'password123',
      displayName: 'Alex Mercer'
    });

    const userData = {
      uid: userRecord.uid,
      name: 'Alex Mercer',
      email: 'alex@alpha.ai',
      plan: 'Pro Elite',
      avatar: 'AM',
      bio: 'Fintech Analyst & Quantitative Developer.',
      company: 'Alpha AI Capital',
      phone: '+1 (555) 019-2834',
      location: 'New York, NY',
      createdAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log('👤 Default User seeded successfully.');

    // 2. Seed default stocks predictions
    const seededStocks = [
      {
        symbol: 'AAPL', prediction: 'BUY', confidence: 87, actual: 185.20, status: 'Complied', targetPrice: 198.50, forecastDays: 7, direction: 'bullish', recommendation: 'Strong Buy', strength: 'High',
        reasoning: 'Strong iPhone sales forecasts in Asia coupled with aggressive AI chip design expansion plans.', technicals: mockTechnicals('bullish'), sentiment: mockSentiment('bullish'), date: '2026-06-05 15:30:12', createdAt: new Date().toISOString()
      },
      {
        symbol: 'NVDA', prediction: 'BUY', confidence: 94, actual: 884.80, status: 'Complied', targetPrice: 940.00, forecastDays: 7, direction: 'bullish', recommendation: 'Strong Buy', strength: 'High',
        reasoning: 'Next-gen Blackwell server configurations outperforming early benchmarks. Supply chains indicate strong backlog.', technicals: mockTechnicals('bullish'), sentiment: mockSentiment('bullish'), date: '2026-06-05 14:15:45', createdAt: new Date().toISOString()
      },
      {
        symbol: 'TSLA', prediction: 'HOLD', confidence: 52, actual: 175.34, status: 'Complied', targetPrice: 176.00, forecastDays: 7, direction: 'neutral', recommendation: 'Hold', strength: 'Low',
        reasoning: 'Regulatory credits offset supply chain delivery bottlenecks in Europe. Price actions consolidate.', technicals: mockTechnicals('neutral'), sentiment: mockSentiment('neutral'), date: '2026-06-05 11:22:00', createdAt: new Date().toISOString()
      },
      {
        symbol: 'RELIANCE', prediction: 'SELL', confidence: 64, actual: 2905.00, status: 'Complied', targetPrice: 2880.00, forecastDays: 7, direction: 'bearish', recommendation: 'Sell', strength: 'Moderate',
        reasoning: 'Brief compression margins on refining cycles coupled with increased capital outlays for telecom infrastructure.', technicals: mockTechnicals('bearish'), sentiment: mockSentiment('bearish'), date: '2026-06-05 09:45:30', createdAt: new Date().toISOString()
      },
      {
        symbol: 'MSFT', prediction: 'BUY', confidence: 91, actual: 417.20, status: 'Complied', targetPrice: 435.00, forecastDays: 7, direction: 'bullish', recommendation: 'Strong Buy', strength: 'High',
        reasoning: 'Azure Copilot growth vector accelerates. Expansion of cloud licensing contracts across Fortune 500.', technicals: mockTechnicals('bullish'), sentiment: mockSentiment('bullish'), date: '2026-06-04 16:00:00', createdAt: new Date().toISOString()
      }
    ];

    const batch = db.batch();
    seededStocks.forEach(stock => {
      const ref = db.collection('predictions').doc();
      batch.set(ref, stock);
    });
    await batch.commit();
    console.log(`📈 Seeded ${seededStocks.length} Predictions records successfully.`);

    // 3. Seed Watchlist entries for user
    const watchlistSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'TCS', 'RELIANCE'];
    const wlBatch = db.batch();
    watchlistSymbols.forEach(sym => {
      const ref = db.collection('watchlists').doc();
      wlBatch.set(ref, { userId: userRecord.uid, symbol: sym, createdAt: new Date().toISOString() });
    });
    await wlBatch.commit();
    console.log(`⭐ Seeded Watchlist with ${watchlistSymbols.length} tickers.`);

    // 4. Seed system activity log
    await db.collection('activityLogs').add({
      userId: userRecord.uid,
      action: 'SYSTEM_SEED',
      details: 'Initial database collections successfully populated via scripts/seedFirestore.js',
      ipAddress: '127.0.0.1',
      userAgent: 'Node/Script',
      createdAt: new Date().toISOString()
    });
    console.log('📜 Seed Activity Log entry registered.');

    console.log('✅ [Database Seed] Seeding operation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ [Database Seed] Seeding failed: ${error.stack}`);
    process.exit(1);
  }
};

seedFirestore();
