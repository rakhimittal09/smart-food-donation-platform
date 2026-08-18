const Category = require('../models/Category');
const FoodDonation = require('../models/FoodDonation');
const { logActivity } = require('../services/logService');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, status } = req.body;

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description: description || '',
      icon: icon || '🍱',
      status: status || 'active',
    });

    await logActivity({
      userId: req.user._id,
      action: 'CATEGORY_CREATED',
      description: `Created category: ${category.name}`,
      module: 'CATEGORY',
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, status },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await logActivity({
      userId: req.user._id,
      action: 'CATEGORY_UPDATED',
      description: `Updated category: ${category.name}`,
      module: 'CATEGORY',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Category updated successfully!',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Safety check: prevent deletion if active donations use this category
    const activeDonationsCount = await FoodDonation.countDocuments({
      category: category.name,
    });

    if (activeDonationsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${activeDonationsCount} food donation(s) are currently associated with it.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    await logActivity({
      userId: req.user._id,
      action: 'CATEGORY_DELETED',
      description: `Deleted category: ${category.name}`,
      module: 'CATEGORY',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
