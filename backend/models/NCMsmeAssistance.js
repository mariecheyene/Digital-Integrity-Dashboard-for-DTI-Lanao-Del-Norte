const mongoose = require('mongoose');

const NCMsmeAssistanceSchema = new mongoose.Schema({
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
  target: {
    type: Number,
    required: true,
    min: 0
  },
  accomplishment: {
    type: Number,
    required: true,
    min: 0
  },
  agency: {
    type: String,
    required: true,
    enum: ['LGU', 'DTI Provincial Office', 'DTI Regional Office', 'Cooperative', 'NGO', 'Others']
  },
  agencyOther: {
    type: String,
    default: ''
  },
  percentAccomplishment: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['On Target', 'Below Target'],
    default: 'On Target'
  },
  notes: {
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

// Calculate percent before saving
NCMsmeAssistanceSchema.pre('save', function(next) {
  if (this.target > 0) {
    this.percentAccomplishment = (this.accomplishment / this.target) * 100;
  } else {
    this.percentAccomplishment = 0;
  }
  
  // Set status based on accomplishment
  if (this.accomplishment >= this.target) {
    this.status = 'On Target';
  } else {
    this.status = 'Below Target';
  }
  
  // If agency is "Others", ensure agencyOther is provided
  if (this.agency === 'Others' && !this.agencyOther) {
    this.agencyOther = 'Other Agency';
  }
  
  next();
});

module.exports = mongoose.model('NCMsmeAssistance', NCMsmeAssistanceSchema);