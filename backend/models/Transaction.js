import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  dateOfSale: String,
  category: String,
  sold: Boolean,
});

export default mongoose.model('Transaction', transactionSchema);
