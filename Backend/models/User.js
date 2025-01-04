const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    enum: ['us', 'canada', 'india', 'uk', 'australia', 'other']
  },
  visaStatus: {
    type: String,
    required: [true, 'Visa status is required'],
    enum: ['citizen', 'h1b', 'f1', 'other']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    enum: ['bachelor', 'master', 'phd', 'diploma', 'other']
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    enum: ['harvard', 'mit', 'stanford', 'other']
  },
  major: {
    type: String,
    required: [true, 'Major/Specialization is required']
    // enum: ['computerScience', 'computerEngineering', 'mathematics', 'other']
  },
  skills: { type: [String], required: true },
  startDate: {
    type: Date,
    // required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    // required: [true, 'End date is required']
  },
  savedJobs: [{
    title: String,
    company: String,
    description: String,
    matchScore: Number,
    analyzedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// // Create the User model based on the schema
// const User = mongoose.model('User', userSchema);

// module.exports = User;


// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {

  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);