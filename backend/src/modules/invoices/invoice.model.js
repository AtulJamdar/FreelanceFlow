const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Line item description is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Line item quantity is required'],
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Line item unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Line item total cannot be negative']
  }
});

const invoiceSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['draft', 'sent', 'partially_paid', 'paid', 'overdue'],
      message: 'Status must be: draft, sent, partially_paid, paid, or overdue'
    },
    default: 'draft'
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  lineItems: {
    type: [lineItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items.length > 0;
      },
      message: 'Invoice must contain at least 1 line item'
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  sentAt: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for cron jobs and status-based freelancer queries
invoiceSchema.index({ freelancerId: 1, status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
