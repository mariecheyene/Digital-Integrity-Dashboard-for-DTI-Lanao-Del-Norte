const express = require('express');
const router = express.Router();
const NCMsmeAssistance = require('../models/NCMsmeAssistance');
const NCFundLiquidation = require('../models/NCFundLiquidation');

// Month order for proper sorting
const monthOrder = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
  'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
};

// ==================== NC MSME ASSISTANCE ROUTES ====================

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

// ==================== NC FUND LIQUIDATION ROUTES ====================

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
        
        // Performance metrics
        ncOnTargetRecords: onTargetCount,
        ncBelowTargetRecords: belowTargetCount,
        ncAvgAccomplishmentRate: avgAccomplishmentRate.toFixed(2),
        ncTotalRecords: msmeData.length + fundData.length,
        
        // Breakdown
        ncMsmeRecords: msmeData.length,
        ncFundRecords: fundData.length,
        
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
    
    // Sort by month order
    msmeMonthly.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);
    fundMonthly.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);
    
    // Prepare chart data
    const monthlyComparison = msmeMonthly.map((msme) => {
      const fund = fundMonthly.find(f => f._id === msme._id) || {};
      return {
        month: msme._id.substring(0, 3),
        msmeTarget: msme.totalTarget,
        msmeAccomplishment: msme.totalAccomplishment,
        fundAvailable: fund.totalAvailable || 0,
        fundLiquidated: fund.totalLiquidated || 0
      };
    });
    
    res.json({
      success: true,
      data: {
        monthlyComparison,
        msmeMonthly,
        fundMonthly
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