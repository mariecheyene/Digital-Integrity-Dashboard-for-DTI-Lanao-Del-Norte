const express = require('express');
const router = express.Router();
const NCMsmeAssistance = require('../models/NCMsmeAssistance');
const NCFundLiquidation = require('../models/NCFundLiquidation');
const NCdata = require('../models/NCdata');

// Month order for proper sorting
const monthOrder = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
  'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
};

// ==================== NC DATA (16 FIELDS) ROUTES ====================

// Get all enums for dropdowns
router.get('/nc-data/enums', async (req, res) => {
  try {
    const enums = NCdata.getEnums();
    res.json({
      success: true,
      data: enums
    });
  } catch (error) {
    console.error('Error fetching enums:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enum values',
      error: error.message
    });
  }
});

// Create new NC data record - MORE FLEXIBLE
router.post('/nc-data', async (req, res) => {
  try {
    const data = req.body;
    
    // Don't require all fields for manual entry
    const ncData = new NCdata({
      timeStamp: data.timeStamp || new Date(),
      month: data.month || months[new Date().getMonth()],
      year: data.year || new Date().getFullYear(),
      unit: data.unit || '',
      assistedBy: data.assistedBy || '',
      ownerName: data.ownerName || '',
      gender: data.gender || 'Prefer not to say',
      genderOther: data.genderOther || '',
      businessName: data.businessName || '',
      cityMunicipality: data.cityMunicipality || '',
      priorityIndustry: data.priorityIndustry || 'Others',
      priorityIndustryOther: data.priorityIndustryOther || '',
      edtLevel: data.edtLevel || 'Not Applicable',
      typeOfAssistance: data.typeOfAssistance || 'Others',
      typeOfAssistanceOther: data.typeOfAssistanceOther || '',
      strategicMeasure: data.strategicMeasure || 'Others',
      strategicMeasureOther: data.strategicMeasureOther || '',
      assistanceTitle: data.assistanceTitle || '',
      assistanceDate: data.assistanceDate || new Date(),
      ecommerce: data.ecommerce || 'N',
      ecommerceLinkOrNo: data.ecommerceLinkOrNo || '',
      createdBy: data.createdBy || 'system',
      importBatchId: data.importBatchId || null,
      importFileName: data.importFileName || null,
      rowNumber: data.rowNumber || null
    });

    // Validate the record - but don't fail on warnings
    const validation = ncData.prepareForImport();

    await ncData.save();
    
    res.status(201).json({
      success: true,
      message: 'NC data record created successfully',
      data: ncData,
      warnings: validation.errors
    });
    
  } catch (error) {
    console.error('Error creating NC data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create NC data record',
      error: error.message
    });
  }
});

// Get all NC data records
router.get('/nc-data', async (req, res) => {
  try {
    const { 
      year, 
      month, 
      city, 
      industry, 
      search, 
      page = 1, 
      limit = 50,
      sortBy = 'assistanceDate',
      sortOrder = -1
    } = req.query;

    // Build query
    const query = {};
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (month) {
      query.month = month;
    }
    
    if (city) {
      query.cityMunicipality = { $regex: city, $options: 'i' };
    }
    
    if (industry) {
      query.priorityIndustry = industry;
    }

    // Text search
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { assistanceTitle: { $regex: search, $options: 'i' } },
        { unit: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const totalRecords = await NCdata.countDocuments(query);
    const records = await NCdata.find(query)
      .sort({ [sortBy]: parseInt(sortOrder) })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get statistics
    const stats = await NCdata.aggregate([
      { $match: query },
      { $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        uniqueBusinesses: { $addToSet: '$businessName' },
        uniqueCities: { $addToSet: '$cityMunicipality' }
      }},
      { $project: {
        totalRecords: 1,
        uniqueBusinesses: { $size: '$uniqueBusinesses' },
        uniqueCities: { $size: '$uniqueCities' }
      }}
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / parseInt(limit))
      },
      stats: stats[0] || { totalRecords: 0, uniqueBusinesses: 0, uniqueCities: 0 }
    });
    
  } catch (error) {
    console.error('Error fetching NC data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NC data records',
      error: error.message
    });
  }
});

// Get single NC data record by ID
router.get('/nc-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await NCdata.findById(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'NC data record not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
    
  } catch (error) {
    console.error('Error fetching NC data by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NC data record',
      error: error.message
    });
  }
});

