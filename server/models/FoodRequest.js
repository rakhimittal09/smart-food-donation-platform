const mongoose = require('mongoose');

const foodRequestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: [true, 'Donation reference is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver reference is required'],
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [1, 'Must request at least 1 unit'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message or distribution plan'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Picked Up', 'Delivered', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    pickupDetails: {
      scheduledDate: { type: Date },
      scheduledTime: { type: String, default: '' },
      pickupPersonName: { type: String, default: '' },
      pickupPersonPhone: { type: String, default: '' },
      vehicleNumber: { type: String, default: '' },
      notes: { type: String, default: '' },
      timeline: [
        {
          status: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, default: '' },
          timestamp: { type: Date, default: Date.now },
          updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
      ],
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, collection: 'pickuprequests' }
);

foodRequestSchema.index({ donation: 1, receiver: 1 });
foodRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('FoodRequest', foodRequestSchema);
