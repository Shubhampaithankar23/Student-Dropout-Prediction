const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../middleware/auditLog');

/**
 * In-memory settings store.
 * For a production app these would live in a DB table.
 * Using a module-level object means they persist for the lifetime of
 * the Node process and reset on restart – which is acceptable for a
 * demo / college project while keeping the implementation simple.
 */
const DEFAULT_SETTINGS = {
  emailAlerts: true,
  highRiskAlerts: true,
  weeklyReports: false,
  autoPredict: true,
  rateLimit: 100,
  sessionTimeout: 7,
  maintenanceMode: false,
  predictionThreshold: 75,
  mlModelVersion: '2.1.0',
};

let currentSettings = { ...DEFAULT_SETTINGS };

// GET /api/settings  — admin only
router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({ settings: currentSettings });
});

// PUT /api/settings  — admin only
router.put('/', authenticate, authorize('admin'), [
  body('emailAlerts').optional().isBoolean(),
  body('highRiskAlerts').optional().isBoolean(),
  body('weeklyReports').optional().isBoolean(),
  body('autoPredict').optional().isBoolean(),
  body('rateLimit').optional().isInt({ min: 10, max: 1000 }),
  body('sessionTimeout').optional().isInt({ min: 1, max: 90 }),
  body('maintenanceMode').optional().isBoolean(),
  body('predictionThreshold').optional().isInt({ min: 50, max: 99 }),
  validate,
], async (req, res) => {
  const allowed = [
    'emailAlerts', 'highRiskAlerts', 'weeklyReports', 'autoPredict',
    'rateLimit', 'sessionTimeout', 'maintenanceMode', 'predictionThreshold',
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  currentSettings = { ...currentSettings, ...updates };

  await createAuditLog(req.user.id, 'UPDATE', 'Settings', null, updates, req);

  res.json({ message: 'Settings saved', settings: currentSettings });
});

// Expose a helper so other modules can read settings at runtime
const getSettings = () => currentSettings;

module.exports = router;
module.exports.getSettings = getSettings;
