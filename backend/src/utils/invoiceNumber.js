const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  seq: {
    type: Number,
    required: true,
    default: 0
  }
});

// Enforce compound uniqueness for freelancerId + year
counterSchema.index({ freelancerId: 1, year: 1 }, { unique: true });

/**
 * Static method to atomically increment sequence and retrieve the next formatted invoice number
 * @param {mongoose.Types.ObjectId} freelancerId - Freelancer owner ID
 * @returns {Promise<string>} Formatted invoice number (e.g. FF-2026-0001)
 */
counterSchema.statics.nextInvoiceNumber = async function(freelancerId) {
  const currentYear = new Date().getFullYear();

  const counter = await this.findOneAndUpdate(
    { freelancerId, year: currentYear },
    { $inc: { seq: 1 } },
    { 
      new: true, 
      upsert: true, 
      setDefaultsOnInsert: true 
    }
  );

  // Pad the sequence with leading zeros to 4 digits
  const paddedSeq = String(counter.seq).padStart(4, '0');
  
  return `FF-${currentYear}-${paddedSeq}`;
};

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
