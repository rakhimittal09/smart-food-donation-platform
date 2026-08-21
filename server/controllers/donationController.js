const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');
const { logActivity } = require('../services/logService');
const { sendNotification } = require('../services/notificationService');

// @desc    Create new food donation
// @route   POST /api/donations
// @access  Private (Donor only)
const createDonation = async (req, res, next) => {
  try {
    const {
      foodName,
      description,
      category,
      quantity,
      unit,
      foodType,
      preparationDate,
      expiryDate,
      pickupDate,
      pickupTime,
      pickupAddress,
      city,
      state,
      pincode,
      contactName,
      contactPhone,
      specialInstructions,
      image,
    } = req.body;

    let finalImage = image || '';
    if (req.file) {
      finalImage = `/uploads/${req.file.filename}`;
    }

    const donation = await FoodDonation.create({
      donor: req.user._id,
      foodName,
      description,
      category,
      quantity: Number(quantity),
      unit: unit || 'servings',
      foodType: foodType || 'Veg',
      preparationDate: preparationDate || new Date(),
      expiryDate,
      pickupDate,
      pickupTime,
      pickupAddress,
      city,
      state,
      pincode,
      contactName: contactName || req.user.name,
      contactPhone: contactPhone || req.user.phone,
      specialInstructions: specialInstructions || '',
      image: finalImage,
      status: 'Available',
    });

    await logActivity({
      userId: req.user._id,
      action: 'DONATION_CREATED',
      description: `Created food donation: ${donation.foodName} (${donation.quantity} ${donation.unit})`,
      module: 'DONATION',
      ipAddress: req.ip,
    });

    await sendNotification({
      userId: req.user._id,
      title: 'Donation Listed Successfully',
      message: `Your donation "${donation.foodName}" is now active and discoverable by NGOs.`,
      type: 'success',
      link: `/donations/${donation._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Food donation listed successfully!',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all food donations with filtering & search
// @route   GET /api/donations
// @access  Public / Authenticated
const getDonations = async (req, res, next) => {
  try {
    const {
      search,
      category,
      foodType,
      city,
      location,
      status,
      includeExpired,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Filter by status (default to Available if not specified)
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = 'Available';
    }

    // Filter out expired items by default unless explicitly included
    if (includeExpired !== 'true' && query.status === 'Available') {
      query.expiryDate = { $gt: new Date() };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Food type filter (Veg, Non-Veg, etc.)
    if (foodType && foodType !== 'all') {
      query.foodType = foodType;
    }

    // Location filter (city, state, or pickup address)
    const locationTerm = location || city;
    if (locationTerm && locationTerm !== 'all') {
      query.$or = [
        { city: { $regex: locationTerm, $options: 'i' } },
        { state: { $regex: locationTerm, $options: 'i' } },
        { pickupAddress: { $regex: locationTerm, $options: 'i' } },
      ];
    }

    if (search) {
      const searchFilter = {
        $or: [
          { foodName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { pickupAddress: { $regex: search, $options: 'i' } },
          { foodType: { $regex: search, $options: 'i' } },
        ],
      };
      if (query.$or) {
        query.$and = [{ $or: query.$or }, searchFilter];
        delete query.$or;
      } else {
        Object.assign(query, searchFilter);
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = order === 'asc' ? 1 : -1;

    const total = await FoodDonation.countDocuments(query);
    const donations = await FoodDonation.find(query)
      .populate('donor', 'name organizationName email phone avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my
// @access  Private (Donor)
const getMyDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { donor: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await FoodDonation.countDocuments(query);
    const donations = await FoodDonation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Attach count of received requests for each donation
    const donationIds = donations.map((d) => d._id);
    const requestCounts = await FoodRequest.aggregate([
      { $match: { donation: { $in: donationIds } } },
      { $group: { _id: '$donation', count: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } } } },
    ]);

    const requestMap = {};
    requestCounts.forEach((rc) => {
      requestMap[rc._id.toString()] = { total: rc.count, pending: rc.pending };
    });

    const enriched = donations.map((d) => {
      const doc = d.toObject();
      doc.requestStats = requestMap[d._id.toString()] || { total: 0, pending: 0 };
      return doc;
    });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food donation by ID
// @route   GET /api/donations/:id
// @access  Public / Authenticated
const getDonationById = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id).populate(
      'donor',
      'name organizationName email phone address city state pincode avatar'
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food donation not found.',
      });
    }

    // If requester is donor or admin, include existing requests
    let requests = [];
    if (
      req.user &&
      (req.user.role === 'admin' || donation.donor._id.toString() === req.user._id.toString())
    ) {
      requests = await FoodRequest.find({ donation: donation._id })
        .populate('receiver', 'name organizationName email phone city')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: donation,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food donation
// @route   PUT /api/donations/:id
// @access  Private (Donor / Admin)
const updateDonation = async (req, res, next) => {
  try {
    let donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Verify ownership or admin
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this donation.',
      });
    }

    // Prevent updates if already Picked Up / Completed
    if (['Picked Up', 'Delivered'].includes(donation.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a donation that is already picked up or completed.',
      });
    }

    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    donation = await FoodDonation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logActivity({
      userId: req.user._id,
      action: 'DONATION_UPDATED',
      description: `Updated donation: ${donation.foodName}`,
      module: 'DONATION',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Donation updated successfully!',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or Cancel food donation
// @route   DELETE /api/donations/:id
// @access  Private (Donor / Admin)
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this donation.',
      });
    }

    await FoodDonation.findByIdAndDelete(req.params.id);
    // Also cancel pending requests
    await FoodRequest.updateMany(
      { donation: req.params.id, status: 'Pending' },
      { status: 'Cancelled' }
    );

    await logActivity({
      userId: req.user._id,
      action: 'DONATION_DELETED',
      description: `Deleted donation: ${donation.foodName}`,
      module: 'DONATION',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Donation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
// @access  Private
const updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const allowedStatuses = [
      'Available',
      'Pending',
      'Accepted',
      'Picked Up',
      'Delivered',
      'Expired',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid donation status' });
    }

    donation.status = status;
    await donation.save();

    await logActivity({
      userId: req.user._id,
      action: 'DONATION_STATUS_CHANGED',
      description: `Donation "${donation.foodName}" status changed to ${status}`,
      module: 'DONATION',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Donation status updated to ${status}`,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  updateDonationStatus,
};
