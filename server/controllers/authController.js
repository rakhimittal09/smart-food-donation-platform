const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../services/logService');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'donor',
      organizationName,
      address,
      city,
      state,
      pincode,
    } = req.body;

    // Critical Security Check: Public registration MUST NOT allow admin accounts
    if (role === 'admin' || (role && !['donor', 'receiver'].includes(role))) {
      return res.status(400).json({
        success: false,
        message: 'Registration with administrative privileges is prohibited. Admin accounts must be created through secure system provisioning.',
      });
    }

    const assignedRole = role === 'receiver' ? 'receiver' : 'donor';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: assignedRole,
      organizationName: organizationName || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
    });

    const token = generateToken(user._id);

    // Record activity log
    await logActivity({
      userId: user._id,
      action: 'USER_REGISTERED',
      description: `User ${user.name} registered with role ${user.role}`,
      module: 'AUTH',
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check user existence with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if user account is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const token = generateToken(user._id);

    // Record activity log
    await logActivity({
      userId: user._id,
      action: 'USER_LOGGED_IN',
      description: `${user.name} (${user.role}) logged in`,
      module: 'AUTH',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
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

// @desc    Logout user (client clears token)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity({
        userId: req.user._id,
        action: 'USER_LOGGED_OUT',
        description: `${req.user.name} logged out`,
        module: 'AUTH',
        ipAddress: req.ip,
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
