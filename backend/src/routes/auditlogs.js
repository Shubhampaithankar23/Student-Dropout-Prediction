const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { AuditLog, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/auditlogs  — admin only
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 30, action, resource, status, userId, search } = req.query;
  const where = {};

  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (search) {
    where[Op.or] = [
      { action: { [Op.like]: `%${search}%` } },
      { resource: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'], required: false }],
  });

  res.json({
    logs: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / parseInt(limit)),
  });
});

// GET /api/auditlogs/actions — distinct action types for filter dropdown
router.get('/actions', authenticate, authorize('admin'), async (req, res) => {
  const rows = await AuditLog.findAll({
    attributes: ['action'],
    group: ['action'],
    order: [['action', 'ASC']],
  });
  res.json({ actions: rows.map(r => r.action) });
});

module.exports = router;
