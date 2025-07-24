import mongoose from "mongoose";
const clientDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  quotationDate: { type: String }
}, { _id: false });
export default mongoose.model('Client', clientDetailsSchema);