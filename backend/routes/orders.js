import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Middleware to check auth
function isAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Place order
router.post('/', isAuth, async (req, res) => {
  const { items, total, address, phone, paymentMethod } = req.body;
  const order = await Order.create({
    user: req.user.id,
    items,
    total,
    address,
    phone,
    paymentMethod
  });
  // Update product sales
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { sales: item.quantity } });
  }
  // Send email to customer and admin
  const html = `<h2>Order Confirmation</h2>
    <p>Order #${order._id}</p>
    <p>Total: $${order.total}</p>`;
  await sendEmail(req.user.email, 'Order Confirmation', html);
  await sendEmail(process.env.ADMIN_EMAIL, 'New Order Received', html);
  res.status(201).json(order);
});

// User: Get my orders
router.get('/my', isAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
  res.json(orders);
});

// Admin: Get all orders
router.get('/all', isAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  const orders = await Order.find().populate('user', 'name email').sort({ date: -1 });
  res.json(orders);
});

// Admin: Mark order as fulfilled
router.put('/:id/fulfill', isAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  const order = await Order.findByIdAndUpdate(req.params.id, { fulfilled: true }, { new: true });
  res.json(order);
});

export default router; 