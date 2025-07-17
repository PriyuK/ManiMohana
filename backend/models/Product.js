import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  inStock: { type: Boolean, default: true },
  dateAdded: { type: Date, default: Date.now },
  sales: { type: Number, default: 0 },
  recommended: { type: Boolean, default: false }
});

export default mongoose.model('Product', productSchema); 