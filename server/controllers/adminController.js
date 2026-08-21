const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');
const ActivityLog = require('../models/ActivityLog');
const Setting = require('../models/Setting');
const { logActivity } = require('../services/logService');

// @desc    Get all users with search & filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: users,
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

// @desc    Change user status (active/blocked)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect against self-blocking
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block your own admin account.' });
    }

    user.status = status;
    await user.save();

    await logActivity({
      userId: req.user._id,
      action: 'ADMIN_USER_STATUS_UPDATED',
      description: `Admin changed status of ${user.name} (${user.email}) to ${status}`,
      module: 'ADMIN',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      userId: req.user._id,
      action: 'ADMIN_USER_DELETED',
      description: `Admin deleted user ${user.name} (${user.email})`,
      module: 'ADMIN',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'User removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive system analytics & reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const getReports = async (req, res, next) => {
  try {
    // 1. Core Summary Numbers
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalReceivers = await User.countDocuments({ role: 'receiver' });
    const totalDonations = await FoodDonation.countDocuments();
    const completedDonations = await FoodDonation.countDocuments({
      status: 'Delivered',
    });
    const activeDonations = await FoodDonation.countDocuments({
      status: { $in: ['Available', 'Pending', 'Accepted', 'Picked Up'] },
    });
    const totalRequests = await FoodRequest.countDocuments();
    const completedPickups = await FoodRequest.countDocuments({ status: 'Delivered' });

    // 2. Donations by Category
    const donationsByCategory = await FoodDonation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Donations by City
    const donationsByCity = await FoodDonation.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // 4. Donations by Food Type
    const donationsByType = await FoodDonation.aggregate([
      { $group: { _id: '$foodType', count: { $sum: 1 } } },
    ]);

    // 5. Monthly Donation Counts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyDonations = await FoodDonation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 6. Top Donors
    const topDonors = await FoodDonation.aggregate([
      { $group: { _id: '$donor', totalDonations: { $sum: 1 } } },
      { $sort: { totalDonations: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donorInfo',
        },
      },
      { $unwind: '$donorInfo' },
      {
        $project: {
          _id: 1,
          totalDonations: 1,
          name: '$donorInfo.name',
          email: '$donorInfo.email',
          organizationName: '$donorInfo.organizationName',
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalDonors,
          totalReceivers,
          totalDonations,
          activeDonations,
          completedDonations,
          totalRequests,
          completedPickups,
        },
        donationsByCategory,
        donationsByCity,
        donationsByType,
        monthlyDonations,
        topDonors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (Admin only)
const getActivityLogs = async (req, res, next) => {
  try {
    const { module, page = 1, limit = 20 } = req.query;
    const query = {};
    if (module && module !== 'all') query.module = module;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: logs,
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

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update/Create platform setting
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
const updateSetting = async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  deleteUser,
  getReports,
  getActivityLogs,
  getSettings,
  updateSetting,
};
