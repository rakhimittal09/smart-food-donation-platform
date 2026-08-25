const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');
const User = require('../models/User');
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
      items,
      foodType,
      preparationDate,
      expiryDate,
      donationMethod,
      pickupDate,
      pickupTime,
      pickupAddress,
      deliveryAddress,
      city,
      state,
      pincode,
      contactName,
      contactPhone,
      specialInstructions,
      image,
      isRecurring,
      recurringFrequency,
      isAnonymous,
      foodSafetyDetails,
    } = req.body;

    let finalImage = image || '';
    if (req.file) {
      finalImage = `/uploads/${req.file.filename}`;
    }

    // Parse items if sent as JSON string (multipart form)
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    }

    // Parse foodSafetyDetails if sent as JSON string
    let parsedFoodSafety = {};
    if (foodSafetyDetails) {
      parsedFoodSafety = typeof foodSafetyDetails === 'string' ? JSON.parse(foodSafetyDetails) : foodSafetyDetails;
    }

    const donation = await FoodDonation.create({
      donor: req.user._id,
      foodName,
      description,
      category,
      quantity: Number(quantity),
      unit: unit || 'servings',
      items: parsedItems,
      foodType: foodType || 'Veg',
      preparationDate: preparationDate || new Date(),
      expiryDate,
      donationMethod: donationMethod || 'ngo_pickup',
      pickupDate,
      pickupTime,
      pickupAddress,
      deliveryAddress: deliveryAddress || '',
      city,
      state,
      pincode,
      contactName: contactName || req.user.name,
      contactPhone: contactPhone || req.user.phone,
      specialInstructions: specialInstructions || '',
      image: finalImage,
      status: 'Available',
      isRecurring: isRecurring === true || isRecurring === 'true',
      recurringFrequency: recurringFrequency || '',
      isAnonymous: isAnonymous === true || isAnonymous === 'true',
      foodSafetyDetails: parsedFoodSafety,
    });

    await logActivity({
      userId: req.user._id,
      action: 'DONATION_CREATED',
      description: `Created food donation: ${donation.foodName} (${donation.quantity} ${donation.unit}) [${donation.donationId}]`,
      module: 'DONATION',
      ipAddress: req.ip,
    });

    await sendNotification({
      userId: req.user._id,
      title: 'Donation Listed Successfully',
      message: `Your donation "${donation.foodName}" (${donation.donationId}) is now active and discoverable by NGOs.`,
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
      donationMethod,
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

    // Donation method filter
    if (donationMethod && donationMethod !== 'all') {
      query.donationMethod = donationMethod;
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
          { donationId: { $regex: search, $options: 'i' } },
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

    // Parse items if sent as JSON string
    if (req.body.items && typeof req.body.items === 'string') {
      req.body.items = JSON.parse(req.body.items);
    }

    // Parse foodSafetyDetails if sent as JSON string
    if (req.body.foodSafetyDetails && typeof req.body.foodSafetyDetails === 'string') {
      req.body.foodSafetyDetails = JSON.parse(req.body.foodSafetyDetails);
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
      'In Transit',
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

// @desc    Search nearby NGOs / food banks
// @route   GET /api/donations/nearby-ngos
// @access  Private
const getNearbyNgos = async (req, res, next) => {
  try {
    const { city, pincode, state } = req.query;
    const query = { role: 'receiver', status: 'active' };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    } else if (pincode) {
      query.pincode = pincode;
    } else if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    const ngos = await User.find(query)
      .select('name organizationName email phone address city state pincode ngoDetails')
      .limit(20)
      .sort({ organizationName: 1 });

    res.json({
      success: true,
      data: ngos,
      total: ngos.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Smart match donation to an NGO
// @route   GET /api/donations/:id/match
// @access  Private
const matchDonorToNgo = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Find NGOs in same city first, then same state
    const matchQuery = {
      role: 'receiver',
      status: 'active',
    };

    // Priority 1: Same city
    const cityMatches = await User.find({
      ...matchQuery,
      city: { $regex: donation.city, $options: 'i' },
    })
      .select('name organizationName email phone city state pincode ngoDetails')
      .limit(10);

    // Priority 2: Same state (excluding already matched cities)
    const cityIds = cityMatches.map((n) => n._id);
    const stateMatches = await User.find({
      ...matchQuery,
      _id: { $nin: cityIds },
      state: { $regex: donation.state, $options: 'i' },
    })
      .select('name organizationName email phone city state pincode ngoDetails')
      .limit(5);

    // Score each match
    const scoredMatches = [...cityMatches, ...stateMatches].map((ngo) => {
      let score = 0;
      // City match = 40 points
      if (ngo.city && donation.city && ngo.city.toLowerCase() === donation.city.toLowerCase()) {
        score += 40;
      }
      // Food type match = 30 points
      if (
        ngo.ngoDetails &&
        ngo.ngoDetails.foodTypesAccepted &&
        ngo.ngoDetails.foodTypesAccepted.length > 0
      ) {
        const accepted = ngo.ngoDetails.foodTypesAccepted.map((f) => f.toLowerCase());
        if (accepted.includes(donation.category.toLowerCase()) || accepted.includes('all')) {
          score += 30;
        }
      } else {
        score += 15; // Default score if no preferences set
      }
      // Organization name = 10 points
      if (ngo.organizationName) score += 10;
      // Pincode match = 20 points
      if (ngo.pincode === donation.pincode) score += 20;

      return { ...ngo.toObject(), matchScore: score };
    });

    // Sort by score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: scoredMatches,
      donationId: donation.donationId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation certificate/receipt data
// @route   GET /api/donations/:id/certificate
// @access  Private
const getDonationCertificate = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id).populate(
      'donor',
      'name organizationName email phone city state'
    );

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only allow certificate for delivered/completed donations or for the donor
    if (
      donation.status !== 'Delivered' &&
      req.user.role !== 'admin' &&
      donation.donor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is available only for completed donations.',
      });
    }

    const request = await FoodRequest.findOne({
      donation: donation._id,
      status: 'Delivered',
    }).populate('receiver', 'name organizationName city');

    const certificate = {
      donationId: donation.donationId,
      donorName: donation.isAnonymous ? 'Anonymous Donor' : (donation.donor.organizationName || donation.donor.name),
      donorCity: donation.isAnonymous ? '' : donation.donor.city,
      foodName: donation.foodName,
      category: donation.category,
      quantity: donation.quantity,
      unit: donation.unit,
      items: donation.items,
      donationDate: donation.createdAt,
      completedDate: request?.completedAt || donation.updatedAt,
      receiverName: request?.receiver?.organizationName || request?.receiver?.name || 'Pending',
      receiverCity: request?.receiver?.city || '',
      status: donation.status,
      certificateNumber: `CERT-${donation.donationId}`,
      issuedAt: new Date(),
    };

    res.json({
      success: true,
      data: certificate,
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
  getNearbyNgos,
  matchDonorToNgo,
  getDonationCertificate,
};