// Update NC data record
router.put('/nc-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find existing record
    const existingRecord = await NCdata.findById(id);
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'NC data record not found'
      });
    }

    // Add updatedBy
    updateData.updatedBy = updateData.updatedBy || 'system';
    
    const updatedRecord = await NCdata.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'NC data record updated successfully',
      data: updatedRecord
    });
    
  } catch (error) {
    console.error('Error updating NC data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update NC data record',
      error: error.message
    });
  }
});

// Delete NC data record
router.delete('/nc-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await NCdata.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'NC data record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'NC data record deleted successfully',
      data: deletedRecord
    });
    
  } catch (error) {
    console.error('Error deleting NC data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete NC data record',
      error: error.message
    });
  }
});

// ==================== IMPORT/EXPORT ROUTES - FIXED ====================

// Validate import data (preview) - ACCEPTS ALL DATA
router.post('/nc-data/import/preview', async (req, res) => {
  try {
    const { records, importBatchId, fileName } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No records to import'
      });
    }

    const fieldMapping = NCdata.getFieldMapping();
    const processedRecords = [];
    const validationSummary = {
      total: records.length,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: []
    };

    // Process each record
    records.forEach((record, index) => {
      const mappedRecord = {};
      const rawRecord = {};
      
      // Map fields using the field mapping
      Object.keys(record).forEach(key => {
        const normalizedKey = key.toString().toLowerCase().trim();
        const mappedField = fieldMapping[normalizedKey];
        if (mappedField) {
          mappedRecord[mappedField] = record[key];
        } else {
          // Store as raw data
          rawRecord[key] = record[key];
        }
      });

      // Add row number
      mappedRecord.rowNumber = index + 2;
      mappedRecord.rawData = rawRecord;

      // Create NCdata instance for validation
      const ncData = new NCdata({
        ...mappedRecord,
        importBatchId,
        importFileName: fileName,
        rowNumber: index + 2
      });

      // Validate - this now always returns isValid = true
      const validation = ncData.prepareForImport();
      
      validationSummary.valid++;
      
      processedRecords.push({
        ...mappedRecord,
        isValid: true,
        rowNumber: index + 2,
        validationErrors: validation.errors,
        warnings: validation.errors
      });

      if (validation.errors.length > 0) {
        validationSummary.warnings.push({
          row: index + 2,
          warnings: validation.errors
        });
      }
    });

    res.json({
      success: true,
      message: `Preview generated: ${validationSummary.total} records ready for import`,
      data: {
        records: processedRecords,
        summary: validationSummary,
        importBatchId
      }
    });
    
  } catch (error) {
    console.error('Error validating import data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate import data',
      error: error.message
    });
  }
});

// Confirm and save import - ACCEPTS ALL RECORDS
router.post('/nc-data/import/confirm', async (req, res) => {
  try {
    const { records, importBatchId } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No records to import'
      });
    }

    const savedRecords = [];
    const errors = [];

    // Save each record
    for (const record of records) {
      try {
        const ncData = new NCdata({
          ...record,
          importBatchId,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Final validation - always passes now
        ncData.prepareForImport();
        await ncData.save();
        savedRecords.push(ncData);
        
      } catch (err) {
        console.error('Error saving record:', err);
        errors.push({
          row: record.rowNumber,
          message: err.message,
          errors: err.errors
        });
      }
    }

    res.json({
      success: true,
      message: `Import completed: ${savedRecords.length} saved, ${errors.length} failed`,
      data: {
        savedCount: savedRecords.length,
        errorCount: errors.length,
        savedRecords,
        errors
      }
    });
    
  } catch (error) {
    console.error('Error confirming import:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm import',
      error: error.message
    });
  }
});

// Get import history
router.get('/nc-data/import/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const importHistory = await NCdata.aggregate([
      { $match: { importBatchId: { $ne: null } } },
      { $group: {
        _id: '$importBatchId',
        importFileName: { $first: '$importFileName' },
        recordCount: { $sum: 1 },
        firstImport: { $min: '$createdAt' },
        lastImport: { $max: '$createdAt' },
        createdBy: { $first: '$createdBy' }
      }},
      { $sort: { firstImport: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      data: importHistory
    });
    
  } catch (error) {
    console.error('Error fetching import history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch import history',
      error: error.message
    });
  }
});

