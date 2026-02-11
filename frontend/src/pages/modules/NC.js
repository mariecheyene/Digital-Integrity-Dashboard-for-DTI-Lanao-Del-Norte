import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, ComposedChart, Line, ReferenceDot, ReferenceArea
} from "recharts";
import { Fullscreen, FullscreenExit, Eye, PencilSquare, Trash, Search, X, ExclamationTriangle } from 'react-bootstrap-icons';

const NC = () => {
  const [showMSMEForm, setShowMSMEForm] = useState(false);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewType, setViewType] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [confirmationType, setConfirmationType] = useState('');
  
  const [ncMsmeData, setNcMsmeData] = useState([]);
  const [ncFundData, setNcFundData] = useState([]);
  const [filteredMsmeData, setFilteredMsmeData] = useState([]);
  const [filteredFundData, setFilteredFundData] = useState([]);
  const [currentYearStats, setCurrentYearStats] = useState({
    totalMsme: 0,
    totalTarget: 0,
    totalAvailable: 0,
    totalLiquidated: 0,
    budgetUtilization: 0,
    msmeRecords: 0,
    fundRecords: 0
  });
  
  // Search states
  const [msmeSearch, setMsmeSearch] = useState("");
  const [fundSearch, setFundSearch] = useState("");
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [msmeFullscreen, setMsmeFullscreen] = useState(false);
  const [fundFullscreen, setFundFullscreen] = useState(false);
  const [editingMsme, setEditingMsme] = useState(null);
  const [editingFund, setEditingFund] = useState(null);
  
  // Alarming months tracking with full record data
  const [alarmingMsmeMonths, setAlarmingMsmeMonths] = useState([]);
  const [alarmingFundMonths, setAlarmingFundMonths] = useState([]);

  // NC MSME Form State
  const [ncMsmeForm, setNcMsmeForm] = useState({
    month: '',
    year: new Date().getFullYear(),
    target: '',
    accomplishment: '',
    agency: '',
    agencyOther: '',
    notes: ''
  });
  
  // NC Fund Form State
  const [ncFundForm, setNcFundForm] = useState({
    month: '',
    year: new Date().getFullYear(),
    availableFunds: '',
    liquidatedFunds: '',
    purpose: 'MSME Assistance',
    purposeOther: '',
    remarks: ''
  });

  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).reverse();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthOrder = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  const agencies = [
    'LGU',
    'DTI Provincial Office',
    'DTI Regional Office',
    'Cooperative',
    'NGO',
    'Others'
  ];

  const purposes = [
    'MSME Assistance',
    'Operational Expenses',
    'Training Programs',
    'Others'
  ];

  // Fetch data when year changes
  useEffect(() => {
    fetchNCData();
  }, [selectedYear]);

  // Filter MSME data when search changes
  useEffect(() => {
    if (!msmeSearch.trim()) {
      setFilteredMsmeData(ncMsmeData);
    } else {
      const searchLower = msmeSearch.toLowerCase();
      const filtered = ncMsmeData.filter(item => 
        item.month.toLowerCase().includes(searchLower) ||
        item.agency.toLowerCase().includes(searchLower) ||
        (item.agencyOther && item.agencyOther.toLowerCase().includes(searchLower)) ||
        item.target.toString().includes(searchLower) ||
        item.accomplishment.toString().includes(searchLower) ||
        item.percentAccomplishment.toString().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower)
      );
      setFilteredMsmeData(filtered);
    }
  }, [msmeSearch, ncMsmeData]);

  // Filter Fund data when search changes
  useEffect(() => {
    if (!fundSearch.trim()) {
      setFilteredFundData(ncFundData);
    } else {
      const searchLower = fundSearch.toLowerCase();
      const filtered = ncFundData.filter(item => 
        item.month.toLowerCase().includes(searchLower) ||
        item.purpose.toLowerCase().includes(searchLower) ||
        (item.purposeOther && item.purposeOther.toLowerCase().includes(searchLower)) ||
        item.availableFunds.toString().includes(searchLower) ||
        item.liquidatedFunds.toString().includes(searchLower) ||
        item.fundsRemaining.toString().includes(searchLower) ||
        item.percentDisbursed.toString().includes(searchLower)
      );
      setFilteredFundData(filtered);
    }
  }, [fundSearch, ncFundData]);

  const fetchNCData = async () => {
    setLoading(true);
    try {
      const [msmeRes, fundRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/nc/nc-msme-assistance?year=${selectedYear}`),
        axios.get(`http://localhost:5000/api/nc/nc-fund-liquidation?year=${selectedYear}`)
      ]);
      
      if (msmeRes.data.success) {
        // Sort MSME data by month
        const msmeData = [...msmeRes.data.data].sort((a, b) => {
          return monthOrder[a.month] - monthOrder[b.month];
        });
        setNcMsmeData(msmeData);
        setFilteredMsmeData(msmeData);
        
        // Find alarming months for MSME with full record data
        const alarmingMsme = msmeData
          .filter(item => item.status === 'Below Target')
          .map(item => ({ month: item.month, record: item }));
        setAlarmingMsmeMonths(alarmingMsme);
        
        const totalMsme = msmeData.reduce((sum, item) => sum + item.accomplishment, 0);
        const totalTarget = msmeData.reduce((sum, item) => sum + item.target, 0);
        
        if (fundRes.data.success) {
          // Sort Fund data by month
          const fundData = [...fundRes.data.data].sort((a, b) => {
            return monthOrder[a.month] - monthOrder[b.month];
          });
          setNcFundData(fundData);
          setFilteredFundData(fundData);
          
          // Find alarming months for Funds (low utilization < 30%)
          const alarmingFund = fundData
            .filter(item => item.percentDisbursed < 30)
            .map(item => ({ month: item.month, record: item }));
          setAlarmingFundMonths(alarmingFund);
          
          const totalAvailable = fundData.reduce((sum, item) => sum + item.availableFunds, 0);
          const totalLiquidated = fundData.reduce((sum, item) => sum + item.liquidatedFunds, 0);
          const budgetUtilization = totalAvailable > 0 ? (totalLiquidated / totalAvailable) * 100 : 0;
          
          setCurrentYearStats({
            totalMsme,
            totalTarget,
            totalAvailable,
            totalLiquidated,
            budgetUtilization: budgetUtilization.toFixed(1),
            msmeRecords: msmeData.length,
            fundRecords: fundData.length
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching NC data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear search functions
  const clearMsmeSearch = () => setMsmeSearch("");
  const clearFundSearch = () => setFundSearch("");

  const handleView = (type, record) => {
    if (type === 'msme') {
      const viewDetails = {
        type: 'MSME Assistance Record',
        details: {
          'Month/Year': `${record.month} ${record.year}`,
          'Target': `${Number(record.target).toLocaleString()} MSMEs`,
          'Accomplishment': `${Number(record.accomplishment).toLocaleString()} MSMEs`,
          'Agency': record.agency === 'Others' ? record.agencyOther : record.agency,
          '% Accomplishment vs Target': `${record.percentAccomplishment.toFixed(1)}%`,
          'Status': record.status,
          'Notes': record.notes || 'None'
        }
      };
      setViewData(viewDetails);
      setViewType('msme');
    } else if (type === 'fund') {
      const viewDetails = {
        type: 'Fund Liquidation Record',
        details: {
          'Month/Year': `${record.month} ${record.year}`,
          'Available Funds': formatCurrency(record.availableFunds),
          'Liquidated Funds': formatCurrency(record.liquidatedFunds),
          'Funds Remaining': formatCurrency(record.fundsRemaining),
          '% Disbursed': `${record.percentDisbursed.toFixed(1)}%`,
          'Purpose': record.purpose === 'Others' ? record.purposeOther : record.purpose,
          'Remarks': record.remarks || 'None'
        }
      };
      setViewData(viewDetails);
      setViewType('fund');
    }
    setShowViewModal(true);
  };

  // Function to view alarming month details
  const viewAlarmingMonth = (type, record) => {
    handleView(type, record);
  };

  const previewAndConfirm = (type) => {
    let data;
    let validationErrors = [];
    
    if (type === 'msme') {
      // Use the correct form data based on whether we're editing or creating
      const formData = editingMsme ? { ...editingMsme } : { ...ncMsmeForm };
      
      if (!formData.month) validationErrors.push("Month is required");
      if (!formData.target || formData.target <= 0) validationErrors.push("Valid target is required");
      if (!formData.accomplishment || formData.accomplishment < 0) validationErrors.push("Valid accomplishment is required");
      if (!formData.agency) validationErrors.push("Agency is required");
      if (formData.agency === 'Others' && !formData.agencyOther) {
        validationErrors.push("Please specify the agency name");
      }
      
      if (validationErrors.length > 0) {
        alert("Please fix the following errors:\n" + validationErrors.join("\n"));
        return;
      }
      
      data = {
        type: editingMsme ? 'Edit MSME Assistance' : 'New MSME Assistance',
        id: editingMsme ? editingMsme._id : null,
        details: {
          'Month/Year': `${formData.month} ${formData.year}`,
          'Target': `${Number(formData.target).toLocaleString()} MSMEs`,
          'Accomplishment': `${Number(formData.accomplishment).toLocaleString()} MSMEs`,
          'Agency': formData.agency === 'Others' ? formData.agencyOther : formData.agency,
          '% Accomplishment vs Target': `${calculatePercent(formData.target, formData.accomplishment)}%`,
          'Status': Number(formData.accomplishment) >= Number(formData.target) ? 'On Target' : 'Below Target',
          'Notes': formData.notes || 'None'
        }
      };
      
    } else if (type === 'fund') {
      // Use the correct form data based on whether we're editing or creating
      const formData = editingFund ? { ...editingFund } : { ...ncFundForm };
      
      if (!formData.month) validationErrors.push("Month is required");
      if (!formData.availableFunds || formData.availableFunds <= 0) validationErrors.push("Valid available funds is required");
      if (!formData.liquidatedFunds || formData.liquidatedFunds < 0) validationErrors.push("Valid liquidated funds is required");
      if (!formData.purpose) validationErrors.push("Purpose is required");
      if (formData.purpose === 'Others' && !formData.purposeOther) {
        validationErrors.push("Please specify the purpose");
      }
      
      if (validationErrors.length > 0) {
        alert("Please fix the following errors:\n" + validationErrors.join("\n"));
        return;
      }
      
      const available = Number(formData.availableFunds);
      const liquidated = Number(formData.liquidatedFunds);
      const remaining = available - liquidated;
      const percent = ((liquidated / available) * 100).toFixed(1);
      
      data = {
        type: editingFund ? 'Edit Fund Liquidation' : 'New Fund Liquidation',
        id: editingFund ? editingFund._id : null,
        details: {
          'Month/Year': `${formData.month} ${formData.year}`,
          'Available Funds': formatCurrency(available),
          'Liquidated Funds': formatCurrency(liquidated),
          'Funds Remaining': formatCurrency(remaining),
          '% Disbursed': `${percent}%`,
          'Purpose': formData.purpose === 'Others' ? formData.purposeOther : formData.purpose,
          'Remarks': formData.remarks || 'None'
        }
      };
    }
    
    setConfirmationData(data);
    setConfirmationType(type);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      if (confirmationType === 'msme') {
        let payload;
        let url;
        
        if (editingMsme) {
          // Update existing - use form data directly
          payload = { 
            month: ncMsmeForm.month,
            year: Number(ncMsmeForm.year),
            target: Number(ncMsmeForm.target),
            accomplishment: Number(ncMsmeForm.accomplishment),
            agency: ncMsmeForm.agency,
            agencyOther: ncMsmeForm.agencyOther || '',
            notes: ncMsmeForm.notes || ''
          };
          url = `http://localhost:5000/api/nc/nc-msme-assistance/${editingMsme._id}`;
          
          const response = await axios.put(url, payload);
          
          if (response.data.success) {
            setShowConfirmation(false);
            setShowMSMEForm(false);
            setEditingMsme(null);
            resetNCMSMEForm();
            fetchNCData();
            setTimeout(() => alert(`✅ MSME record updated successfully!`), 100);
          }
        } else {
          // Create new
          payload = { 
            month: ncMsmeForm.month,
            year: Number(ncMsmeForm.year),
            target: Number(ncMsmeForm.target),
            accomplishment: Number(ncMsmeForm.accomplishment),
            agency: ncMsmeForm.agency,
            agencyOther: ncMsmeForm.agencyOther || '',
            notes: ncMsmeForm.notes || ''
          };
          url = 'http://localhost:5000/api/nc/nc-msme-assistance';
          
          const response = await axios.post(url, payload);
          
          if (response.data.success) {
            setShowConfirmation(false);
            setShowMSMEForm(false);
            resetNCMSMEForm();
            fetchNCData();
            setTimeout(() => alert(`✅ MSME record added successfully!`), 100);
          }
        }
        
      } else if (confirmationType === 'fund') {
        let payload;
        let url;
        
        if (editingFund) {
          // Update existing - use form data directly
          payload = { 
            month: ncFundForm.month,
            year: Number(ncFundForm.year),
            availableFunds: Number(ncFundForm.availableFunds),
            liquidatedFunds: Number(ncFundForm.liquidatedFunds),
            purpose: ncFundForm.purpose,
            purposeOther: ncFundForm.purposeOther || '',
            remarks: ncFundForm.remarks || ''
          };
          url = `http://localhost:5000/api/nc/nc-fund-liquidation/${editingFund._id}`;
          
          const response = await axios.put(url, payload);
          
          if (response.data.success) {
            setShowConfirmation(false);
            setShowFundForm(false);
            setEditingFund(null);
            resetNCFundForm();
            fetchNCData();
            setTimeout(() => alert(`✅ Fund liquidation record updated successfully!`), 100);
          }
        } else {
          // Create new
          payload = { 
            month: ncFundForm.month,
            year: Number(ncFundForm.year),
            availableFunds: Number(ncFundForm.availableFunds),
            liquidatedFunds: Number(ncFundForm.liquidatedFunds),
            purpose: ncFundForm.purpose,
            purposeOther: ncFundForm.purposeOther || '',
            remarks: ncFundForm.remarks || ''
          };
          url = 'http://localhost:5000/api/nc/nc-fund-liquidation';
          
          const response = await axios.post(url, payload);
          
          if (response.data.success) {
            setShowConfirmation(false);
            setShowFundForm(false);
            resetNCFundForm();
            fetchNCData();
            setTimeout(() => alert(`✅ Fund liquidation record added successfully!`), 100);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || 'Failed to submit form');
      setShowConfirmation(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} record?`)) return;
    
    try {
      const url = type === 'msme' 
        ? `http://localhost:5000/api/nc/nc-msme-assistance/${id}`
        : `http://localhost:5000/api/nc/nc-fund-liquidation/${id}`;
      
      const response = await axios.delete(url);
      
      if (response.data.success) {
        fetchNCData();
        alert(`✅ ${type === 'msme' ? 'MSME' : 'Fund'} record deleted successfully!`);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleEdit = (type, record) => {
    if (type === 'msme') {
      setEditingMsme(record);
      setNcMsmeForm({
        month: record.month,
        year: record.year,
        target: record.target,
        accomplishment: record.accomplishment,
        agency: record.agency,
        agencyOther: record.agencyOther || '',
        notes: record.notes || ''
      });
      setShowMSMEForm(true);
    } else if (type === 'fund') {
      setEditingFund(record);
      setNcFundForm({
        month: record.month,
        year: record.year,
        availableFunds: record.availableFunds,
        liquidatedFunds: record.liquidatedFunds,
        purpose: record.purpose,
        purposeOther: record.purposeOther || '',
        remarks: record.remarks || ''
      });
      setShowFundForm(true);
    }
  };

  const resetNCMSMEForm = () => {
    setNcMsmeForm({
      month: '',
      year: new Date().getFullYear(),
      target: '',
      accomplishment: '',
      agency: '',
      agencyOther: '',
      notes: ''
    });
    setEditingMsme(null);
  };

  const resetNCFundForm = () => {
    setNcFundForm({
      month: '',
      year: new Date().getFullYear(),
      availableFunds: '',
      liquidatedFunds: '',
      purpose: 'MSME Assistance',
      purposeOther: '',
      remarks: ''
    });
    setEditingFund(null);
  };

  const calculatePercent = (target, accomplishment) => {
    if (!target || target === 0) return 0;
    return ((accomplishment / target) * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Prepare data for charts - ensure proper month order
  const msmeChartData = ncMsmeData.map(item => ({
    month: item.month.substring(0, 3),
    fullMonth: item.month,
    target: item.target,
    accomplishment: item.accomplishment,
    percent: calculatePercent(item.target, item.accomplishment),
    status: item.status,
    isAlarming: item.status === 'Below Target',
    record: item
  })).sort((a, b) => monthOrder[a.fullMonth] - monthOrder[b.fullMonth]);

  const fundChartData = ncFundData.map(item => ({
    month: item.month.substring(0, 3),
    fullMonth: item.month,
    available: item.availableFunds,
    liquidated: item.liquidatedFunds,
    remaining: item.fundsRemaining,
    percent: item.percentDisbursed,
    isAlarming: item.percentDisbursed < 30, // Low utilization is alarming
    record: item
  })).sort((a, b) => monthOrder[a.fullMonth] - monthOrder[b.fullMonth]);

  // Composed chart data - Target vs Accomplishment with line for percentage
  const composedChartData = msmeChartData.map(item => ({
    ...item,
    targetAccomplishmentRatio: item.target > 0 ? (item.accomplishment / item.target) * 100 : 0
  }));

  return (
    <div className="p-2 p-md-3">
      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className={`modal-header py-2 ${viewType === 'msme' ? 'bg-primary' : 'bg-warning'} text-white`}>
                <h6 className="modal-title mb-0">{viewData.type}</h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white m-0" 
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="card border mb-3">
                  <div className="card-body p-2">
                    <table className="table table-sm table-borderless mb-0">
                      <tbody>
                        {Object.entries(viewData.details).map(([key, value]) => (
                          <tr key={key} className="border-bottom">
                            <td className="py-2"><small><strong>{key}:</strong></small></td>
                            <td className="py-2 text-end">
                              <small>
                                {key.includes('Status') ? (
                                  <span className={
                                    value.includes('Below Target') ? 'text-danger' :
                                    value.includes('On Target') ? 'text-success' : ''
                                  }>
                                    {value}
                                  </span>
                                ) : key.includes('%') ? (
                                  <span className="fw-bold">{value}</span>
                                ) : (
                                  value
                                )}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header py-2 bg-primary text-white">
                <h6 className="modal-title mb-0">{confirmationData.type}</h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white m-0" 
                  onClick={() => setShowConfirmation(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="alert alert-info py-2 mb-3">
                  <small>Please review before submitting</small>
                </div>
                
                <div className="card border mb-3">
                  <div className="card-body p-2">
                    <table className="table table-sm table-borderless mb-0">
                      <tbody>
                        {Object.entries(confirmationData.details).map(([key, value]) => (
                          <tr key={key} className="border-bottom">
                            <td className="py-2"><small><strong>{key}:</strong></small></td>
                            <td className="py-2 text-end">
                              <small>
                                {key.includes('Status') ? (
                                  <span className={
                                    value.includes('Below Target') ? 'text-danger' :
                                    value.includes('On Target') ? 'text-success' : ''
                                  }>
                                    {value}
                                  </span>
                                ) : (
                                  value
                                )}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-primary" 
                  onClick={handleConfirmSubmit}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MSME Form Modal */}
      {showMSMEForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: showConfirmation || showViewModal ? 1055 : 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header py-2 bg-primary text-white">
                <h6 className="modal-title mb-0">
                  {editingMsme ? `Edit MSME Assistance - ${editingMsme.month} ${editingMsme.year}` : 'Add MSME Assistance'}
                </h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white m-0" 
                  onClick={() => { setShowMSMEForm(false); resetNCMSMEForm(); }}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Month *</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncMsmeForm.month}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, month: e.target.value})}
                      required
                    >
                      <option value="">Select Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Year</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncMsmeForm.year}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, year: e.target.value})}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Target *</small></label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm"
                      value={ncMsmeForm.target}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, target: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Accomplishment *</small></label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm"
                      value={ncMsmeForm.accomplishment}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, accomplishment: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Agency *</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncMsmeForm.agency}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, agency: e.target.value})}
                      required
                    >
                      <option value="">Select Agency</option>
                      {agencies.map(agency => (
                        <option key={agency} value={agency}>{agency}</option>
                      ))}
                    </select>
                  </div>
                  
                  {ncMsmeForm.agency === 'Others' && (
                    <div className="col-12">
                      <label className="form-label mb-1"><small>Specify Agency *</small></label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        value={ncMsmeForm.agencyOther}
                        onChange={(e) => setNcMsmeForm({...ncMsmeForm, agencyOther: e.target.value})}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Notes</small></label>
                    <textarea 
                      className="form-control form-control-sm"
                      value={ncMsmeForm.notes}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, notes: e.target.value})}
                      rows="2"
                    />
                  </div>
                  
                  {(ncMsmeForm.target || ncMsmeForm.accomplishment) && (
                    <div className="col-12 mt-2">
                      <div className="card border">
                        <div className="card-body p-2">
                          <div className="row text-center">
                            <div className="col-md-4">
                              <small className="text-muted d-block">Percent vs Target</small>
                              <div className={`${Number(ncMsmeForm.accomplishment) >= Number(ncMsmeForm.target) ? 'text-success' : 'text-danger'}`}>
                                <small><strong>{calculatePercent(ncMsmeForm.target, ncMsmeForm.accomplishment)}%</strong></small>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted d-block">Status</small>
                              <span className={`badge ${Number(ncMsmeForm.accomplishment) >= Number(ncMsmeForm.target) ? 'bg-success' : 'bg-danger'}`}>
                                <small>{Number(ncMsmeForm.accomplishment) >= Number(ncMsmeForm.target) ? 'On Target' : 'Below Target'}</small>
                              </span>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted d-block">Progress</small>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className={`progress-bar ${Number(ncMsmeForm.accomplishment) >= Number(ncMsmeForm.target) ? 'bg-success' : 'bg-danger'}`}
                                  style={{ 
                                    width: `${Math.min(100, calculatePercent(ncMsmeForm.target, ncMsmeForm.accomplishment))}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => { setShowMSMEForm(false); resetNCMSMEForm(); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-primary" 
                  onClick={() => previewAndConfirm('msme')}
                >
                  {editingMsme ? 'Update Record' : 'Preview & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fund Form Modal */}
      {showFundForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: showConfirmation || showViewModal ? 1055 : 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header py-2 bg-warning">
                <h6 className="modal-title mb-0">
                  {editingFund ? `Edit Fund Liquidation - ${editingFund.month} ${editingFund.year}` : 'Add Fund Liquidation'}
                </h6>
                <button 
                  type="button" 
                  className="btn-close m-0" 
                  onClick={() => { setShowFundForm(false); resetNCFundForm(); }}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Month *</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncFundForm.month}
                      onChange={(e) => setNcFundForm({...ncFundForm, month: e.target.value})}
                      required
                    >
                      <option value="">Select Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Year</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncFundForm.year}
                      onChange={(e) => setNcFundForm({...ncFundForm, year: e.target.value})}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Available Funds *</small></label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm"
                      value={ncFundForm.availableFunds}
                      onChange={(e) => setNcFundForm({...ncFundForm, availableFunds: e.target.value})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Liquidated Funds *</small></label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm"
                      value={ncFundForm.liquidatedFunds}
                      onChange={(e) => setNcFundForm({...ncFundForm, liquidatedFunds: e.target.value})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Purpose *</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncFundForm.purpose}
                      onChange={(e) => setNcFundForm({...ncFundForm, purpose: e.target.value})}
                      required
                    >
                      <option value="">Select Purpose</option>
                      {purposes.map(purpose => (
                        <option key={purpose} value={purpose}>{purpose}</option>
                      ))}
                    </select>
                  </div>
                  
                  {ncFundForm.purpose === 'Others' && (
                    <div className="col-12">
                      <label className="form-label mb-1"><small>Specify Purpose *</small></label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm"
                        value={ncFundForm.purposeOther}
                        onChange={(e) => setNcFundForm({...ncFundForm, purposeOther: e.target.value})}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Remarks</small></label>
                    <textarea 
                      className="form-control form-control-sm"
                      value={ncFundForm.remarks}
                      onChange={(e) => setNcFundForm({...ncFundForm, remarks: e.target.value})}
                      rows="2"
                    />
                  </div>
                  
                  {(ncFundForm.availableFunds || ncFundForm.liquidatedFunds) && (
                    <div className="col-12 mt-2">
                      <div className="card border">
                        <div className="card-body p-2">
                          <div className="row text-center">
                            <div className="col-md-4">
                              <small className="text-muted d-block">Funds Remaining</small>
                              <div className="text-success">
                                <small><strong>
                                  {formatCurrency(
                                    Number(ncFundForm.availableFunds || 0) - Number(ncFundForm.liquidatedFunds || 0)
                                  )}
                                </strong></small>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted d-block">% Disbursed</small>
                              <div>
                                <small><strong>
                                  {Number(ncFundForm.availableFunds) > 0 
                                    ? ((Number(ncFundForm.liquidatedFunds) / Number(ncFundForm.availableFunds)) * 100).toFixed(1)
                                    : '0'}%
                                </strong></small>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted d-block">Progress</small>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar bg-success"
                                  style={{ 
                                    width: `${Math.min(100, 
                                      Number(ncFundForm.availableFunds) > 0 
                                        ? (Number(ncFundForm.liquidatedFunds) / Number(ncFundForm.availableFunds)) * 100 
                                        : 0
                                    )}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => { setShowFundForm(false); resetNCFundForm(); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-warning" 
                  onClick={() => previewAndConfirm('fund')}
                >
                  {editingFund ? 'Update Record' : 'Preview & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - FIXED: Buttons moved to upper right */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <div className="text-center text-md-start">
          <h5 className="fw-bold mb-0">Negosyo Centers</h5>
          <small className="text-muted">Year {selectedYear}</small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center w-100 w-md-auto">
          <div className="btn-group btn-group-sm">
            <button 
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`btn ${activeTab === 'msme' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('msme')}
            >
              MSME
            </button>
            <button 
              className={`btn ${activeTab === 'funds' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('funds')}
            >
              Funds
            </button>
          </div>
          
          <select 
            className="form-select form-select-sm w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Year-Specific Stats Cards - Responsive */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3">
          <div className="card border-primary h-100">
            <div className="card-body p-2 p-md-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-title text-primary mb-1" style={{ fontSize: '0.85rem' }}>MSMEs Assisted</h6>
                  <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>{currentYearStats.totalMsme.toLocaleString()}</h3>
                  <small className="text-muted">Target: {currentYearStats.totalTarget.toLocaleString()}</small>
                </div>
                <div className="text-primary">
                  <i className="bx bx-group" style={{ fontSize: '1.25rem' }}></i>
                </div>
              </div>
              <div className="mt-2">
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ 
                      width: `${currentYearStats.totalTarget > 0 
                        ? Math.min(100, (currentYearStats.totalMsme / currentYearStats.totalTarget) * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  {currentYearStats.msmeRecords} records
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-md-3">
          <div className="card border-success h-100">
            <div className="card-body p-2 p-md-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-title text-success mb-1" style={{ fontSize: '0.85rem' }}>Budget Utilization</h6>
                  <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>{currentYearStats.budgetUtilization}%</h3>
                  <small className="text-muted">Funds Used</small>
                </div>
                <div className="text-success">
                  <i className="bx bx-pie-chart-alt" style={{ fontSize: '1.25rem' }}></i>
                </div>
              </div>
              <div className="mt-2">
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${Math.min(100, parseFloat(currentYearStats.budgetUtilization))}%` }}
                  ></div>
                </div>
                <small className="text-muted">
                  {formatCurrency(currentYearStats.totalLiquidated)} utilized
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-md-3">
          <div className="card border-info h-100">
            <div className="card-body p-2 p-md-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-title text-info mb-1" style={{ fontSize: '0.85rem' }}>Available Funds</h6>
                  <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>{formatCurrency(currentYearStats.totalAvailable)}</h3>
                  <small className="text-muted">Total Allocation</small>
                </div>
                <div className="text-info">
                  <i className="bx bx-wallet" style={{ fontSize: '1.25rem' }}></i>
                </div>
              </div>
              <div className="mt-2">
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    style={{ 
                      width: `${currentYearStats.totalAvailable > 0 
                        ? Math.min(100, (currentYearStats.totalLiquidated / currentYearStats.totalAvailable) * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  {currentYearStats.fundRecords} records
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-md-3">
          <div className="card border-warning h-100">
            <div className="card-body p-2 p-md-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-title text-warning mb-1" style={{ fontSize: '0.85rem' }}>Funds Remaining</h6>
                  <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                    {formatCurrency(currentYearStats.totalAvailable - currentYearStats.totalLiquidated)}
                  </h3>
                  <small className="text-muted">Balance</small>
                </div>
                <div className="text-warning">
                  <i className="bx bx-money" style={{ fontSize: '1.25rem' }}></i>
                </div>
              </div>
              <div className="mt-2">
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ 
                      width: `${currentYearStats.totalAvailable > 0 
                        ? Math.min(100, 
                          ((currentYearStats.totalAvailable - currentYearStats.totalLiquidated) / currentYearStats.totalAvailable) * 100
                        ) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  {((currentYearStats.totalAvailable - currentYearStats.totalLiquidated) / currentYearStats.totalAvailable * 100).toFixed(1)}% remaining
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading data for {selectedYear}...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab - Full Width Visualizations */}
          {activeTab === 'overview' && (
            <>
              {/* MSME Visualization - COMPOSED CHART with red background for alarming months */}
              <div className={`card shadow-sm mb-3 ${msmeFullscreen ? 'position-fixed top-0 start-0 w-100 h-100 m-0' : ''}`}
                   style={msmeFullscreen ? { zIndex: 1040, backgroundColor: 'white' } : {}}>
                <div className="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">MSME Performance - {selectedYear}</h6>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={() => setShowMSMEForm(true)}>
                      + MSME
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setMsmeFullscreen(!msmeFullscreen)}
                    >
                      {msmeFullscreen ? <FullscreenExit size={14} /> : <Fullscreen size={14} />}
                    </button>
                  </div>
                </div>
                <div className="card-body p-2">
                  <div style={{ height: msmeFullscreen ? 'calc(100vh - 200px)' : '300px', minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={composedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis yAxisId="left" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} fontSize={12} />
                        {/* Add red background areas for alarming months */}
                        {composedChartData
                          .filter(item => item.isAlarming)
                          .map((item, index) => (
                            <ReferenceArea
                              key={index}
                              x1={item.month}
                              x2={item.month}
                              yAxisId="left"
                              fill="#ffe6e6"
                              stroke="none"
                              ifOverflow="extendDomain"
                            />
                          ))}
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'targetAccomplishmentRatio') return [`${Number(value).toFixed(1)}%`, '% Accomplishment vs Target'];
                            if (name === 'target') return [value, 'Target (MSMEs)'];
                            if (name === 'accomplishment') return [value, 'Accomplishment (MSMEs)'];
                            return [value, name];
                          }}
                          contentStyle={{ fontSize: '12px', padding: '5px' }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                          verticalAlign="top"
                          height={36}
                        />
                        <Bar yAxisId="left" dataKey="target" fill="#8884d8" name="Target" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="accomplishment" fill="#82ca9d" name="Accomplishment" radius={[2, 2, 0, 0]} />
                        {/* Add red exclamation points for alarming months */}
                        {composedChartData
                          .filter(item => item.isAlarming)
                          .map((item, index) => (
                            <ReferenceDot
                              key={index}
                              x={item.month}
                              y={Math.max(item.target, item.accomplishment) * 1.1}
                              r={6}
                              fill="#ff4d4f"
                              stroke="#d9363e"
                              strokeWidth={2}
                            >
                              <text
                                x={0}
                                y={-8}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                !
                              </text>
                            </ReferenceDot>
                          ))}
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="targetAccomplishmentRatio" 
                          stroke="#ff7300" 
                          name="% Accomplishment vs Target"
                          strokeWidth={2}
                          dot={{ stroke: '#ff7300', strokeWidth: 2, r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2">
                    <div className="row text-center g-1">
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">Target</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{currentYearStats.totalTarget.toLocaleString()}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">Accomplishment</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{currentYearStats.totalMsme.toLocaleString()}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">% vs Target</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                          {currentYearStats.totalTarget > 0 
                            ? ((currentYearStats.totalMsme / currentYearStats.totalTarget) * 100).toFixed(1) 
                            : 0}%
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">Records</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{currentYearStats.msmeRecords}</div>
                      </div>
                    </div>
                    {/* Alarming Months List Container for MSME */}
                    {alarmingMsmeMonths.length > 0 && (
                      <div className="mt-2">
                        <div className="alert alert-danger py-1 mb-2">
                          <div className="d-flex align-items-center">
                            <ExclamationTriangle className="me-2" />
                            <small>
                              <strong>Alarming Data Detected:</strong> {alarmingMsmeMonths.length} month(s) below target.
                            </small>
                          </div>
                        </div>
                        <div className="card border-danger">
                          <div className="card-header py-1 bg-danger text-white">
                            <small className="fw-bold">Alarming Months (MSME)</small>
                          </div>
                          <div className="card-body p-2">
                            <div className="row">
                              <div className="col-12">
                                <small className="text-muted d-block mb-1">Click on any month to view details:</small>
                                <div className="d-flex flex-wrap gap-1">
                                  {alarmingMsmeMonths.map((item, index) => (
                                    <button
                                      key={index}
                                      className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                      onClick={() => viewAlarmingMonth('msme', item.record)}
                                      title={`Click to view ${item.month} details`}
                                    >
                                      <ExclamationTriangle size={12} className="me-1" />
                                      <small>{item.month}</small>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fund Visualization - STACKED BAR + LINE CHART with red background for alarming months */}
              <div className={`card shadow-sm ${fundFullscreen ? 'position-fixed top-0 start-0 w-100 h-100 m-0' : ''}`}
                   style={fundFullscreen ? { zIndex: 1040, backgroundColor: 'white' } : {}}>
                <div className="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Fund Utilization - {selectedYear}</h6>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-warning" onClick={() => setShowFundForm(true)}>
                      + Funds
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setFundFullscreen(!fundFullscreen)}
                    >
                      {fundFullscreen ? <FullscreenExit size={14} /> : <Fullscreen size={14} />}
                    </button>
                  </div>
                </div>
                <div className="card-body p-2">
                  <div style={{ height: fundFullscreen ? 'calc(100vh - 200px)' : '300px', minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={fundChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(value) => formatCurrency(value).replace('PHP', '₱')} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} fontSize={12} />
                        {/* Add red background areas for alarming months */}
                        {fundChartData
                          .filter(item => item.isAlarming)
                          .map((item, index) => (
                            <ReferenceArea
                              key={index}
                              x1={item.month}
                              x2={item.month}
                              fill="#fff8e6"
                              stroke="none"
                              ifOverflow="extendDomain"
                            />
                          ))}
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'percent') return [`${value}%`, '% Disbursed'];
                            if (name === 'available') return [formatCurrency(value), 'Available Funds'];
                            if (name === 'liquidated') return [formatCurrency(value), 'Liquidated Funds'];
                            if (name === 'remaining') return [formatCurrency(value), 'Funds Remaining'];
                            return [value, name];
                          }}
                          contentStyle={{ fontSize: '12px', padding: '5px' }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                          verticalAlign="top"
                          height={36}
                        />
                        <Bar dataKey="available" fill="#8884d8" name="Available Funds" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="liquidated" fill="#82ca9d" name="Liquidated Funds" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="remaining" fill="#ffc658" name="Funds Remaining" radius={[2, 2, 0, 0]} />
                        {/* Add red exclamation points for alarming months */}
                        {fundChartData
                          .filter(item => item.isAlarming)
                          .map((item, index) => (
                            <ReferenceDot
                              key={index}
                              x={item.month}
                              y={Math.max(item.available, item.liquidated) * 1.1}
                              r={6}
                              fill="#ff4d4f"
                              stroke="#d9363e"
                              strokeWidth={2}
                            >
                              <text
                                x={0}
                                y={-8}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                !
                              </text>
                            </ReferenceDot>
                          ))}
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="percent" 
                          stroke="#ff7300" 
                          name="% Disbursed"
                          strokeWidth={2}
                          dot={{ stroke: '#ff7300', strokeWidth: 2, r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2">
                    <div className="row text-center g-1">
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">Available Funds</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formatCurrency(currentYearStats.totalAvailable)}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">Liquidated Funds</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formatCurrency(currentYearStats.totalLiquidated)}</div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">Funds Remaining</small>
                        <div className="fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                          {formatCurrency(currentYearStats.totalAvailable - currentYearStats.totalLiquidated)}
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block">% Disbursed</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{currentYearStats.budgetUtilization}%</div>
                      </div>
                    </div>
                    {/* Alarming Months List Container for Funds */}
                    {alarmingFundMonths.length > 0 && (
                      <div className="mt-2">
                        <div className="alert alert-warning py-1 mb-2">
                          <div className="d-flex align-items-center">
                            <ExclamationTriangle className="me-2" />
                            <small>
                              <strong>Low Utilization Alert:</strong> {alarmingFundMonths.length} month(s) with utilization below 30%.
                            </small>
                          </div>
                        </div>
                        <div className="card border-warning">
                          <div className="card-header py-1 bg-warning text-white">
                            <small className="fw-bold">Alarming Months (Funds)</small>
                          </div>
                          <div className="card-body p-2">
                            <div className="row">
                              <div className="col-12">
                                <small className="text-muted d-block mb-1">Click on any month to view details:</small>
                                <div className="d-flex flex-wrap gap-1">
                                  {alarmingFundMonths.map((item, index) => (
                                    <button
                                      key={index}
                                      className="btn btn-sm btn-outline-warning d-flex align-items-center"
                                      onClick={() => viewAlarmingMonth('fund', item.record)}
                                      title={`Click to view ${item.month} details`}
                                    >
                                      <ExclamationTriangle size={12} className="me-1" />
                                      <small>{item.month}</small>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MSME Records Tab */}
          {activeTab === 'msme' && (
            <div className="card shadow-sm">
              <div className="card-header py-2 bg-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <h6 className="mb-0 text-center text-md-start">MSME Records - {selectedYear}</h6>
                <div className="d-flex gap-2 align-items-center">
                  <div className="position-relative" style={{ minWidth: '200px' }}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search MSME records..."
                        value={msmeSearch}
                        onChange={(e) => setMsmeSearch(e.target.value)}
                      />
                      {msmeSearch && (
                        <button
                          className="btn btn-outline-secondary border-start-0"
                          type="button"
                          onClick={clearMsmeSearch}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowMSMEForm(true)}>
                    + Add Record
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                {filteredMsmeData.length === 0 ? (
                  <div className="text-center p-4 p-md-5">
                    <i className="bx bx-group display-6 text-muted mb-3"></i>
                    <p className="text-muted">
                      {ncMsmeData.length === 0 
                        ? `No MSME records found for ${selectedYear}`
                        : 'No records match your search'}
                    </p>
                    {ncMsmeData.length === 0 && (
                      <button className="btn btn-sm btn-primary" onClick={() => setShowMSMEForm(true)}>
                        Add First Record
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <table className="table table-sm table-hover mb-0">
                        <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                          <tr>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '12%', minWidth: '80px' }}>Month</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '12%', minWidth: '80px' }}>Target</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '15%', minWidth: '100px' }}>Accomplishment</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '18%', minWidth: '120px' }}>Agency</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '20%', minWidth: '140px' }}>% Accomplishment vs Target</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '12%', minWidth: '90px' }}>Status</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '11%', minWidth: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMsmeData.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? '' : 'table-active'}>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{item.month}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{item.target.toLocaleString()}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{item.accomplishment.toLocaleString()}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <small className="text-truncate d-block" style={{ maxWidth: '150px', margin: '0 auto' }}>
                                  {item.agency === 'Others' ? item.agencyOther : item.agency}
                                </small>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <div className="d-flex flex-column align-items-center">
                                  <div className="fw-medium mb-1">{item.percentAccomplishment.toFixed(1)}%</div>
                                  <div className="progress w-75" style={{ height: '5px' }}>
                                    <div 
                                      className={`progress-bar ${item.status === 'On Target' ? 'bg-success' : 'bg-danger'}`}
                                      style={{ width: `${Math.min(100, item.percentAccomplishment)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className={`badge ${item.status === 'On Target' ? 'bg-success' : 'bg-danger'}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <div className="d-flex justify-content-center gap-1">
                                  <button 
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => handleView('msme', item)}
                                    title="View"
                                  >
                                    <Eye size={12} />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEdit('msme', item)}
                                    title="Edit"
                                  >
                                    <PencilSquare size={12} />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete('msme', item._id)}
                                    title="Delete"
                                  >
                                    <Trash size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer border-top px-3 py-2">
                      <small className="text-muted">
                        Showing {filteredMsmeData.length} of {ncMsmeData.length} records
                        {msmeSearch && ` matching "${msmeSearch}"`}
                      </small>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Fund Records Tab */}
          {activeTab === 'funds' && (
            <div className="card shadow-sm">
              <div className="card-header py-2 bg-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <h6 className="mb-0 text-center text-md-start">Fund Records - {selectedYear}</h6>
                <div className="d-flex gap-2 align-items-center">
                  <div className="position-relative" style={{ minWidth: '200px' }}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search fund records..."
                        value={fundSearch}
                        onChange={(e) => setFundSearch(e.target.value)}
                      />
                      {fundSearch && (
                        <button
                          className="btn btn-outline-secondary border-start-0"
                          type="button"
                          onClick={clearFundSearch}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-warning" onClick={() => setShowFundForm(true)}>
                    + Add Record
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                {filteredFundData.length === 0 ? (
                  <div className="text-center p-4 p-md-5">
                    <i className="bx bx-wallet display-6 text-muted mb-3"></i>
                    <p className="text-muted">
                      {ncFundData.length === 0 
                        ? `No fund records found for ${selectedYear}`
                        : 'No records match your search'}
                    </p>
                    {ncFundData.length === 0 && (
                      <button className="btn btn-sm btn-warning" onClick={() => setShowFundForm(true)}>
                        Add First Record
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <table className="table table-sm table-hover mb-0">
                        <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                          <tr>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '12%', minWidth: '80px' }}>Month</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '18%', minWidth: '120px' }}>Purpose</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '15%', minWidth: '100px' }}>Available Funds</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '15%', minWidth: '100px' }}>Liquidated Funds</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '15%', minWidth: '100px' }}>Funds Remaining</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '14%', minWidth: '90px' }}>% Disbursed</th>
                            <th className="py-2 px-2 text-center align-middle" style={{ width: '11%', minWidth: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFundData.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? '' : 'table-active'}>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{item.month}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <small className="text-truncate d-block" style={{ maxWidth: '150px', margin: '0 auto' }}>
                                  {item.purpose === 'Others' ? item.purposeOther : item.purpose}
                                </small>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{formatCurrency(item.availableFunds)}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{formatCurrency(item.liquidatedFunds)}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium text-success">{formatCurrency(item.fundsRemaining)}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <div className="d-flex flex-column align-items-center">
                                  <div className="fw-medium mb-1">{item.percentDisbursed.toFixed(1)}%</div>
                                  <div className="progress w-75" style={{ height: '5px' }}>
                                    <div 
                                      className={`progress-bar ${item.percentDisbursed < 30 ? 'bg-danger' : 'bg-success'}`}
                                      style={{ width: `${Math.min(100, item.percentDisbursed)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <div className="d-flex justify-content-center gap-1">
                                  <button 
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => handleView('fund', item)}
                                    title="View"
                                  >
                                    <Eye size={12} />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => handleEdit('fund', item)}
                                    title="Edit"
                                  >
                                    <PencilSquare size={12} />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete('fund', item._id)}
                                    title="Delete"
                                  >
                                    <Trash size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer border-top px-3 py-2">
                      <small className="text-muted">
                        Showing {filteredFundData.length} of {ncFundData.length} records
                        {fundSearch && ` matching "${fundSearch}"`}
                      </small>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add custom CSS for better responsiveness */}
      <style jsx>{`
        @media (max-width: 768px) {
          .card-header h6 {
            font-size: 0.9rem;
          }
          .btn-group-sm .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
          .form-select-sm {
            padding: 0.25rem 1.75rem 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
          .table th, .table td {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
          }
          .badge {
            font-size: 0.7rem;
          }
          .input-group-sm .form-control {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }
        }
        
        .table th {
          white-space: nowrap;
          background-color: #f8f9fa;
        }
        
        .table td {
          vertical-align: middle;
        }
        
        .progress {
          min-width: 60px;
        }
        
        .btn-sm {
          padding: 0.2rem 0.4rem;
        }
        
        .recharts-legend-item-text {
          font-size: 12px !important;
        }
        
        .recharts-tooltip-label {
          font-size: 12px !important;
        }
        
        .table-footer {
          background-color: #f8f9fa;
        }
        
        .recharts-reference-dot {
          cursor: pointer;
        }
        
        .recharts-reference-dot:hover {
          opacity: 0.8;
        }
        
        .recharts-reference-area {
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default NC;