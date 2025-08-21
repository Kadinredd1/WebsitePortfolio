import express from 'express';
import Admin from '../models/Admin.js';
import { authenticateToken, requireRole, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      message: 'Login successful',
      token,
      admin: admin.toPublicJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current admin profile
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    admin: req.admin
  });
});

// Admin logout
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Create new admin
router.post('/create', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this username or email already exists' });
    }

    const newAdmin = new Admin({
      username,
      email,
      password,
      role: role || 'admin'
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: newAdmin.toPublicJSON()
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Failed to create admin' });
  }
});

// Get all admins
router.get('/list', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admins' });
  }
});

// Update admin status
router.patch('/:id/status', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      message: 'Admin status updated',
      admin
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update admin status' });
  }
});

export default router; 