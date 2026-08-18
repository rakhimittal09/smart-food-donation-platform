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

    if (donation.status !== 'Available' && donation.status !== 'Requested') {
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

    // Generate random 4-digit OTP for pickup verification
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();

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
        otp: pickupOtp,
        timeline: [
          {
            status: 'Requested',
            title: 'Request Submitted',
            description: `NGO requested ${requestedQuantity} ${donation.unit}`,
            timestamp: new Date(),
            updatedBy: req.user._id,
          },
        ],
      },
    });

    // Update donation status if still Available
    if (donation.status === 'Available') {
      donation.status = 'Requested';
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
      otp,
      rejectionReason,
      pickupPersonName,
      pickupPersonPhone,
      vehicleNumber,
      notes,
      timelineNote,
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

    // Role-specific actions
    if (status === 'Approved') {
      if (!isDonor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only donors can approve requests.' });
      }
      request.status = 'Approved';
      request.approvedAt = new Date();
      donation.status = 'Approved';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Approved',
        title: 'Request Approved',
        description: 'Donor approved the food request. Pickup can be scheduled.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: request.receiver._id,
        title: 'Food Request Approved! 🎉',
        message: `Your request for "${donation.foodName}" was approved. Please prepare for pickup.`,
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
    } else if (status === 'Pickup Scheduled') {
      if (!isDonor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only donors can schedule pickup.' });
      }
      request.status = 'Pickup Scheduled';
      donation.status = 'Pickup Scheduled';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Pickup Scheduled',
        title: 'Pickup Scheduled',
        description: 'Donor has confirmed and scheduled the pickup. Volunteer en route soon.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: request.receiver._id,
        title: 'Pickup Scheduled 📅',
        message: `Pickup for "${donation.foodName}" has been scheduled. Please prepare your volunteer.`,
        type: 'info',
        link: `/pickup-tracking/${request._id}`,
      });
    } else if (status === 'Out for Pickup') {
      if (!isReceiver && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the receiver can mark as Out for Pickup.' });
      }
      request.status = 'Out for Pickup';
      donation.status = 'Pickup Scheduled';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Out for Pickup',
        title: 'Volunteer Out for Pickup',
        description: 'NGO volunteer is on the way to collect the food donation.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: donation.donor,
        title: 'Volunteer En Route 🚚',
        message: `A volunteer from ${request.receiver.organizationName || request.receiver.name} is on the way to collect "${donation.foodName}".`,
        type: 'info',
        link: `/requests`,
      });
    } else if (status === 'Completed') {
      if (!isDonor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the donor or administrator can confirm food handover completion.' });
      }

      // Verify OTP if donor is confirming (or if otp is provided)
      if (isDonor && !isAdmin) {
        if (!otp || otp.toString().trim() !== request.pickupDetails?.otp?.toString().trim()) {
          return res.status(400).json({
            success: false,
            message: 'Invalid pickup verification PIN/OTP. Please enter the 4-digit code provided by the NGO receiver.',
          });
        }
      }

      request.status = 'Completed';
      request.completedAt = new Date();
      donation.status = 'Completed';
      await donation.save();

      request.pickupDetails.timeline.push({
        status: 'Completed',
        title: 'Food Handover Completed',
        description: 'Food was successfully verified with pickup OTP and distributed.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });

      await sendNotification({
        userId: donation.donor,
        title: 'Donation Completed! 🌟',
        message: `"${donation.foodName}" has been successfully collected and distributed to those in need!`,
        type: 'success',
        link: `/donations/${donation._id}`,
      });

      await sendNotification({
        userId: request.receiver._id,
        title: 'Pickup Completed',
        message: `Thank you for distributing "${donation.foodName}" to the community!`,
        type: 'success',
        link: `/requests`,
      });
    }

    // Update optional pickup details if provided
    if (pickupPersonName) request.pickupDetails.pickupPersonName = pickupPersonName;
    if (pickupPersonPhone) request.pickupDetails.pickupPersonPhone = pickupPersonPhone;
    if (vehicleNumber) request.pickupDetails.vehicleNumber = vehicleNumber;
    if (notes) request.pickupDetails.notes = notes;

    await request.save();

    await logActivity({
      userId: req.user._id,
      action: `REQUEST_${status.toUpperCase()}`,
      description: `Request for "${donation.foodName}" updated to ${status}`,
      module: 'REQUEST',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
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
