const FoodRequest = require('../models/FoodRequest');
const FoodDonation = require('../models/FoodDonation');
const { logActivity } = require('../services/logService');
const { sendNotification } = require('../services/notificationService');

// @desc    Create a food request
// @route   POST /api/requests
// @access  Private (Receiver only)
const createRequest = async (req, res, next) => {
  try {
    const {
      donationId,
      requestedQuantity,
      message,
      pickupPersonName,
      pickupPersonPhone,
      vehicleNumber,
      notes,
    } = req.body;

    const donation = await FoodDonation.findById(donationId).populate('donor');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Food donation not found' });
    }

    if (donation.status !== 'Available' && donation.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot request this food. Current status is ${donation.status}.`,
      });
    }

    if (new Date(donation.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This food donation has expired and can no longer be requested.',
      });
    }

    if (Number(requestedQuantity) > donation.quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${requestedQuantity}) exceeds available quantity (${donation.quantity} ${donation.unit}).`,
      });
    }

    // Check if receiver already has a pending request for this donation
    const existingReq = await FoodRequest.findOne({
      donation: donationId,
      receiver: req.user._id,
      status: 'Pending',
    });
    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this donation.',
      });
    }

    const request = await FoodRequest.create({
      donation: donationId,
      receiver: req.user._id,
      requestedQuantity: Number(requestedQuantity),
      message,
      status: 'Pending',
      requestedAt: new Date(),
      pickupDetails: {
        scheduledDate: donation.pickupDate,
        scheduledTime: donation.pickupTime,
        pickupPersonName: pickupPersonName || req.user.name,
        pickupPersonPhone: pickupPersonPhone || req.user.phone,
        vehicleNumber: vehicleNumber || '',
        notes: notes || '',
        timeline: [
          {
            status: 'Pending',
            title: 'Pickup Requested',
            description: `NGO requested ${requestedQuantity} ${donation.unit} of "${donation.foodName}"`,
            timestamp: new Date(),
            updatedBy: req.user._id,
          },
        ],
      },
    });

    if (donation.status === 'Available') {
      donation.status = 'Pending';
      await donation.save();
    }

    // Log action
    await logActivity({
      userId: req.user._id,
      action: 'REQUEST_CREATED',
      description: `Requested ${requestedQuantity} ${donation.unit} of "${donation.foodName}"`,
      module: 'REQUEST',
      ipAddress: req.ip,
    });

    // Notify Donor
    await sendNotification({
      userId: donation.donor._id,
      title: 'New Food Request Received',
      message: `${req.user.organizationName || req.user.name} requested ${requestedQuantity} ${donation.unit} of "${donation.foodName}".`,
      type: 'info',
      link: `/requests`,
    });

    res.status(201).json({
      success: true,
      message: 'Food request submitted successfully! Awaiting donor approval.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food requests (Role-filtered)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by role
    if (req.user.role === 'receiver') {
      query.receiver = req.user._id;
    } else if (req.user.role === 'donor') {
      // Find all donations belonging to this donor
      const donorDonations = await FoodDonation.find({ donor: req.user._id }).distinct('_id');
      query.donation = { $in: donorDonations };
    }
    // Admin sees all

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await FoodRequest.countDocuments(query);
    const requests = await FoodRequest.find(query)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name organizationName phone email city pickupAddress' },
      })
      .populate('receiver', 'name organizationName phone email city address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: requests,
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

// @desc    Get single food request
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await FoodRequest.findById(req.params.id)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name organizationName phone email city pickupAddress state pincode' },
      })
      .populate('receiver', 'name organizationName phone email city address state pincode');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Security check: only donor, receiver, or admin can view
    const isDonor = request.donation?.donor?._id?.toString() === req.user._id.toString();
    const isReceiver = request.receiver?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isReceiver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this request.',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status / Pickup Tracking status
