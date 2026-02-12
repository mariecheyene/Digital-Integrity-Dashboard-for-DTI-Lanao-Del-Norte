const mongoose = require('mongoose');

// Enum definitions - Keep as is but we'll make validation more flexible for imports
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const genders = ['Male', 'Female', 'Prefer not to say', 'Others'];

const priorityIndustries = [
  'Agriculture', 'Aquaculture', 'Food Processing', 'Manufacturing',
  'Retail/Wholesale', 'Services', 'Construction', 'Transportation',
  'Education', 'Healthcare', 'Tourism/Hospitality', 'IT/BPO',
  'Creative Industries', 'Others'
];

const edtLevels = [
  'Level 1 - MSME', 'Level 2 - SME', 'Level 3 - Large Enterprise',
  'Not Applicable'
];

const typesOfAssistance = [
  'Business Advisory', 'Financial Assistance', 'Marketing Assistance',
  'Product Development', 'Training/Seminar', 'Mentoring/Coaching',
  'Linking/Networking', 'Technical Assistance', 'Others'
];

const strategicMeasures = [
  'Increased Access to Finance',
  'Enhanced Market Access',
  'Improved Productivity and Efficiency',
  'Strengthened Business Resilience',
  'Digital Transformation',
  'Regulatory Compliance Assistance',
  'Others'
];

const NCdataSchema = new mongoose.Schema({
  // Timestamp and Basic Info
  timeStamp: {
    type: Date,
    default: Date.now,
    required: [true, 'Timestamp is required'],
    index: true
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: {
      values: months,
      message: '{VALUE} is not a valid month'
    },
    default: function() {
      return months[new Date().getMonth()];
    }
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: function() {
      return new Date().getFullYear();
    }
  },
  unit: {
    type: String,
    trim: true,
    default: '' // Make optional for import
  },
  
  // Personnel Information
  assistedBy: {
    type: String,
    trim: true,
    default: '' // Make optional for import
  },
  ownerName: {
    type: String,
    trim: true,
    default: '' // Make optional for import
  },
  gender: {
    type: String,
    enum: {
      values: genders,
      message: '{VALUE} is not a valid gender'
    },
    default: 'Prefer not to say' // Default value
  },
  genderOther: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Business Information
  businessName: {
    type: String,
    trim: true,
    default: '' // Make optional for import
  },
  cityMunicipality: {
    type: String,
    trim: true,
    default: '' // Make optional for import
  },
  priorityIndustry: {
    type: String,
    enum: {
      values: priorityIndustries,
      message: '{VALUE} is not a valid priority industry'
    },
    default: 'Others' // Default value
  },
  priorityIndustryOther: {
    type: String,
    trim: true,
    default: ''
  },
  
  // EDT Information
  edtLevel: {
    type: String,
    enum: {
      values: edtLevels,
      message: '{VALUE} is not a valid EDT level'
    },
    default: 'Not Applicable' // Default value
  },
  
  // Assistance Information
  typeOfAssistance: {
    type: String,
    enum: {
      values: typesOfAssistance,
      message: '{VALUE} is not a valid type of assistance'
    },
    default: 'Others' // Default value
  },
  typeOfAssistanceOther: {
    type: String,
    trim: true,
    default: ''
  },
  
  strategicMeasure: {
    type: String,
    enum: {
      values: strategicMeasures,
      message: '{VALUE} is not a valid strategic measure'
    },
    default: 'Others' // Default value
  },
  strategicMeasureOther: {
    type: String,
    trim: true,
    default: ''
  },
  
  assistanceTitle: {
    type: String,
    trim: true,
    default: '' // Make optional for import
  },
  assistanceDate: {
    type: Date,
    default: Date.now // Default to now
  },
  
  // E-commerce Information
  ecommerce: {
    type: String,
    enum: {
      values: ['Y', 'N', 'Yes', 'No', 'YES', 'NO', 'y', 'n', 'yes', 'no'],
      message: '{VALUE} must be Y/Yes or N/No'
    },
    set: function(value) {
      if (!value) return 'N'; // Default to No
      const val = String(value).toUpperCase();
      if (val === 'YES' || val === 'Y') return 'Y';
      if (val === 'NO' || val === 'N') return 'N';
      return 'N'; // Default to No
    },
    default: 'N'
  },
  ecommerceLinkOrNo: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Raw data storage for imported fields that don't match enums
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Import and Audit fields
  importBatchId: {
    type: String,
    index: true,
    default: null
  },
  importFileName: {
    type: String,
    default: null
  },
  rowNumber: {
    type: Number,
    default: null
  },
  validationErrors: [{
    field: String,
    message: String,
    value: mongoose.Schema.Types.Mixed
  }],
  isValidated: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  updatedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: false // Allow saving fields not defined in schema
});

