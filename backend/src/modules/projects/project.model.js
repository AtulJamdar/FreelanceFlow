const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['not_started', 'in_progress', 'on_hold', 'completed'],
      message: 'Status must be one of: not_started, in_progress, on_hold, completed'
    },
    default: 'not_started'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  deadline: {
    type: Date
  },
  totalBudget: {
    type: Number,
    min: [0, 'Total budget cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for query performance and user scoping
projectSchema.index({ freelancerId: 1 });
projectSchema.index({ freelancerId: 1, clientId: 1 });
projectSchema.index({ freelancerId: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
