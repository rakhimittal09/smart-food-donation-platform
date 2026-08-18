const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user action in the system
 * @param {Object} params
 * @param {string} params.userId - User ID performing the action
 * @param {string} params.action - Short action name (e.g., 'DONATION_CREATED')
 * @param {string} params.description - Human-readable description
 * @param {string} params.module - 'AUTH' | 'DONATION' | 'REQUEST' | 'PICKUP' | 'USER' | 'ADMIN' | 'CATEGORY' | 'PROFILE'
 * @param {string} [params.ipAddress] - Client IP address
 */
const logActivity = async ({ userId, action, description, module, ipAddress = '' }) => {
  try {
    if (!userId || !action || !description || !module) return;
    await ActivityLog.create({
      user: userId,
      action,
      description,
      module,
      ipAddress,
    });
  } catch (error) {
    console.error('Error recording activity log:', error.message);
  }
};

module.exports = { logActivity };
