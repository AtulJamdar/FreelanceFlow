const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  businessName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for password input
userSchema.virtual('password')
  .set(function(password) {
    this._password = password;
  })
  .get(function() {
    return this._password;
  });

// Pre-validate hook to hash password virtual before validating
userSchema.pre('validate', async function(next) {
  // Hash the password if the virtual password was set or if passwordHash is being modified
  if (this._password) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.passwordHash = await bcrypt.hash(this._password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function(candidate) {
  // Since passwordHash has select: false, it might not be populated on the document.
  // The caller is responsible for ensuring passwordHash is available.
  if (!this.passwordHash) {
    throw new Error('Password hash is not loaded on this document');
  }
  return bcrypt.compare(candidate, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