// ==================== NC ANALYTICS & STATISTICS ====================

// Get NC dashboard statistics
router.get('/nc-data/stats/dashboard', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const targetYear = parseInt(year);
    
    // Get overall statistics
    const overallStats = await NCdata.aggregate([
      { $match: { year: targetYear } },
      { $group: {
        _id: null,
        totalAssisted: { $sum: 1 },
        uniqueBusinesses: { $addToSet: '$businessName' },
        uniqueCities: { $addToSet: '$cityMunicipality' },
        ecommerceEnabled: {
          $sum: {
            $cond: [{ $in: ['$ecommerce', ['Y', 'Yes', 'YES']] }, 1, 0]
          }
        }
      }},
      { $project: {
        totalAssisted: 1,
        uniqueBusinesses: { $size: '$uniqueBusinesses' },
        uniqueCities: { $size: '$uniqueCities' },
        ecommerceEnabled: 1,
        ecommerceRate: {
          $multiply: [
            { $divide: ['$ecommerceEnabled', '$totalAssisted'] },
            100
          ]
        }
      }}
    ]);

    // Monthly trend
    const monthlyTrend = await NCdata.aggregate([
      { $match: { year: targetYear } },
      { $group: {
        _id: '$month',
        count: { $sum: 1 },
        ecommerceCount: {
          $sum: {
            $cond: [{ $in: ['$ecommerce', ['Y', 'Yes', 'YES']] }, 1, 0]
          }
        }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Sort monthly trend by month order
    monthlyTrend.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);

    // Industry distribution
    const industryStats = await NCdata.aggregate([
      { $match: { year: targetYear } },
      { $group: {
        _id: '$priorityIndustry',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // City distribution
    const cityStats = await NCdata.aggregate([
      { $match: { year: targetYear } },
      { $group: {
        _id: '$cityMunicipality',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Assistance type distribution
    const assistanceStats = await NCdata.aggregate([
      { $match: { year: targetYear } },
      { $group: {
        _id: '$typeOfAssistance',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        year: targetYear,
        overview: overallStats[0] || {
          totalAssisted: 0,
          uniqueBusinesses: 0,
          uniqueCities: 0,
          ecommerceEnabled: 0,
          ecommerceRate: 0
        },
        monthlyTrend,
        topIndustries: industryStats,
        topCities: cityStats,
        assistanceTypes: assistanceStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching NC dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NC dashboard statistics',
      error: error.message
    });
  }
});

// Get NC data export
router.get('/nc-data/export', async (req, res) => {
  try {
    const { year, month, city, industry, format = 'json' } = req.query;
    
    // Build query
    const query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = month;
    if (city) query.cityMunicipality = { $regex: city, $options: 'i' };
    if (industry) query.priorityIndustry = industry;
    
    const records = await NCdata.find(query)
      .sort({ assistanceDate: -1 })
      .lean();
    
    if (format === 'csv') {
      // Transform for CSV
      const csvData = records.map(record => ({
        'Timestamp': record.timeStamp,
        'Month': record.month,
        'Year': record.year,
        'Unit': record.unit,
        'Assisted By': record.assistedBy,
        'Owner Name': record.ownerName,
        'Gender': record.gender === 'Others' ? (record.genderOther || 'Others') : record.gender,
        'Business Name': record.businessName,
        'City/Municipality': record.cityMunicipality,
        'Priority Industry': record.priorityIndustry === 'Others' ? (record.priorityIndustryOther || 'Others') : record.priorityIndustry,
        'EDT Level': record.edtLevel,
        'Type of Assistance': record.typeOfAssistance === 'Others' ? (record.typeOfAssistanceOther || 'Others') : record.typeOfAssistance,
        'Strategic Measure': record.strategicMeasure === 'Others' ? (record.strategicMeasureOther || 'Others') : record.strategicMeasure,
        'Assistance Title': record.assistanceTitle,
        'Assistance Date': record.formattedAssistanceDate,
        'E-commerce': record.ecommerce,
        'E-commerce Link/No': record.ecommerceLinkOrNo,
        'Raw Data': JSON.stringify(record.rawData || {})
      }));
      
      res.json({
        success: true,
        data: csvData,
        count: csvData.length
      });
    } else {
      res.json({
        success: true,
        data: records,
        count: records.length
      });
    }
    
  } catch (error) {
    console.error('Error exporting NC data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export NC data',
      error: error.message
    });
  }
});

// ==================== EXISTING NC MSME ASSISTANCE ROUTES ====================
// (Keep all your existing routes below this line - they remain unchanged)

// Create new NC MSME assistance record
router.post('/nc-msme-assistance', async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.month || !data.target || !data.accomplishment || !data.agency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month, target, accomplishment, and agency are required' 
      });
    }

    // If agency is Others, require agencyOther
    if (data.agency === 'Others' && !data.agencyOther) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please specify the agency name' 
      });
    }

    // Calculate derived fields
    const target = Number(data.target);
    const accomplishment = Number(data.accomplishment);
    const percentAccomplishment = target > 0 ? (accomplishment / target) * 100 : 0;
    const status = accomplishment >= target ? 'On Target' : 'Below Target';

    const ncMsmeAssistance = new NCMsmeAssistance({
      month: data.month,
      year: data.year || new Date().getFullYear(),
      target: target,
      accomplishment: accomplishment,
      percentAccomplishment: percentAccomplishment,
      status: status,
      agency: data.agency,
      agencyOther: data.agencyOther || '',
      notes: data.notes || '',
      createdBy: data.createdBy || 'system'
    });

    await ncMsmeAssistance.save();
    
    res.status(201).json({
      success: true,
      message: 'NC MSME assistance record created successfully',
      data: ncMsmeAssistance
    });
    
  } catch (error) {
    console.error('Error creating NC MSME assistance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create NC MSME assistance record',
      error: error.message 
    });
  }
});

// Get all NC MSME assistance records
router.get('/nc-msme-assistance', async (req, res) => {
  try {
    const { year } = req.query;
    const query = year ? { year: parseInt(year) } : {};
    
    let msmeData = await NCMsmeAssistance.find(query).lean();
    
    // Sort by month order
    msmeData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return monthOrder[a.month] - monthOrder[b.month];
    });

    // Recalculate derived fields for consistency
    msmeData = msmeData.map(item => {
      const target = Number(item.target);
      const accomplishment = Number(item.accomplishment);
      const percentAccomplishment = target > 0 ? (accomplishment / target) * 100 : 0;
      const status = accomplishment >= target ? 'On Target' : 'Below Target';
      
      return {
        ...item,
        target: target,
        accomplishment: accomplishment,
        percentAccomplishment: percentAccomplishment,
        status: status
      };
    });
    
    // Calculate summary statistics
    const totalTarget = msmeData.reduce((sum, item) => sum + item.target, 0);
    const totalAccomplishment = msmeData.reduce((sum, item) => sum + item.accomplishment, 0);
    const overallPercent = totalTarget > 0 ? (totalAccomplishment / totalTarget) * 100 : 0;
    
    // Calculate by agency
    const agencyStats = msmeData.reduce((acc, item) => {
      const agency = item.agency === 'Others' ? item.agencyOther : item.agency;
      if (!acc[agency]) {
        acc[agency] = { target: 0, accomplishment: 0, count: 0 };
      }
      acc[agency].target += item.target;
      acc[agency].accomplishment += item.accomplishment;
      acc[agency].count++;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: msmeData,
      summary: {
        totalRecords: msmeData.length,
        totalTarget,
        totalAccomplishment,
        overallPercent: overallPercent.toFixed(2)
      },
      agencyStats
    });
    
  } catch (error) {
    console.error('Error fetching NC MSME assistance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch NC MSME assistance records',
      error: error.message 
    });
  }
});

