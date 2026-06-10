import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // can be null for anonymous or pre-auth actions
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action name is required'],
    trim: true,
    index: true
  },
  details: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
