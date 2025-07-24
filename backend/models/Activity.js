import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quotation_created', 'quotation_sent', 'quotation_approved', 'payment_received', 'client_added'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Activity', activitySchema);