const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a customer name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  serviceType: {
    type: String,
    default: 'General',
    trim: true
  },
  status: {
    type: String,
    enum: ['Waiting', 'Being Served', 'Completed'],
    default: 'Waiting'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  servedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