// Get single NC MSME assistance record by ID
router.get('/nc-msme-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const msmeRecord = await NCMsmeAssistance.findById(id);
    
    if (!msmeRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'MSME record not found' 
      });
    }
    
    res.json({
      success: true,
      data: msmeRecord
    });
    
  } catch (error) {
    console.error('Error fetching NC MSME assistance by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch MSME record',
      error: error.message 
    });
  }
});

// Update NC MSME assistance record
router.put('/nc-msme-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    if (!updateData.month || !updateData.target || !updateData.accomplishment || !updateData.agency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month, target, accomplishment, and agency are required' 
      });
    }

    // If agency is Others, require agencyOther
    if (updateData.agency === 'Others' && !updateData.agencyOther) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please specify the agency name' 
      });
    }

    // Convert numeric fields and calculate derived fields
    const target = Number(updateData.target);
    const accomplishment = Number(updateData.accomplishment);
    const percentAccomplishment = target > 0 ? (accomplishment / target) * 100 : 0;
    const status = accomplishment >= target ? 'On Target' : 'Below Target';
    
    updateData.target = target;
    updateData.accomplishment = accomplishment;
    updateData.percentAccomplishment = percentAccomplishment;
    updateData.status = status;
    if (updateData.year) updateData.year = Number(updateData.year);
    
    const updatedRecord = await NCMsmeAssistance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'MSME record not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'MSME record updated successfully',
      data: updatedRecord
    });
    
  } catch (error) {
    console.error('Error updating NC MSME assistance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update MSME record',
      error: error.message 
    });
  }
});

