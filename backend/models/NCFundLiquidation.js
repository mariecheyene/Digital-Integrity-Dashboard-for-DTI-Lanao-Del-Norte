const mongoose = require('mongoose');

const NCFundLiquidationSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  availableFunds: {
    type: Number,
    required: true,
    min: 0
  },
  liquidatedFunds: {
    type: Number,
    required: true,
    min: 0
  },
  percentDisbursed: {
    type: Number,
    default: 0
  },
  fundsRemaining: {
    type: Number,
    default: 0
  },
  purpose: {
    type: String,
    enum: ['MSME Assistance', 'Operational Expenses', 'Training Programs', 'Others'],
    default: 'MSME Assistance'
  },
  purposeOther: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate before saving
NCFundLiquidationSchema.pre('save', function(next) {
  // Ensure liquidated funds don't exceed available funds
  if (this.liquidatedFunds > this.availableFunds) {
    this.liquidatedFunds = this.availableFunds;
  }
  
  this.fundsRemaining = this.availableFunds - this.liquidatedFunds;
  
  if (this.availableFunds > 0) {
    this.percentDisbursed = (this.liquidatedFunds / this.availableFunds) * 100;
  } else {
    this.percentDisbursed = 0;
  }
  
  // If purpose is "Others", ensure purposeOther is provided
  if (this.purpose === 'Others' && !this.purposeOther) {
    this.purposeOther = 'Other Purpose';
  }
  
  next();
});

module.exports = mongoose.model('NCFundLiquidation', NCFundLiquidationSchema);