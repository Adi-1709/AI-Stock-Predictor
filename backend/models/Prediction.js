import mongoose from 'mongoose';

const TechnicalIndicatorSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  status: { type: String, required: true },
  progress: { type: Number, required: true },
  color: { type: String, default: 'text-neon-cyan' }
}, { _id: false });

const PredictionSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    trim: true,
    uppercase: true,
    index: true
  },
  prediction: {
    type: String,
    required: [true, 'Prediction is required'],
    enum: ['BUY', 'SELL', 'HOLD'],
    uppercase: true
  },
  confidence: {
    type: Number,
    required: [true, 'Confidence level is required'],
    min: [0, 'Confidence cannot be less than 0%'],
    max: [100, 'Confidence cannot exceed 100%']
  },
  actual: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Complied', 'Refuted', 'Pending'],
    default: 'Complied'
  },
  targetPrice: {
    type: Number,
    required: true
  },
  forecastDays: {
    type: Number,
    default: 7
  },
  direction: {
    type: String,
    required: true,
    enum: ['bullish', 'bearish', 'neutral']
  },
  recommendation: {
    type: String,
    required: true
  },
  strength: {
    type: String,
    required: true,
    enum: ['High', 'Moderate', 'Low']
  },
  reasoning: {
    type: String,
    required: true
  },
  technicals: {
    rsi: TechnicalIndicatorSchema,
    macd: TechnicalIndicatorSchema,
    momentum: TechnicalIndicatorSchema,
    volatility: TechnicalIndicatorSchema,
    adx: TechnicalIndicatorSchema,
    obv: TechnicalIndicatorSchema
  },
  sentiment: {
    positive: { type: Number, required: true },
    negative: { type: Number, required: true },
    neutral: { type: Number, required: true },
    explanation: { type: String, required: true }
  },
  features: {
    type: mongoose.Schema.Types.Mixed
  },
  date: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
}, {
  timestamps: true
});

const Prediction = mongoose.model('Prediction', PredictionSchema);
export default Prediction;
