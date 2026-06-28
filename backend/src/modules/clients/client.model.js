const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required']
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Compound unique index to enforce email uniqueness *per freelancer*
clientSchema.index({ freelancerId: 1, email: 1 }, { unique: true });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