// Delete NC MSME assistance record
router.delete('/nc-msme-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await NCMsmeAssistance.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'MSME record not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'MSME record deleted successfully',
      data: deletedRecord
    });
    
  } catch (error) {
    console.error('Error deleting NC MSME assistance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete MSME record',
      error: error.message 
    });
  }
});

// ==================== EXISTING NC FUND LIQUIDATION ROUTES ====================
// (Keep all your existing fund liquidation routes below this line - they remain unchanged)

// Create new NC fund liquidation record
router.post('/nc-fund-liquidation', async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.month || !data.availableFunds || !data.liquidatedFunds || !data.purpose) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month, available funds, liquidated funds, and purpose are required' 
      });
    }

    // If purpose is Others, require purposeOther
    if (data.purpose === 'Others' && !data.purposeOther) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please specify the purpose' 
      });
    }

    // Calculate derived fields
    const availableFunds = Number(data.availableFunds);
    const liquidatedFunds = Number(data.liquidatedFunds);
    const fundsRemaining = availableFunds - liquidatedFunds;
    const percentDisbursed = availableFunds > 0 ? (liquidatedFunds / availableFunds) * 100 : 0;

    const ncFundLiquidation = new NCFundLiquidation({
      month: data.month,
      year: data.year || new Date().getFullYear(),
      availableFunds: availableFunds,
      liquidatedFunds: liquidatedFunds,
      fundsRemaining: fundsRemaining,
      percentDisbursed: percentDisbursed,
      purpose: data.purpose,
      purposeOther: data.purposeOther || '',
      remarks: data.remarks || '',
      createdBy: data.createdBy || 'system'
    });

    await ncFundLiquidation.save();
    
    res.status(201).json({
      success: true,
      message: 'NC fund liquidation record created successfully',
      data: ncFundLiquidation
    });
    
  } catch (error) {
    console.error('Error creating NC fund liquidation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create NC fund liquidation record',
      error: error.message 
    });
  }
});

// Get all NC fund liquidation records
router.get('/nc-fund-liquidation', async (req, res) => {
  try {
    const { year } = req.query;
    const query = year ? { year: parseInt(year) } : {};
    
    let ncFunds = await NCFundLiquidation.find(query).lean();
    
    // Sort by month order
    ncFunds.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return monthOrder[a.month] - monthOrder[b.month];
    });

    // Recalculate derived fields for consistency
    ncFunds = ncFunds.map(item => {
      const availableFunds = Number(item.availableFunds);
      const liquidatedFunds = Number(item.liquidatedFunds);
      const fundsRemaining = availableFunds - liquidatedFunds;
      const percentDisbursed = availableFunds > 0 ? (liquidatedFunds / availableFunds) * 100 : 0;
      
      return {
        ...item,
        availableFunds: availableFunds,
        liquidatedFunds: liquidatedFunds,
        fundsRemaining: fundsRemaining,
        percentDisbursed: percentDisbursed
      };
    });
    
    // Calculate summary statistics
    const totalAvailable = ncFunds.reduce((sum, item) => sum + item.availableFunds, 0);
    const totalLiquidated = ncFunds.reduce((sum, item) => sum + item.liquidatedFunds, 0);
    const totalRemaining = ncFunds.reduce((sum, item) => sum + item.fundsRemaining, 0);
    const overallPercent = totalAvailable > 0 ? (totalLiquidated / totalAvailable) * 100 : 0;
    
    // Calculate by purpose
    const purposeStats = ncFunds.reduce((acc, item) => {
      const purpose = item.purpose === 'Others' ? item.purposeOther : item.purpose;
      if (!acc[purpose]) {
        acc[purpose] = { available: 0, liquidated: 0, count: 0 };
      }
      acc[purpose].available += item.availableFunds;
      acc[purpose].liquidated += item.liquidatedFunds;
      acc[purpose].count++;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: ncFunds,
      summary: {
        totalRecords: ncFunds.length,
        totalAvailable,
        totalLiquidated,
        totalRemaining,
        overallPercent: overallPercent.toFixed(2)
      },
      purposeStats
    });
    
  } catch (error) {
    console.error('Error fetching NC fund liquidation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch NC fund liquidation records',
      error: error.message 
    });
  }
});

