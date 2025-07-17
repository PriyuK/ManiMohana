import express from 'express';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to check admin
function isAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Admin only' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Public: Get all products
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ dateAdded: -1 });
  res.json(products);
});

// Admin: Add product
router.post('/', isAdmin, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// Admin: Update product
router.put('/:id', isAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

// Admin: Delete product
router.delete('/:id', isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

export default router; 