// @route   PUT /api/requests/:id/status
// @access  Private
const updateRequestStatus = async (req, res, next) => {
  try {
    const {
      status,
      rejectionReason,
      pickupPersonName,
      pickupPersonPhone,
      vehicleNumber,
      notes,
    } = req.body;

    const request = await FoodRequest.findById(req.params.id)
      .populate('donation')
      .populate('receiver');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const donation = await FoodDonation.findById(request.donation._id);
    const isDonor = donation.donor.toString() === req.user._id.toString();
    const isReceiver = request.receiver._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isReceiver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this request.',
      });
    }

    // Pickup lifecycle: Pending → Accepted → Picked Up → Delivered
    if (status === 'Accepted') {
      if (!isDonor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only donors can accept pickup requests.' });
      }
      if (request.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Only pending requests can be accepted.' });
      }
      request.status = 'Accepted';
      request.approvedAt = new Date();
      donation.status = 'Accepted';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Accepted',
        title: 'Pickup Accepted',
        description: 'Donor accepted the pickup request. NGO may collect the food.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: request.receiver._id,
        title: 'Pickup Request Accepted',
        message: `Your request for "${donation.foodName}" was accepted. Please proceed with pickup.`,
        type: 'success',
        link: `/pickup-tracking/${request._id}`,
      });
    } else if (status === 'Rejected') {
      if (!isDonor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only donors can reject requests.' });
      }
      request.status = 'Rejected';
      request.rejectedAt = new Date();
      request.rejectionReason = rejectionReason || 'Not specified';
      
      // Revert donation status to Available if no other active approvals
      donation.status = 'Available';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Rejected',
        title: 'Request Rejected',
        description: `Reason: ${rejectionReason || 'No reason provided'}`,
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: request.receiver._id,
        title: 'Food Request Update',
        message: `Your request for "${donation.foodName}" could not be accepted.`,
        type: 'warning',
        link: `/requests`,
      });
    } else if (status === 'Cancelled') {
      if (!isReceiver && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the requesting NGO can cancel this request.' });
      }
      request.status = 'Cancelled';
      donation.status = 'Available';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Cancelled',
        title: 'Request Cancelled',
        description: 'Cancelled by receiver',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });
    } else if (status === 'Picked Up') {
      if (!isReceiver && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the receiving NGO can mark food as picked up.' });
      }
      if (request.status !== 'Accepted') {
        return res.status(400).json({ success: false, message: 'Pickup can be marked only after the request is accepted.' });
      }
      request.status = 'Picked Up';
      donation.status = 'Picked Up';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Picked Up',
        title: 'Food Picked Up',
        description: 'NGO collected the surplus food from the donor location.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: donation.donor,
        title: 'Food Picked Up',
        message: `${request.receiver.organizationName || request.receiver.name} has picked up "${donation.foodName}".`,
        type: 'info',
        link: `/pickup-tracking/${request._id}`,
      });
    } else if (status === 'Delivered') {
      if (!isDonor && !isReceiver && !isAdmin) {
        return res.status(403).json({ success: false, message: 'You cannot mark this pickup as delivered.' });
      }
      if (request.status !== 'Picked Up') {
        return res.status(400).json({ success: false, message: 'Delivery can be confirmed only after pickup.' });
      }
      request.status = 'Delivered';
      request.completedAt = new Date();
      donation.status = 'Delivered';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Delivered',
        title: 'Food Delivered',
        description: 'Surplus food was delivered to beneficiaries by the NGO.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: donation.donor,
        title: 'Donation Delivered',
        message: `"${donation.foodName}" has been delivered to those in need.`,
        type: 'success',
        link: `/donations/${donation._id}`,
      });

      await sendNotification({
        userId: request.receiver._id,
        title: 'Pickup Delivered',
        message: `Thank you for delivering "${donation.foodName}" to the community.`,
        type: 'success',
        link: `/requests`,
      });
    } else if (status && !['Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use Pending → Accepted → Picked Up → Delivered.',
      });
    }

    // Update optional pickup details if provided
    if (pickupPersonName) request.pickupDetails.pickupPersonName = pickupPersonName;
    if (pickupPersonPhone) request.pickupDetails.pickupPersonPhone = pickupPersonPhone;
    if (vehicleNumber) request.pickupDetails.vehicleNumber = vehicleNumber;
    if (notes) request.pickupDetails.notes = notes;

    await request.save();

    if (status) {
      await logActivity({
        userId: req.user._id,
        action: `PICKUP_${status.toUpperCase().replace(/\s+/g, '_')}`,
        description: `Pickup for "${donation.foodName}" updated to ${status}`,
        module: 'PICKUP',
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: status ? `Request status updated to ${status}` : 'Pickup details updated',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
};