// Virtual for formatted assistance date
NCdataSchema.virtual('formattedAssistanceDate').get(function() {
  if (!this.assistanceDate) return '';
  return this.assistanceDate.toISOString().split('T')[0];
});

// Virtual for display name
NCdataSchema.virtual('displayName').get(function() {
  return `${this.businessName || 'Unknown'} - ${this.ownerName || 'Unknown'}`;
});

// Indexes for better query performance
NCdataSchema.index({ month: 1, year: 1 });
NCdataSchema.index({ cityMunicipality: 1, priorityIndustry: 1 });
NCdataSchema.index({ assistanceDate: -1 });
NCdataSchema.index({ importBatchId: 1, createdAt: -1 });

// Static method to get unique values for dropdowns
NCdataSchema.statics.getEnums = function() {
  return {
    months,
    genders,
    priorityIndustries,
    edtLevels,
    typesOfAssistance,
    strategicMeasures
  };
};

// Static method to get field mapping for CSV import - EXPANDED
NCdataSchema.statics.getFieldMapping = function() {
  return {
    // Basic Info
    'timestamp': 'timeStamp',
    'time stamp': 'timeStamp',
    'month': 'month',
    'year': 'year',
    'unit': 'unit',
    
    // Personnel
    'assisted by': 'assistedBy',
    'assistedby': 'assistedBy',
    'assisted': 'assistedBy',
    'owner\'s name': 'ownerName',
    'owner name': 'ownerName',
    'owners name': 'ownerName',
    'owner': 'ownerName',
    'gender': 'gender',
    
    // Business
    'business name': 'businessName',
    'businessname': 'businessName',
    'business': 'businessName',
    'city/municipality': 'cityMunicipality',
    'city': 'cityMunicipality',
    'municipality': 'cityMunicipality',
    'priority industry': 'priorityIndustry',
    'priorityindustry': 'priorityIndustry',
    'industry': 'priorityIndustry',
    
    // EDT
    'edt level': 'edtLevel',
    'edtlevel': 'edtLevel',
    'edt': 'edtLevel',
    
    // Assistance
    'type of assistance': 'typeOfAssistance',
    'assistance type': 'typeOfAssistance',
    'typeofassistance': 'typeOfAssistance',
    'strategic measure': 'strategicMeasure',
    'strategicmeasure': 'strategicMeasure',
    'measure': 'strategicMeasure',
    'assistance title': 'assistanceTitle',
    'assistancetitle': 'assistanceTitle',
    'title': 'assistanceTitle',
    'assistance date': 'assistanceDate',
    'assistancedate': 'assistanceDate',
    'date': 'assistanceDate',
    
    // E-commerce
    'e-commerce (y/n)': 'ecommerce',
    'ecommerce (y/n)': 'ecommerce',
    'e-commerce': 'ecommerce',
    'ecommerce': 'ecommerce',
    'e comm': 'ecommerce',
    'e-comm': 'ecommerce',
    'e-commerce link / no': 'ecommerceLinkOrNo',
    'e-commerce link/no': 'ecommerceLinkOrNo',
    'ecommerce link/no': 'ecommerceLinkOrNo',
    'ecommerce link': 'ecommerceLinkOrNo',
    'e-commerce link': 'ecommerceLinkOrNo',
    'link': 'ecommerceLinkOrNo'
  };
};

