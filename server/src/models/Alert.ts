import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['density', 'movement', 'sound', 'emergency'],
    required: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  affectedZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  }],
  status: {
    type: String,
    enum: ['active', 'resolved', 'acknowledged'],
    default: 'active'
  },
  message: { type: String, required: true }
}, {
  timestamps: true
});

export const Alert = mongoose.model('Alert', alertSchema);