// Get single NC fund liquidation record by ID
router.get('/nc-fund-liquidation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const fundRecord = await NCFundLiquidation.findById(id);
    
    if (!fundRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fund record not found' 
      });
    }
    
    res.json({
      success: true,
      data: fundRecord
    });
    
  } catch (error) {
    console.error('Error fetching NC fund liquidation by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch fund record',
      error: error.message 
    });
  }
});

// Update NC fund liquidation record
router.put('/nc-fund-liquidation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    if (!updateData.month || !updateData.availableFunds || !updateData.liquidatedFunds || !updateData.purpose) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month, available funds, liquidated funds, and purpose are required' 
      });
    }

    // If purpose is Others, require purposeOther
    if (updateData.purpose === 'Others' && !updateData.purposeOther) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please specify the purpose' 
      });
    }

    // Convert numeric fields and calculate derived fields
    const availableFunds = Number(updateData.availableFunds);
    const liquidatedFunds = Number(updateData.liquidatedFunds);
    const fundsRemaining = availableFunds - liquidatedFunds;
    const percentDisbursed = availableFunds > 0 ? (liquidatedFunds / availableFunds) * 100 : 0;
    
    updateData.availableFunds = availableFunds;
    updateData.liquidatedFunds = liquidatedFunds;
    updateData.fundsRemaining = fundsRemaining;
    updateData.percentDisbursed = percentDisbursed;
    if (updateData.year) updateData.year = Number(updateData.year);
    
    const updatedRecord = await NCFundLiquidation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fund record not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Fund record updated successfully',
      data: updatedRecord
    });
    
  } catch (error) {
    console.error('Error updating NC fund liquidation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update fund record',
      error: error.message 
    });
  }
});

// Delete NC fund liquidation record
router.delete('/nc-fund-liquidation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await NCFundLiquidation.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fund record not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Fund record deleted successfully',
      data: deletedRecord
    });
    
  } catch (error) {
    console.error('Error deleting NC fund liquidation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete fund record',
      error: error.message 
    });
  }
});

// ==================== NC DASHBOARD STATISTICS ====================

