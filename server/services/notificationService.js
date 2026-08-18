const Notification = require('../models/Notification');

/**
 * Send notification to a specific user
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.type='info'] - 'info' | 'success' | 'warning' | 'danger'
 * @param {string} [params.link='']
 */
const sendNotification = async ({ userId, title, message, type = 'info', link = '' }) => {
  try {
    if (!userId || !title || !message) return null;
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * Send notification to multiple users (e.g. all admins)
 */
const sendBulkNotification = async (userIds, { title, message, type = 'info', link = '' }) => {
  try {
    const docs = userIds.map((userId) => ({
      user: userId,
      title,
      message,
      type,
      link,
    }));
    return await Notification.insertMany(docs);
  } catch (error) {
    console.error('Error creating bulk notifications:', error.message);
    return null;
  }
};

module.exports = { sendNotification, sendBulkNotification };
