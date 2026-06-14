const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const crypto = require('crypto');
const { User } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../middleware/auditLog');
const logger = require('../utils/logger');

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').isIn(['teacher', 'counselor']).withMessage('Role must be teacher or counselor'),
  validate,
], async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    phone,
    verificationToken,
    isVerified: process.env.NODE_ENV === 'development', // Auto-verify in dev
  });

  if (process.env.NODE_ENV !== 'development') {
    await sendVerificationEmail(user, verificationToken).catch(err => 
      logger.error('Failed to send verification email:', err)
    );
  }

  await createAuditLog(user.id, 'REGISTER', 'User', user.id, { email, role }, req);

  const token = generateAccessToken({ id: user.id, role: user.role });
  
  res.status(201).json({
    message: 'Registration successful',
    user: user.toJSON(),
    token: process.env.NODE_ENV === 'development' ? token : undefined,
  });
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !await user.comparePassword(password)) {
    await createAuditLog(null, 'LOGIN_FAILED', 'User', null, { email }, req, 'failure');
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
  }

  if (!user.isVerified && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Please verify your email before logging in.' });
  }

  const token = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await user.update({ lastLogin: new Date(), refreshToken });
  await createAuditLog(user.id, 'LOGIN', 'User', user.id, {}, req);

  res.json({
    message: 'Login successful',
    user: user.toJSON(),
    token,
    refreshToken,
  });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findByPk(decoded.id);
  
  if (!user || user.refreshToken !== refreshToken || !user.isActive) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const newToken = generateAccessToken({ id: user.id, role: user.role });
  res.json({ token: newToken });
});

// Verify email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Verification token required' });
  }

  const user = await User.findOne({ where: { verificationToken: token } });
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }

  await user.update({ isVerified: true, verificationToken: null });
  res.json({ message: 'Email verified successfully' });
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
  validate,
], async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  
  // Always return success to prevent email enumeration
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await user.update({ resetPasswordToken: resetToken, resetPasswordExpires: resetExpires });
    await sendPasswordResetEmail(user, resetToken).catch(err =>
      logger.error('Failed to send reset email:', err)
    );
  }

  res.json({ message: 'If the email exists, a reset link has been sent.' });
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  validate,
], async (req, res) => {
  const { token, password } = req.body;
  
  const user = await User.findOne({
    where: { resetPasswordToken: token },
  });

  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  await user.update({
    password,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  res.json({ message: 'Password reset successful' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  await req.user.update({ refreshToken: null });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
