const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  updateDonationStatus,
} = require('../controllers/donationController');
const { protect, optionalProtect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { donationRules } = require('../middleware/validator');

router.get('/', getDonations);
router.get('/my', protect, authorize('donor'), getMyDonations);
router.get('/:id', optionalProtect, getDonationById);

router.post(
  '/',
  protect,
  authorize('donor'),
  upload.single('imageFile'),
  donationRules,
  createDonation
);

router.put(
  '/:id',
  protect,
  authorize('donor', 'admin'),
  upload.single('imageFile'),
  updateDonation
);

router.put(
  '/:id/status',
  protect,
  authorize('donor', 'admin'),
  updateDonationStatus
);

router.delete(
  '/:id',
  protect,
  authorize('donor', 'admin'),
  deleteDonation
);

module.exports = router;
