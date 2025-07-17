import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  address: String,
  phone: String,
  paymentMethod: String,
  date: { type: Date, default: Date.now },
  fulfilled: { type: Boolean, default: false }
});

export default mongoose.model('Order', orderSchema); 