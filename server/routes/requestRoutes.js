const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { requestRules } = require('../middleware/validator');

router.post('/', protect, authorize('receiver'), requestRules, createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id/status', protect, updateRequestStatus);

module.exports = router;
