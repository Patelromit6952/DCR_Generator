import mongoose from 'mongoose';

const clientDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  quotationDate: { type: String } // stored as 'YYYY-MM-DD'
}, { _id: false });

const itemOfWorkSchema = new mongoose.Schema({
  description: { type: String },
  qty: { type: Number },
  rate: { type: Number },
  unit: { type: String },
  amount: { type: Number }
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  schedule: { type: String, required: true },
  item_of_works: [itemOfWorkSchema],
  total: { type: Number },
  gst: { type: Number },
  grandTotal: { type: Number }
}, { _id: false });

const summarySchema = new mongoose.Schema({
  subtotal: { type: Number },
  gstAmount: { type: Number },
  finalTotal: { type: Number },
  gstPercentage: { type: Number }
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  quotationType: { type: String, required: true },
  clientDetails: clientDetailsSchema,
  schedules: [scheduleSchema],
  summary: summarySchema,
  status: { type: String, enum: ['draft', 'final'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Quotation', quotationSchema);
