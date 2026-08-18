const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  deleteUser,
  getReports,
  getActivityLogs,
  getSettings,
  updateSetting,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All admin routes require authentication & admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/reports', getReports);
router.get('/activity-logs', getActivityLogs);

router.get('/settings', getSettings);
router.put('/settings', updateSetting);

module.exports = router;
