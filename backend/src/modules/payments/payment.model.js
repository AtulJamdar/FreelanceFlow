const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required']
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'Invoice ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than zero']
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['bank_transfer', 'upi', 'cash', 'paypal', 'other'],
      message: 'Method must be: bank_transfer, upi, cash, paypal, or other'
    },
    default: 'bank_transfer'
  },
  referenceNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for nested invoice queries
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ freelancerId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
