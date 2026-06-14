const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const where = { userId: req.user.id };
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Notification.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  const unreadCount = await Notification.count({ where: { userId: req.user.id, isRead: false } });
  res.json({ notifications: rows, total: count, unreadCount, page: parseInt(page) });
});

router.patch('/:id/read', authenticate, async (req, res) => {
  const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  await notification.update({ isRead: true });
  res.json({ message: 'Marked as read' });
});

router.patch('/read-all', authenticate, async (req, res) => {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
