const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../middleware/auditLog');

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const { role, isActive } = req.query;
  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const users = await User.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json({ users });
});

router.get('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: user.toJSON() });
});

router.put('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().isMobilePhone(),
  body('department').optional().trim(),
  validate,
], async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const allowedFields = ['name', 'phone', 'department', 'avatar'];
  if (req.user.role === 'admin') allowedFields.push('role', 'isActive', 'isVerified');

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await user.update(updates);
  await createAuditLog(req.user.id, 'UPDATE', 'User', user.id, {}, req);
  res.json({ message: 'Profile updated', user: user.toJSON() });
});

router.put('/:id/password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  validate,
], async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const user = await User.findByPk(req.params.id);
  const isValid = await user.comparePassword(req.body.currentPassword);
  if (!isValid) return res.status(400).json({ error: 'Current password is incorrect' });

  await user.update({ password: req.body.newPassword });
  res.json({ message: 'Password updated successfully' });
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: 'Cannot deactivate your own account' });
  }
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  await user.update({ isActive: false });
  await createAuditLog(req.user.id, 'DEACTIVATE', 'User', user.id, {}, req);
  res.json({ message: 'User deactivated' });
});

module.exports = router;
