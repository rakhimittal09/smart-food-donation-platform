const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../services/logService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      organizationName,
      address,
      city,
      state,
      pincode,
      avatar,
      serviceAreas,
      availability,
      vehicleType,
      ngoDetails,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (avatar !== undefined) user.avatar = avatar;
    // Volunteer fields
    if (serviceAreas !== undefined) user.serviceAreas = serviceAreas;
    if (availability !== undefined) user.availability = availability;
    if (vehicleType !== undefined) user.vehicleType = vehicleType;
    // NGO fields
    if (ngoDetails !== undefined) {
      user.ngoDetails = { ...user.ngoDetails, ...ngoDetails };
    }

    const updatedUser = await user.save();

    await logActivity({
      userId: user._id,
      action: 'PROFILE_UPDATED',
      description: `${user.name} updated their profile`,
      module: 'PROFILE',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password entered is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      userId: user._id,
      action: 'PASSWORD_CHANGED',
      description: `${user.name} changed their account password`,
      module: 'PROFILE',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Password changed successfully! Please use your new password next time.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get role-specific dashboard statistics
// @route   GET /api/users/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'donor') {
      const totalDonations = await FoodDonation.countDocuments({ donor: userId });
      const activeDonations = await FoodDonation.countDocuments({
        donor: userId,
        status: { $in: ['Available', 'Pending', 'Accepted', 'In Transit', 'Picked Up'] },
      });
      const completedDonations = await FoodDonation.countDocuments({
        donor: userId,
        status: 'Delivered',
      });

      // Get user's donations IDs
      const userDonationIds = await FoodDonation.find({ donor: userId }).distinct('_id');
      const pendingRequests = await FoodRequest.countDocuments({
        donation: { $in: userDonationIds },
        status: 'Pending',
      });

      // Impact metrics
      const impactAgg = await FoodDonation.aggregate([
        { $match: { donor: userId, status: 'Delivered' } },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalDonationCount: { $sum: 1 },
          },
        },
      ]);
      const impact = impactAgg[0] || { totalQuantity: 0, totalDonationCount: 0 };

      const recentDonations = await FoodDonation.find({ donor: userId })
        .sort({ createdAt: -1 })
        .limit(5);

      const recentRequests = await FoodRequest.find({
        donation: { $in: userDonationIds },
      })
        .populate('receiver', 'name organizationName phone email')
        .populate('donation', 'foodName quantity unit donationId')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentActivities = await ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(6);

      return res.json({
        success: true,
        data: {
          totalDonations,
          activeDonations,
          completedDonations,
          pendingRequests,
          impact: {
            totalQuantityDelivered: impact.totalQuantity,
            mealsServedEstimate: Math.round(impact.totalQuantity * 3),
            co2SavedKg: Math.round(impact.totalQuantity * 2.5),
          },
          recentDonations,
          recentRequests,
          recentActivities,
        },
      });
    }

    if (role === 'receiver') {
      const availableDonations = await FoodDonation.countDocuments({
        status: 'Available',
        expiryDate: { $gt: new Date() },
      });

      const myRequestsTotal = await FoodRequest.countDocuments({ receiver: userId });
      const pendingRequests = await FoodRequest.countDocuments({
        receiver: userId,
        status: 'Pending',
      });
      const approvedRequests = await FoodRequest.countDocuments({
        receiver: userId,
        status: 'Accepted',
      });
      const completedPickups = await FoodRequest.countDocuments({
        receiver: userId,
        status: 'Delivered',
      });

      const recentRequests = await FoodRequest.find({ receiver: userId })
        .populate({
          path: 'donation',
          populate: { path: 'donor', select: 'name organizationName phone' },
        })
        .sort({ createdAt: -1 })
        .limit(5);

      const urgentDonations = await FoodDonation.find({
        status: 'Available',
        expiryDate: { $gt: new Date() },
      })
        .populate('donor', 'name organizationName city')
        .sort({ expiryDate: 1 })
        .limit(4);

      const recentActivities = await ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(6);

      return res.json({
        success: true,
        data: {
          availableDonations,
          myRequestsTotal,
          pendingRequests,
          approvedRequests,
          completedPickups,
          recentRequests,
          urgentDonations,
          recentActivities,
        },
      });
    }

    if (role === 'volunteer') {
      // Volunteer can see pickups assigned/available in their city
      const assignedPickups = await FoodRequest.countDocuments({
        'pickupDetails.pickupPersonName': req.user.name,
        status: { $in: ['Accepted', 'Picked Up'] },
      });
      const completedDeliveries = await FoodRequest.countDocuments({
        'pickupDetails.pickupPersonName': req.user.name,
        status: 'Delivered',
      });

      // Available pickups in volunteer's city
      const availablePickups = await FoodDonation.find({
        status: { $in: ['Accepted'] },
        city: { $regex: req.user.city || '', $options: 'i' },
      })
        .populate('donor', 'name organizationName phone city')
        .sort({ pickupDate: 1 })
        .limit(10);

      const recentActivities = await ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(6);

      return res.json({
        success: true,
        data: {
          assignedPickups,
          completedDeliveries,
          availablePickups,
          recentActivities,
        },
      });
    }

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalDonors = await User.countDocuments({ role: 'donor' });
      const totalReceivers = await User.countDocuments({ role: 'receiver' });
      const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
      const totalDonations = await FoodDonation.countDocuments();
      const activeDonations = await FoodDonation.countDocuments({
        status: { $in: ['Available', 'Pending', 'Accepted', 'In Transit', 'Picked Up'] },
      });
      const completedDonations = await FoodDonation.countDocuments({
        status: 'Delivered',
      });
      const totalRequests = await FoodRequest.countDocuments();
      const pendingRequests = await FoodRequest.countDocuments({ status: 'Pending' });
      const completedPickups = await FoodRequest.countDocuments({ status: 'Delivered' });

      const recentActivities = await ActivityLog.find()
        .populate('user', 'name role email')
        .sort({ createdAt: -1 })
        .limit(8);

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalDonors,
          totalReceivers,
          totalVolunteers,
          totalDonations,
          activeDonations,
          completedDonations,
          totalRequests,
          pendingRequests,
          completedPickups,
          recentActivities,
        },
      });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getDashboardStats,
};
