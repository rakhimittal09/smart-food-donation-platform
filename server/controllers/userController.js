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
        status: { $in: ['Available', 'Pending', 'Accepted', 'Picked Up'] },
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

      const recentDonations = await FoodDonation.find({ donor: userId })
        .sort({ createdAt: -1 })
        .limit(5);

      const recentRequests = await FoodRequest.find({
        donation: { $in: userDonationIds },
      })
        .populate('receiver', 'name organizationName phone email')
        .populate('donation', 'foodName quantity unit')
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

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalDonors = await User.countDocuments({ role: 'donor' });
      const totalReceivers = await User.countDocuments({ role: 'receiver' });
      const totalDonations = await FoodDonation.countDocuments();
      const activeDonations = await FoodDonation.countDocuments({
        status: { $in: ['Available', 'Pending', 'Accepted', 'Picked Up'] },
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
