import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
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
  shares: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.0001, 'Quantity must be positive']
  },
  buyPrice: {
    type: Number,
    required: [true, 'Buy price is required'],
    min: [0.01, 'Buy price must be positive']
  }
}, {
  timestamps: true
});

// Compounding unique constraints per stock symbol per user
PortfolioSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);
export default Portfolio;
