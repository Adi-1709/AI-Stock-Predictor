import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['price_above', 'price_below', 'signal_change', 'rsi_above', 'rsi_below', 'sentiment_negative', 'volatility_above'],
    required: [true, 'Alert parameter type is required']
  },
  value: {
    type: String,
    required: [true, 'Trigger comparison threshold value is required']
  },
  isTriggered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Alert = mongoose.model('Alert', AlertSchema);
export default Alert;
