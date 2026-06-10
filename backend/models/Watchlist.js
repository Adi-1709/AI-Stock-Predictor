import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

// Compound unique key constraint
WatchlistSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', WatchlistSchema);
export default Watchlist;
