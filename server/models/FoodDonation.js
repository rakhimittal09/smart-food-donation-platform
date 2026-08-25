const mongoose = require('mongoose');

// Helper to generate unique donation ID
function generateDonationId() {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DON-${dateStr}-${rand}`;
}

const donationItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Item category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'grams', 'litres', 'packets', 'bags', 'pieces', 'meals', 'boxes', 'servings'],
      default: 'kg',
    },
  },
  { _id: false }
);

const foodDonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
    },
    donationId: {
      type: String,
      unique: true,
      default: generateDonationId,
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
      enum: ['kg', 'grams', 'litres', 'packets', 'bags', 'pieces', 'meals', 'boxes', 'servings'],
      default: 'servings',
    },
    // Multi-item donations
    items: {
      type: [donationItemSchema],
      default: [],
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
    // Donation Method
    donationMethod: {
      type: String,
      enum: ['ngo_pickup', 'self_delivery', 'arrange_pickup', 'choose_ngo', 'need_help'],
      default: 'ngo_pickup',
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
    deliveryAddress: {
      type: String,
      trim: true,
      default: '',
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
        'Pending',
        'Accepted',
        'In Transit',
        'Picked Up',
        'Delivered',
        'Expired',
        'Cancelled',
      ],
      default: 'Available',
    },
    // Recurring donations
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', ''],
      default: '',
    },
    // Anonymous donation
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Food safety details
    foodSafetyDetails: {
      storageType: {
        type: String,
        enum: ['room_temperature', 'refrigerated', 'frozen', 'hot', ''],
        default: '',
      },
      temperatureControlled: {
        type: Boolean,
        default: false,
      },
      allergens: {
        type: String,
        trim: true,
        default: '',
      },
      certifications: {
        type: String,
        trim: true,
        default: '',
      },
    },
    // Smart matching
    matchedNgo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true, collection: 'foodlistings' }
);

// Indexing for rapid search & filtering
foodDonationSchema.index({ foodName: 'text', description: 'text', city: 'text' });
foodDonationSchema.index({ status: 1, expiryDate: 1, city: 1, category: 1 });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
