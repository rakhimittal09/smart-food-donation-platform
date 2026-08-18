const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      minlength: [2, 'Food name must be at least 2 characters'],
      maxlength: [150, 'Food name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Food description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Food category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['kg', 'meals', 'boxes', 'packets', 'servings', 'litres'],
      default: 'servings',
    },
    foodType: {
      type: String,
      required: [true, 'Food type is required'],
      enum: ['Veg', 'Non-Veg', 'Vegan', 'Egg'],
      default: 'Veg',
    },
    preparationDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    pickupTime: {
      type: String,
      required: [true, 'Pickup time slot is required'],
      trim: true,
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be 6 digits'],
    },
    contactName: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Available',
        'Requested',
        'Approved',
        'Pickup Scheduled',
        'Picked Up',
        'Delivered',
        'Completed',
        'Expired',
        'Cancelled',
      ],
      default: 'Available',
    },
  },
  { timestamps: true }
);

// Indexing for rapid search & filtering
foodDonationSchema.index({ foodName: 'text', description: 'text', city: 'text' });
foodDonationSchema.index({ status: 1, expiryDate: 1, city: 1, category: 1 });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
