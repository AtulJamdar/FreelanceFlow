const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required']
  },
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  amount: {
    type: Number,
    min: [0, 'Milestone amount cannot be negative']
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for query performance
milestoneSchema.index({ projectId: 1 });
milestoneSchema.index({ freelancerId: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
