const { AuditLog } = require('../models');
const logger = require('../utils/logger');

const createAuditLog = async (userId, action, resource, resourceId, details, req, status = 'success') => {
  try {
    await AuditLog.create({
      userId,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
      status,
    });
  } catch (error) {
    logger.error('Audit log creation failed:', error);
  }
};

module.exports = { createAuditLog };