// Pre-save middleware to handle 'Others' fields
NCdataSchema.pre('save', function(next) {
  // Clear other fields if not 'Others'
  if (this.gender !== 'Others') {
    this.genderOther = '';
  }
  if (this.priorityIndustry !== 'Others') {
    this.priorityIndustryOther = '';
  }
  if (this.typeOfAssistance !== 'Others') {
    this.typeOfAssistanceOther = '';
  }
  if (this.strategicMeasure !== 'Others') {
    this.strategicMeasureOther = '';
  }
  
  // Set month from timestamp if not provided
  if (!this.month && this.timeStamp) {
    const date = new Date(this.timeStamp);
    this.month = months[date.getMonth()];
  }
  
  // Set year from timestamp if not provided
  if (!this.year && this.timeStamp) {
    const date = new Date(this.timeStamp);
    this.year = date.getFullYear();
  }
  
  // Ensure defaults for empty required fields
  if (!this.gender) this.gender = 'Prefer not to say';
  if (!this.priorityIndustry) this.priorityIndustry = 'Others';
  if (!this.edtLevel) this.edtLevel = 'Not Applicable';
  if (!this.typeOfAssistance) this.typeOfAssistance = 'Others';
  if (!this.strategicMeasure) this.strategicMeasure = 'Others';
  if (!this.ecommerce) this.ecommerce = 'N';
  
  next();
});

// Method to validate and clean data before import - MORE FLEXIBLE
NCdataSchema.methods.prepareForImport = function() {
  const errors = [];
  
  // Store raw values for non-enum fields
  const rawData = {};
  
  // Check if priority industry is in enum, if not store in raw and set to Others
  if (this.priorityIndustry && !priorityIndustries.includes(this.priorityIndustry)) {
    rawData.priorityIndustry = this.priorityIndustry;
    this.priorityIndustryOther = this.priorityIndustry;
    this.priorityIndustry = 'Others';
  }
  
  // Check if EDT level is in enum
  if (this.edtLevel && !edtLevels.includes(this.edtLevel)) {
    rawData.edtLevel = this.edtLevel;
    this.edtLevel = 'Not Applicable';
  }
  
  // Check if type of assistance is in enum
  if (this.typeOfAssistance && !typesOfAssistance.includes(this.typeOfAssistance)) {
    rawData.typeOfAssistance = this.typeOfAssistance;
    this.typeOfAssistanceOther = this.typeOfAssistance;
    this.typeOfAssistance = 'Others';
  }
  
  // Check if strategic measure is in enum
  if (this.strategicMeasure && !strategicMeasures.includes(this.strategicMeasure)) {
    rawData.strategicMeasure = this.strategicMeasure;
    this.strategicMeasureOther = this.strategicMeasure;
    this.strategicMeasure = 'Others';
  }
  
  // Check if gender is in enum
  if (this.gender && !genders.includes(this.gender)) {
    rawData.gender = this.gender;
    this.genderOther = this.gender;
    this.gender = 'Others';
  }
  
  // Validate e-commerce consistency - but don't fail if link missing, just warn
  if (this.ecommerce) {
    const ecommValue = String(this.ecommerce).toUpperCase();
    if ((ecommValue === 'YES' || ecommValue === 'Y') && !this.ecommerceLinkOrNo) {
      // This is a warning, not an error - allow import
      this.ecommerceLinkOrNo = 'No link provided';
    }
  }
  
  // Validate assistance date
  if (this.assistanceDate) {
    const date = new Date(this.assistanceDate);
    if (isNaN(date.getTime())) {
      this.assistanceDate = new Date(); // Default to now
    } else {
      this.assistanceDate = date;
    }
  } else {
    this.assistanceDate = new Date();
  }
  
  // Validate timestamp
  if (this.timeStamp) {
    const date = new Date(this.timeStamp);
    if (isNaN(date.getTime())) {
      this.timeStamp = new Date();
    } else {
      this.timeStamp = date;
    }
  } else {
    this.timeStamp = new Date();
  }
  
  // Set month from assistance date if not provided
  if (!this.month && this.assistanceDate) {
    const date = new Date(this.assistanceDate);
    this.month = months[date.getMonth()];
  }
  
  // Set year from assistance date if not provided
  if (!this.year && this.assistanceDate) {
    const date = new Date(this.assistanceDate);
    this.year = date.getFullYear();
  }
  
  // Store raw data
  if (Object.keys(rawData).length > 0) {
    this.rawData = rawData;
  }
  
  // For import, we consider the record valid even with warnings
  this.validationErrors = errors;
  this.isValidated = true; // Always true for import
  
  return {
    isValid: true, // Always true for import
    errors,
    warnings: errors // Treat as warnings
  };
};

const NCdata = mongoose.model('NCdata', NCdataSchema);

module.exports = NCdata;