// Get NC dashboard statistics
router.get('/nc-dashboard-stats', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get NC MSME statistics for current year
    const msmeData = await NCMsmeAssistance.find({ year: currentYear });
    const totalNCMsmes = msmeData.reduce((sum, item) => sum + item.accomplishment, 0);
    
    // Get NC fund statistics for current year
    const fundData = await NCFundLiquidation.find({ year: currentYear });
    const totalNCAvailable = fundData.reduce((sum, item) => sum + item.availableFunds, 0);
    const totalNCLiquidated = fundData.reduce((sum, item) => sum + item.liquidatedFunds, 0);
    const ncBudgetUtilization = totalNCAvailable > 0 ? (totalNCLiquidated / totalNCAvailable) * 100 : 0;
    
    // Get NC data statistics for current year
    const ncDataStats = await NCdata.aggregate([
      { $match: { year: currentYear } },
      { $group: {
        _id: null,
        totalAssisted: { $sum: 1 },
        uniqueBusinesses: { $addToSet: '$businessName' },
        ecommerceEnabled: {
          $sum: {
            $cond: [{ $in: ['$ecommerce', ['Y', 'Yes', 'YES']] }, 1, 0]
          }
        }
      }}
    ]);
    
    // Calculate NC-specific metrics
    const onTargetCount = msmeData.filter(item => item.status === 'On Target').length;
    const belowTargetCount = msmeData.filter(item => item.status === 'Below Target').length;
    
    // Calculate average accomplishment rate
    const avgAccomplishmentRate = msmeData.length > 0 
      ? msmeData.reduce((sum, item) => sum + item.percentAccomplishment, 0) / msmeData.length
      : 0;
    
    res.json({
      success: true,
      data: {
        // NC-specific metrics
        ncMsmesAssisted: totalNCMsmes,
        ncTotalAvailableFunds: totalNCAvailable,
        ncTotalLiquidatedFunds: totalNCLiquidated,
        ncBudgetUtilization: ncBudgetUtilization.toFixed(2),
        
        // NC Data metrics (16 fields)
        ncDataAssisted: ncDataStats[0]?.totalAssisted || 0,
        ncDataUniqueBusinesses: ncDataStats[0]?.uniqueBusinesses?.length || 0,
        ncDataEcommerceEnabled: ncDataStats[0]?.ecommerceEnabled || 0,
        ncDataEcommerceRate: ncDataStats[0] ? 
          ((ncDataStats[0].ecommerceEnabled / ncDataStats[0].totalAssisted) * 100).toFixed(1) : 0,
        
        // Performance metrics
        ncOnTargetRecords: onTargetCount,
        ncBelowTargetRecords: belowTargetCount,
        ncAvgAccomplishmentRate: avgAccomplishmentRate.toFixed(2),
        ncTotalRecords: msmeData.length + fundData.length + (ncDataStats[0]?.totalAssisted || 0),
        
        // Breakdown
        ncMsmeRecords: msmeData.length,
        ncFundRecords: fundData.length,
        ncDataRecords: ncDataStats[0]?.totalAssisted || 0,
        
        // Agency distribution (top 3)
        topAgencies: msmeData.slice(0, 3).map(item => ({
          agency: item.agency === 'Others' ? item.agencyOther : item.agency,
          accomplishment: item.accomplishment
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching NC dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch NC dashboard statistics',
      error: error.message 
    });
  }
});

// ==================== NC ANALYTICS ====================

// Get NC analytics for charts
router.get('/nc-analytics', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get monthly data for current year, properly sorted
    const msmeMonthly = await NCMsmeAssistance.aggregate([
      { $match: { year: currentYear } },
      { $group: {
        _id: '$month',
        totalTarget: { $sum: '$target' },
        totalAccomplishment: { $sum: '$accomplishment' },
        count: { $sum: 1 }
      }}
    ]);
    
    const fundMonthly = await NCFundLiquidation.aggregate([
      { $match: { year: currentYear } },
      { $group: {
        _id: '$month',
        totalAvailable: { $sum: '$availableFunds' },
        totalLiquidated: { $sum: '$liquidatedFunds' },
        count: { $sum: 1 }
      }}
    ]);

    // Get NC data monthly statistics
    const ncDataMonthly = await NCdata.aggregate([
      { $match: { year: currentYear } },
      { $group: {
        _id: '$month',
        totalAssisted: { $sum: 1 },
        ecommerceCount: {
          $sum: {
            $cond: [{ $in: ['$ecommerce', ['Y', 'Yes', 'YES']] }, 1, 0]
          }
        }
      }}
    ]);
    
    // Sort by month order
    msmeMonthly.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);
    fundMonthly.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);
    ncDataMonthly.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);
    
    // Prepare chart data
    const monthlyComparison = msmeMonthly.map((msme) => {
      const fund = fundMonthly.find(f => f._id === msme._id) || {};
      const ncData = ncDataMonthly.find(n => n._id === msme._id) || {};
      return {
        month: msme._id.substring(0, 3),
        msmeTarget: msme.totalTarget,
        msmeAccomplishment: msme.totalAccomplishment,
        fundAvailable: fund.totalAvailable || 0,
        fundLiquidated: fund.totalLiquidated || 0,
        ncDataAssisted: ncData.totalAssisted || 0,
        ncDataEcommerce: ncData.ecommerceCount || 0
      };
    });
    
    res.json({
      success: true,
      data: {
        monthlyComparison,
        msmeMonthly,
        fundMonthly,
        ncDataMonthly
      }
    });
    
  } catch (error) {
    console.error('Error fetching NC analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch NC analytics',
      error: error.message 
    });
  }
});

module.exports = router;