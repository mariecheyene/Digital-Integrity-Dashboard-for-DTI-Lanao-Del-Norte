import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Line, ReferenceArea
} from "recharts";
import { 
  Fullscreen, FullscreenExit, Eye, PencilSquare, Trash, Search, X, ExclamationTriangle,
  CheckCircle, ExclamationCircle, Printer, FileEarmarkExcel, Pencil
} from 'react-bootstrap-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";

// Toast helper
const showToast = (message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else if (type === 'error') {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Month order for sorting
const monthOrder = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
  'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// SIMPLE FUND ALARMING LOGIC
const getFundStatus = (item) => {
  const liquidated = item.liquidatedFunds;
  const available = item.availableFunds;
  
  // 🔴 CRITICAL - Too much spent OR Too little spent
  if (liquidated > available) {
    return { 
      status: 'Critical - Overspending', 
      level: 'critical', 
      color: '#B22222',
      reason: `Spent ${formatCurrency(liquidated)} > Available ${formatCurrency(available)}`
    };
  }
  if (liquidated < available * 0.3) {
    return { 
      status: 'Critical - Low Utilization', 
      level: 'critical', 
      color: '#B22222',
      reason: `Only ${((liquidated/available)*100).toFixed(1)}% utilized`
    };
  }
  
  // 🟢 NORMAL
  return { 
    status: 'Normal', 
    level: 'normal', 
    color: '#28a745',
    reason: `${((liquidated/available)*100).toFixed(1)}% utilized`
  };
};

const getFundStatusMessage = (item) => {
  const status = getFundStatus(item);
  const remainingPercent = ((item.fundsRemaining / item.availableFunds) * 100).toFixed(1);
  return `${status.status} - ${status.reason} (${remainingPercent}% remaining)`;
};

// Printable View Component
const PrintableView = ({ viewData, viewType, onClose, isAlarmingView = false }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .print-header { text-align: center; margin-bottom: 30px; }
        .print-header h2 { color: #333; margin-bottom: 5px; }
        .print-header p { color: #666; margin: 0; }
        .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .print-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .print-table tr:last-child td { border-bottom: none; }
        .print-label { font-weight: bold; color: #555; width: 40%; }
        .print-value { color: #333; }
        .print-footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        .status-critical { color: #dc3545; font-weight: bold; }
        .status-normal { color: #28a745; font-weight: bold; }
        .print-badge { 
          background: ${viewType === 'msme' ? '#007bff' : '#ffc107'}; 
          color: ${viewType === 'msme' ? 'white' : 'black'};
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 15px;
        }
      </style>
    `;

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${viewData?.type || 'Record'} - Print View</title>
          ${printStyles}
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!viewData) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className={`modal-header py-2 ${viewType === 'msme' ? 'bg-primary' : 'bg-warning'} text-white`}>
            <h6 className="modal-title mb-0">
              {viewData.type} - Printable View
              {isAlarmingView && <span className="badge bg-danger ms-2">ALARMING</span>}
            </h6>
            <button 
              type="button" 
              className="btn-close btn-close-white m-0" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4" ref={printRef}>
            <div className="text-center mb-4">
              <span className={`print-badge ${viewType === 'msme' ? 'bg-primary' : 'bg-warning'} text-white px-3 py-1 rounded-pill`}>
                {viewType === 'msme' ? 'MSME ASSISTANCE' : 'FUND LIQUIDATION'}
              </span>
              <h4 className="mt-3 mb-1">Negosyo Centers - {viewData.type}</h4>
              <p className="text-muted">Generated on: {new Date().toLocaleDateString('en-PH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <table className="print-table">
              <tbody>
                {Object.entries(viewData.details).map(([key, value]) => (
                  <tr key={key}>
                    <td className="print-label">{key}:</td>
                    <td className="print-value">
                      {key.includes('Status') ? (
                        <span className={value.includes('Critical') ? 'status-critical' : 'status-normal'}>
                          {value}
                        </span>
                      ) : key.includes('%') ? (
                        <strong>{value}</strong>
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="print-footer">
              <p>This is an official record from the Negosyo Centers Management System</p>
              <p>Document ID: {viewData.id || 'N/A'}</p>
            </div>
          </div>
          <div className="modal-footer py-2">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary" 
              onClick={onClose}
            >
              Close
            </button>
            {!isAlarmingView && (
              <button 
                type="button" 
                className="btn btn-sm btn-primary" 
                onClick={handlePrint}
              >
                <Printer size={14} className="me-1" /> Print
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Remarks Modal
const AddRemarksModal = ({ show, record, type, onClose, onSave }) => {
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (record) {
      setRemarks(record.notes || record.remarks || '');
    }
  }, [record]);

  const handleSave = async () => {
    await onSave(remarks);
    onClose();
  };

  if (!show || !record) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1090 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header py-2 bg-danger text-white">
            <h6 className="modal-title mb-0">
              <ExclamationTriangle size={16} className="me-2" />
              Add Remarks - {record.month} {record.year} ({type === 'msme' ? 'MSME' : 'Fund'})
            </h6>
            <button 
              type="button" 
              className="btn-close btn-close-white m-0" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-3">
            <div className="mb-3">
              <label className="form-label fw-bold">Status:</label>
              <div className="p-2 rounded bg-danger bg-opacity-10">
                {type === 'msme' 
                  ? `${record.status} (${record.percentAccomplishment?.toFixed(1)}%)`
                  : getFundStatusMessage(record)}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Remarks / Notes:</label>
              <textarea 
                className="form-control" 
                rows="4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks or action plan for this alarming record..."
              />
              <small className="text-muted">These remarks will be saved and visible when viewing this record.</small>
            </div>
          </div>
          <div className="modal-footer py-2">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-danger" 
              onClick={handleSave}
            >
              Save Remarks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NC = () => {
  const [showMSMEForm, setShowMSMEForm] = useState(false);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPrintableModal, setShowPrintableModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewType, setViewType] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [confirmationType, setConfirmationType] = useState('');
  const [selectedAlarmingRecord, setSelectedAlarmingRecord] = useState(null);
  const [alarmingRecordType, setAlarmingRecordType] = useState('');
  
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
  
  const [msmeFormErrors, setMsmeFormErrors] = useState({});
  const [fundFormErrors, setFundFormErrors] = useState({});
  
  const [msmeSearch, setMsmeSearch] = useState("");
  const [fundSearch, setFundSearch] = useState("");
  
  const msmeSearchableFields = [
    'month', 'agency', 'agencyOther', 'target', 'accomplishment', 
    'percentAccomplishment', 'status'
  ];

  const fundSearchableFields = [
    'month', 'purpose', 'purposeOther', 'availableFunds', 
    'liquidatedFunds', 'fundsRemaining', 'percentDisbursed'
  ];
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [msmeFullscreen, setMsmeFullscreen] = useState(false);
  const [fundFullscreen, setFundFullscreen] = useState(false);
  const [editingMsme, setEditingMsme] = useState(null);
  const [editingFund, setEditingFund] = useState(null);
  
  const [alarmingMsmeMonths, setAlarmingMsmeMonths] = useState([]);
  const [criticalFundMonths, setCriticalFundMonths] = useState([]);

  const [ncMsmeForm, setNcMsmeForm] = useState({
    month: '',
    year: new Date().getFullYear(),
    target: '',
    accomplishment: '',
    agency: '',
    agencyOther: '',
    notes: ''
  });
  
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

  useEffect(() => {
    setNcMsmeForm(prev => ({ ...prev, year: selectedYear }));
    setNcFundForm(prev => ({ ...prev, year: selectedYear }));
  }, [selectedYear]);

  useEffect(() => {
    fetchNCData();
  }, [selectedYear]);

  useEffect(() => {
    if (!msmeSearch.trim()) {
      setFilteredMsmeData(ncMsmeData);
    } else {
      const searchLower = msmeSearch.toLowerCase();
      const filtered = ncMsmeData.filter(item => {
        return msmeSearchableFields.some(field => {
          const value = item[field];
          if (value === undefined || value === null) return false;
          return value.toString().toLowerCase().includes(searchLower);
        });
      });
      setFilteredMsmeData(filtered);
    }
  }, [msmeSearch, ncMsmeData]);

  useEffect(() => {
    if (!fundSearch.trim()) {
      setFilteredFundData(ncFundData);
    } else {
      const searchLower = fundSearch.toLowerCase();
      const filtered = ncFundData.filter(item => {
        return fundSearchableFields.some(field => {
          const value = item[field];
          if (value === undefined || value === null) return false;
          return value.toString().toLowerCase().includes(searchLower);
        });
      });
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
        const msmeData = [...msmeRes.data.data].sort((a, b) => {
          return monthOrder[a.month] - monthOrder[b.month];
        });
        setNcMsmeData(msmeData);
        setFilteredMsmeData(msmeData);
        
        const alarmingMsme = msmeData
          .filter(item => item.status === 'Below Target')
          .map(item => ({ month: item.month, record: item }));
        setAlarmingMsmeMonths(alarmingMsme);
        
        const totalMsme = msmeData.reduce((sum, item) => sum + item.accomplishment, 0);
        const totalTarget = msmeData.reduce((sum, item) => sum + item.target, 0);
        
        if (fundRes.data.success) {
          const fundData = [...fundRes.data.data].sort((a, b) => {
            return monthOrder[a.month] - monthOrder[b.month];
          });
          setNcFundData(fundData);
          setFilteredFundData(fundData);
          
          const criticalFund = fundData
            .filter(item => getFundStatus(item).level === 'critical')
            .map(item => ({ 
              month: item.month, 
              record: item, 
              status: getFundStatus(item) 
            }));
          
          setCriticalFundMonths(criticalFund);
          
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
      showToast('Failed to fetch data. Please check if server is running on port 5000', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearMsmeSearch = () => setMsmeSearch("");
  const clearFundSearch = () => setFundSearch("");

  const validateMSMEForm = () => {
    const errors = {};
    if (!ncMsmeForm.month) errors.month = 'Month is required';
    if (!ncMsmeForm.target || ncMsmeForm.target <= 0) errors.target = 'Valid target is required';
    if (!ncMsmeForm.accomplishment || ncMsmeForm.accomplishment < 0) errors.accomplishment = 'Valid accomplishment is required';
    if (!ncMsmeForm.agency) errors.agency = 'Agency is required';
    if (ncMsmeForm.agency === 'Others' && !ncMsmeForm.agencyOther) errors.agencyOther = 'Please specify the agency name';
    
    setMsmeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFundForm = () => {
    const errors = {};
    if (!ncFundForm.month) errors.month = 'Month is required';
    if (!ncFundForm.availableFunds || ncFundForm.availableFunds <= 0) errors.availableFunds = 'Valid available funds is required';
    if (!ncFundForm.liquidatedFunds || ncFundForm.liquidatedFunds < 0) errors.liquidatedFunds = 'Valid liquidated funds is required';
    if (!ncFundForm.purpose) errors.purpose = 'Purpose is required';
    if (ncFundForm.purpose === 'Others' && !ncFundForm.purposeOther) errors.purposeOther = 'Please specify the purpose';
    
    setFundFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleView = (type, record, isAlarming = false) => {
    if (type === 'msme') {
      const viewDetails = {
        type: 'MSME Assistance Record',
        id: record._id,
        isAlarming: isAlarming,
        details: {
          'Month/Year': `${record.month} ${record.year}`,
          'Target': `${Number(record.target).toLocaleString()} MSMEs`,
          'Accomplishment': `${Number(record.accomplishment).toLocaleString()} MSMEs`,
          'Agency': record.agency === 'Others' ? record.agencyOther : record.agency,
          '% Accomplishment vs Target': `${record.percentAccomplishment.toFixed(1)}%`,
          'Status': record.status,
          'Remarks': record.notes || 'None'
        }
      };
      setViewData(viewDetails);
      setViewType('msme');
    } else if (type === 'fund') {
      const fundStatus = getFundStatus(record);
      const remainingPercent = ((record.fundsRemaining / record.availableFunds) * 100).toFixed(1);
      const viewDetails = {
        type: 'Fund Liquidation Record',
        id: record._id,
        isAlarming: isAlarming,
        details: {
          'Month/Year': `${record.month} ${record.year}`,
          'Available Funds': formatCurrency(record.availableFunds),
          'Liquidated Funds': formatCurrency(record.liquidatedFunds),
          'Funds Remaining': formatCurrency(record.fundsRemaining),
          '% Disbursed': `${record.percentDisbursed.toFixed(1)}%`,
          '% Remaining': `${remainingPercent}%`,
          'Status': fundStatus.status,
          'Reason': fundStatus.reason,
          'Purpose': record.purpose === 'Others' ? record.purposeOther : record.purpose,
          'Remarks': record.remarks || 'None'
        }
      };
      setViewData(viewDetails);
      setViewType('fund');
    }
    setShowViewModal(true);
  };

  const handlePrintView = (type, record) => {
    if (type === 'msme') {
      const viewDetails = {
        type: 'MSME Assistance Record',
        id: record._id,
        details: {
          'Month/Year': `${record.month} ${record.year}`,
          'Target': `${Number(record.target).toLocaleString()} MSMEs`,
          'Accomplishment': `${Number(record.accomplishment).toLocaleString()} MSMEs`,
          'Agency': record.agency === 'Others' ? record.agencyOther : record.agency,
          '% Accomplishment vs Target': `${record.percentAccomplishment.toFixed(1)}%`,
          'Status': record.status,
          'Remarks': record.notes || 'None'
        }
      };
      setViewData(viewDetails);
      setViewType('msme');
    } else if (type === 'fund') {
      const fundStatus = getFundStatus(record);
      const remainingPercent = ((record.fundsRemaining / record.availableFunds) * 100).toFixed(1);
      const viewDetails = {
        type: 'Fund Liquidation Record',
        id: record._id,
        details: {
          'Month/Year': `${record.month} ${record.year}`,
          'Available Funds': formatCurrency(record.availableFunds),
          'Liquidated Funds': formatCurrency(record.liquidatedFunds),
          'Funds Remaining': formatCurrency(record.fundsRemaining),
          '% Disbursed': `${record.percentDisbursed.toFixed(1)}%`,
          '% Remaining': `${remainingPercent}%`,
          'Status': fundStatus.status,
          'Reason': fundStatus.reason,
          'Purpose': record.purpose === 'Others' ? record.purposeOther : record.purpose,
          'Remarks': record.remarks || 'None'
        }
      };
      setViewData(viewDetails);
      setViewType('fund');
    }
    setShowPrintableModal(true);
  };

  const handleAddRemarks = (type, record) => {
    setSelectedAlarmingRecord(record);
    setAlarmingRecordType(type);
    setShowRemarksModal(true);
  };

  const handleSaveRemarks = async (remarks) => {
    try {
      if (alarmingRecordType === 'msme') {
        const payload = {
          ...selectedAlarmingRecord,
          notes: remarks
        };
        
        const url = `http://localhost:5000/api/nc/nc-msme-assistance/${selectedAlarmingRecord._id}`;
        const response = await axios.put(url, payload);
        
        if (response.data.success) {
          showToast('✅ Remarks added successfully!');
          fetchNCData();
        }
      } else if (alarmingRecordType === 'fund') {
        const payload = {
          ...selectedAlarmingRecord,
          remarks: remarks
        };
        
        const url = `http://localhost:5000/api/nc/nc-fund-liquidation/${selectedAlarmingRecord._id}`;
        const response = await axios.put(url, payload);
        
        if (response.data.success) {
          showToast('✅ Remarks added successfully!');
          fetchNCData();
        }
      }
    } catch (error) {
      console.error('Error saving remarks:', error);
      showToast('Failed to save remarks', 'error');
    }
  };

  const viewAlarmingMonth = (type, record) => {
    handleView(type, record, true);
  };

  // FIXED: Use current form data for preview, not the original record
  const previewAndConfirm = (type) => {
    let isValid = false;
    if (type === 'msme') {
      isValid = validateMSMEForm();
    } else if (type === 'fund') {
      isValid = validateFundForm();
    }
    
    if (!isValid) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    let data;
    
    if (type === 'msme') {
      // ALWAYS use current form data, not editingMsme
      const formData = { ...ncMsmeForm };
      
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
          'Remarks': formData.notes || 'None'
        }
      };
      
    } else if (type === 'fund') {
      // ALWAYS use current form data, not editingFund
      const formData = { ...ncFundForm };
      
      const available = Number(formData.availableFunds);
      const liquidated = Number(formData.liquidatedFunds);
      const remaining = available - liquidated;
      const percent = ((liquidated / available) * 100).toFixed(1);
      const remainingPercent = ((remaining / available) * 100).toFixed(1);
      
      data = {
        type: editingFund ? 'Edit Fund Liquidation' : 'New Fund Liquidation',
        id: editingFund ? editingFund._id : null,
        details: {
          'Month/Year': `${formData.month} ${formData.year}`,
          'Available Funds': formatCurrency(available),
          'Liquidated Funds': formatCurrency(liquidated),
          'Funds Remaining': formatCurrency(remaining),
          '% Disbursed': `${percent}%`,
          '% Remaining': `${remainingPercent}%`,
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
            showToast('✅ MSME record updated successfully!');
          }
        } else {
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
            showToast('✅ MSME record added successfully!');
          }
        }
        
      } else if (confirmationType === 'fund') {
        let payload;
        let url;
        
        if (editingFund) {
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
            showToast('✅ Fund liquidation record updated successfully!');
          }
        } else {
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
            showToast('✅ Fund liquidation record added successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast(error.response?.data?.message || 'Failed to submit form', 'error');
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
        showToast(`✅ ${type === 'msme' ? 'MSME' : 'Fund'} record deleted successfully!`);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      showToast(error.response?.data?.message || 'Failed to delete record', 'error');
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
      setMsmeFormErrors({});
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
      setFundFormErrors({});
      setShowFundForm(true);
    }
  };

  const resetNCMSMEForm = () => {
    setNcMsmeForm({
      month: '',
      year: selectedYear,
      target: '',
      accomplishment: '',
      agency: '',
      agencyOther: '',
      notes: ''
    });
    setMsmeFormErrors({});
    setEditingMsme(null);
  };

  const resetNCFundForm = () => {
    setNcFundForm({
      month: '',
      year: selectedYear,
      availableFunds: '',
      liquidatedFunds: '',
      purpose: 'MSME Assistance',
      purposeOther: '',
      remarks: ''
    });
    setFundFormErrors({});
    setEditingFund(null);
  };

  const calculatePercent = (target, accomplishment) => {
    if (!target || target === 0) return 0;
    return ((accomplishment / target) * 100).toFixed(1);
  };

  const handleExportCSV = (type) => {
    let dataToExport = [];
    let fileName = '';
    
    if (type === 'msme') {
      fileName = prompt("Enter a name for the MSME CSV file:", `msme_records_${selectedYear}`);
      if (!fileName) return;
      
      dataToExport = filteredMsmeData.map(item => ({
        Month: item.month,
        Year: item.year,
        Target: item.target,
        Accomplishment: item.accomplishment,
        Agency: item.agency === 'Others' ? item.agencyOther : item.agency,
        'Accomplishment %': `${item.percentAccomplishment.toFixed(1)}%`,
        Status: item.status
      }));
    } else if (type === 'fund') {
      fileName = prompt("Enter a name for the Fund CSV file:", `fund_records_${selectedYear}`);
      if (!fileName) return;
      
      dataToExport = filteredFundData.map(item => {
        const status = getFundStatus(item);
        return {
          Month: item.month,
          Year: item.year,
          'Available Funds': item.availableFunds,
          'Liquidated Funds': item.liquidatedFunds,
          'Funds Remaining': item.fundsRemaining,
          'Disbursed %': `${item.percentDisbursed.toFixed(1)}%`,
          'Remaining %': `${((item.fundsRemaining / item.availableFunds) * 100).toFixed(1)}%`,
          Purpose: item.purpose === 'Others' ? item.purposeOther : item.purpose,
          Status: status.status,
          Reason: status.reason
        };
      });
    }

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`✅ ${type === 'msme' ? 'MSME' : 'Fund'} records exported successfully!`);
  };

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

  const fundChartData = ncFundData.map(item => {
    const status = getFundStatus(item);
    return {
      month: item.month.substring(0, 3),
      fullMonth: item.month,
      available: item.availableFunds,
      liquidated: item.liquidatedFunds,
      remaining: item.fundsRemaining,
      percent: item.percentDisbursed,
      remainingPercent: ((item.fundsRemaining / item.availableFunds) * 100).toFixed(1),
      isCritical: status.level === 'critical',
      status: status,
      record: item
    };
  }).sort((a, b) => monthOrder[a.fullMonth] - monthOrder[b.fullMonth]);

  const fundComposedChartData = fundChartData.map(item => ({
    ...item,
    utilizationRate: item.percent
  }));

  const composedChartData = msmeChartData.map(item => ({
    ...item,
    targetAccomplishmentRatio: item.target > 0 ? (item.accomplishment / item.target) * 100 : 0
  }));

  return (
    <div className="p-2 p-md-3 position-relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <AddRemarksModal
        show={showRemarksModal}
        record={selectedAlarmingRecord}
        type={alarmingRecordType}
        onClose={() => setShowRemarksModal(false)}
        onSave={handleSaveRemarks}
      />

      {showPrintableModal && viewData && (
        <PrintableView 
          viewData={viewData}
          viewType={viewType}
          onClose={() => setShowPrintableModal(false)}
          isAlarmingView={viewData.isAlarming}
        />
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className={`modal-header py-2 ${viewData.isAlarming ? 'bg-danger' : (viewType === 'msme' ? 'bg-primary' : 'bg-warning')} text-white`}>
                <h6 className="modal-title mb-0">
                  {viewData.type}
                  {viewData.isAlarming && (
                    <span className="badge bg-white text-danger ms-2">
                      <ExclamationTriangle size={12} className="me-1" />
                      ALARMING
                    </span>
                  )}
                </h6>
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
                                    value.includes('Critical') ? 'text-danger fw-bold' :
                                    value.includes('Below Target') ? 'text-danger' :
                                    value.includes('On Target') || value.includes('Normal') ? 'text-success' : ''
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
                {viewData.isAlarming ? (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setShowViewModal(false);
                        const record = viewType === 'msme' 
                          ? alarmingMsmeMonths.find(m => m.record._id === viewData.id)?.record
                          : criticalFundMonths.find(m => m.record._id === viewData.id)?.record;
                        handleAddRemarks(viewType, record);
                      }}
                    >
                      <Pencil size={14} className="me-1" /> Add Remarks
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => setShowViewModal(false)}
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setShowViewModal(false);
                        setShowPrintableModal(true);
                      }}
                    >
                      <Printer size={14} className="me-1" /> Print
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => setShowViewModal(false)}
                    >
                      Close
                    </button>
                  </>
                )}
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
                  {editingMsme ? `Edit MSME Assistance - ${editingMsme.month} ${editingMsme.year}` : `Add MSME Assistance - ${selectedYear}`}
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
                    <label className="form-label mb-1">
                      <small>Month *</small>
                    </label>
                    <select 
                      className={`form-select form-select-sm ${msmeFormErrors.month ? 'is-invalid' : ''}`}
                      value={ncMsmeForm.month}
                      onChange={(e) => {
                        setNcMsmeForm({...ncMsmeForm, month: e.target.value});
                        if (msmeFormErrors.month) {
                          setMsmeFormErrors({...msmeFormErrors, month: null});
                        }
                      }}
                      required
                    >
                      <option value="">Select Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    {msmeFormErrors.month && (
                      <div className="invalid-feedback d-block">
                        <small>{msmeFormErrors.month}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Year</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncMsmeForm.year}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, year: parseInt(e.target.value)})}
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
                      className={`form-control form-control-sm ${msmeFormErrors.target ? 'is-invalid' : ''}`}
                      value={ncMsmeForm.target}
                      onChange={(e) => {
                        setNcMsmeForm({...ncMsmeForm, target: e.target.value});
                        if (msmeFormErrors.target) {
                          setMsmeFormErrors({...msmeFormErrors, target: null});
                        }
                      }}
                      min="0"
                      required
                    />
                    {msmeFormErrors.target && (
                      <div className="invalid-feedback d-block">
                        <small>{msmeFormErrors.target}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Accomplishment *</small></label>
                    <input 
                      type="number" 
                      className={`form-control form-control-sm ${msmeFormErrors.accomplishment ? 'is-invalid' : ''}`}
                      value={ncMsmeForm.accomplishment}
                      onChange={(e) => {
                        setNcMsmeForm({...ncMsmeForm, accomplishment: e.target.value});
                        if (msmeFormErrors.accomplishment) {
                          setMsmeFormErrors({...msmeFormErrors, accomplishment: null});
                        }
                      }}
                      min="0"
                      required
                    />
                    {msmeFormErrors.accomplishment && (
                      <div className="invalid-feedback d-block">
                        <small>{msmeFormErrors.accomplishment}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Agency *</small></label>
                    <select 
                      className={`form-select form-select-sm ${msmeFormErrors.agency ? 'is-invalid' : ''}`}
                      value={ncMsmeForm.agency}
                      onChange={(e) => {
                        setNcMsmeForm({...ncMsmeForm, agency: e.target.value});
                        if (msmeFormErrors.agency) {
                          setMsmeFormErrors({...msmeFormErrors, agency: null});
                        }
                      }}
                      required
                    >
                      <option value="">Select Agency</option>
                      {agencies.map(agency => (
                        <option key={agency} value={agency}>{agency}</option>
                      ))}
                    </select>
                    {msmeFormErrors.agency && (
                      <div className="invalid-feedback d-block">
                        <small>{msmeFormErrors.agency}</small>
                      </div>
                    )}
                  </div>
                  
                  {ncMsmeForm.agency === 'Others' && (
                    <div className="col-12">
                      <label className="form-label mb-1"><small>Specify Agency *</small></label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${msmeFormErrors.agencyOther ? 'is-invalid' : ''}`}
                        value={ncMsmeForm.agencyOther}
                        onChange={(e) => {
                          setNcMsmeForm({...ncMsmeForm, agencyOther: e.target.value});
                          if (msmeFormErrors.agencyOther) {
                            setMsmeFormErrors({...msmeFormErrors, agencyOther: null});
                          }
                        }}
                        required
                      />
                      {msmeFormErrors.agencyOther && (
                        <div className="invalid-feedback d-block">
                          <small>{msmeFormErrors.agencyOther}</small>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Remarks</small></label>
                    <textarea 
                      className="form-control form-control-sm"
                      value={ncMsmeForm.notes}
                      onChange={(e) => setNcMsmeForm({...ncMsmeForm, notes: e.target.value})}
                      rows="2"
                      placeholder="Enter any remarks or notes..."
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
                  {editingFund ? `Edit Fund Liquidation - ${editingFund.month} ${editingFund.year}` : `Add Fund Liquidation - ${selectedYear}`}
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
                      className={`form-select form-select-sm ${fundFormErrors.month ? 'is-invalid' : ''}`}
                      value={ncFundForm.month}
                      onChange={(e) => {
                        setNcFundForm({...ncFundForm, month: e.target.value});
                        if (fundFormErrors.month) {
                          setFundFormErrors({...fundFormErrors, month: null});
                        }
                      }}
                      required
                    >
                      <option value="">Select Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    {fundFormErrors.month && (
                      <div className="invalid-feedback d-block">
                        <small>{fundFormErrors.month}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Year</small></label>
                    <select 
                      className="form-select form-select-sm"
                      value={ncFundForm.year}
                      onChange={(e) => setNcFundForm({...ncFundForm, year: parseInt(e.target.value)})}
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
                      className={`form-control form-control-sm ${fundFormErrors.availableFunds ? 'is-invalid' : ''}`}
                      value={ncFundForm.availableFunds}
                      onChange={(e) => {
                        setNcFundForm({...ncFundForm, availableFunds: e.target.value});
                        if (fundFormErrors.availableFunds) {
                          setFundFormErrors({...fundFormErrors, availableFunds: null});
                        }
                      }}
                      min="0"
                      step="0.01"
                      required
                    />
                    {fundFormErrors.availableFunds && (
                      <div className="invalid-feedback d-block">
                        <small>{fundFormErrors.availableFunds}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label mb-1"><small>Liquidated Funds *</small></label>
                    <input 
                      type="number" 
                      className={`form-control form-control-sm ${fundFormErrors.liquidatedFunds ? 'is-invalid' : ''}`}
                      value={ncFundForm.liquidatedFunds}
                      onChange={(e) => {
                        setNcFundForm({...ncFundForm, liquidatedFunds: e.target.value});
                        if (fundFormErrors.liquidatedFunds) {
                          setFundFormErrors({...fundFormErrors, liquidatedFunds: null});
                        }
                      }}
                      min="0"
                      step="0.01"
                      required
                    />
                    {fundFormErrors.liquidatedFunds && (
                      <div className="invalid-feedback d-block">
                        <small>{fundFormErrors.liquidatedFunds}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Purpose *</small></label>
                    <select 
                      className={`form-select form-select-sm ${fundFormErrors.purpose ? 'is-invalid' : ''}`}
                      value={ncFundForm.purpose}
                      onChange={(e) => {
                        setNcFundForm({...ncFundForm, purpose: e.target.value});
                        if (fundFormErrors.purpose) {
                          setFundFormErrors({...fundFormErrors, purpose: null});
                        }
                      }}
                      required
                    >
                      <option value="">Select Purpose</option>
                      {purposes.map(purpose => (
                        <option key={purpose} value={purpose}>{purpose}</option>
                      ))}
                    </select>
                    {fundFormErrors.purpose && (
                      <div className="invalid-feedback d-block">
                        <small>{fundFormErrors.purpose}</small>
                      </div>
                    )}
                  </div>
                  
                  {ncFundForm.purpose === 'Others' && (
                    <div className="col-12">
                      <label className="form-label mb-1"><small>Specify Purpose *</small></label>
                      <input 
                        type="text" 
                        className={`form-control form-control-sm ${fundFormErrors.purposeOther ? 'is-invalid' : ''}`}
                        value={ncFundForm.purposeOther}
                        onChange={(e) => {
                          setNcFundForm({...ncFundForm, purposeOther: e.target.value});
                          if (fundFormErrors.purposeOther) {
                            setFundFormErrors({...fundFormErrors, purposeOther: null});
                          }
                        }}
                        required
                      />
                      {fundFormErrors.purposeOther && (
                        <div className="invalid-feedback d-block">
                          <small>{fundFormErrors.purposeOther}</small>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="col-12">
                    <label className="form-label mb-1"><small>Remarks</small></label>
                    <textarea 
                      className="form-control form-control-sm"
                      value={ncFundForm.remarks}
                      onChange={(e) => setNcFundForm({...ncFundForm, remarks: e.target.value})}
                      rows="2"
                      placeholder="Enter any remarks or notes..."
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
                              <small className="text-muted d-block">% Remaining</small>
                              <div>
                                <small><strong>
                                  {Number(ncFundForm.availableFunds) > 0 
                                    ? ((Number(ncFundForm.availableFunds) - Number(ncFundForm.liquidatedFunds)) / Number(ncFundForm.availableFunds) * 100).toFixed(1)
                                    : '0'}%
                                </strong></small>
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

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <div className="text-center text-md-start">
          <h5 className="fw-bold mb-0">Negosyo Centers</h5>
          <small className="text-muted">Year {selectedYear}</small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center justify-content-md-end w-100 w-md-auto">
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

      {/* Stats Cards */}
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
                  {currentYearStats.totalAvailable > 0 
                    ? ((currentYearStats.totalAvailable - currentYearStats.totalLiquidated) / currentYearStats.totalAvailable * 100).toFixed(1) 
                    : 0}% remaining
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* MSME Chart */}
              <div className={`card shadow-sm mb-3 ${msmeFullscreen ? 'position-fixed top-0 start-0 w-100 h-100 m-0' : ''}`}
                   style={msmeFullscreen ? { zIndex: 1040, backgroundColor: 'white' } : {}}>
                <div className="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">MSME Performance - {selectedYear}</h6>
                  </div>
                  <div className="d-flex gap-2">
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
                        {composedChartData
                          .filter(item => item.isAlarming)
                          .map((item, index) => (
                            <ReferenceArea
                              key={index}
                              x1={item.month}
                              x2={item.month}
                              yAxisId="left"
                              fill="#B22222"
                              fillOpacity={0.4}
                              stroke="#8B0000"
                              strokeWidth={1}
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
                    
                    {alarmingMsmeMonths.length > 0 && (
                      <div className="mt-2">
                        <div className="alert py-1 mb-2" style={{ backgroundColor: '#B22222', color: 'white', border: 'none' }}>
                          <div className="d-flex align-items-center">
                            <ExclamationTriangle className="me-2" />
                            <small>
                              <strong>🔴 ALARMING:</strong> {alarmingMsmeMonths.length} month(s) below target.
                            </small>
                          </div>
                        </div>
                        <div className="card" style={{ borderColor: '#B22222', borderWidth: '2px' }}>
                          <div className="card-header py-1" style={{ backgroundColor: '#B22222', color: 'white' }}>
                            <small className="fw-bold">Alarming Months (MSME)</small>
                            <span className="badge bg-light text-danger ms-2">{alarmingMsmeMonths.length} months</span>
                          </div>
                          <div className="card-body p-2">
                            <div className="row">
                              <div className="col-12">
                                <small className="text-muted d-block mb-1">Click on any month to view details and add remarks:</small>
                                <div className="d-flex flex-wrap gap-1">
                                  {alarmingMsmeMonths.map((item, index) => (
                                    <button
                                      key={index}
                                      className="btn btn-sm d-flex align-items-center"
                                      style={{ backgroundColor: '#B22222', color: 'white', borderColor: '#B22222' }}
                                      onClick={() => viewAlarmingMonth('msme', item.record)}
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

              {/* Fund Chart */}
              <div className={`card shadow-sm ${fundFullscreen ? 'position-fixed top-0 start-0 w-100 h-100 m-0' : ''}`}
                   style={fundFullscreen ? { zIndex: 1040, backgroundColor: 'white' } : {}}>
                <div className="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Fund Utilization - {selectedYear}</h6>
                  </div>
                  <div className="d-flex gap-2">
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
                      <ComposedChart data={fundComposedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis yAxisId="left" fontSize={12} tickFormatter={(value) => formatCurrency(value).replace('PHP', '₱')} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} fontSize={12} />
                        {fundComposedChartData
                          .filter(item => item.isCritical)
                          .map((item, index) => (
                            <ReferenceArea
                              key={index}
                              x1={item.month}
                              x2={item.month}
                              yAxisId="left"
                              fill="#B22222"
                              fillOpacity={0.4}
                              stroke="#8B0000"
                              strokeWidth={1}
                              ifOverflow="extendDomain"
                            />
                          ))}
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'utilizationRate') return [`${Number(value).toFixed(1)}%`, '% Utilization'];
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
                        <Bar yAxisId="left" dataKey="available" fill="#8884d8" name="Available Funds" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="liquidated" fill="#82ca9d" name="Liquidated Funds" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="remaining" fill="#ffc658" name="Funds Remaining" radius={[2, 2, 0, 0]} />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="utilizationRate" 
                          stroke="#ff7300" 
                          name="% Utilization"
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
                        <small className="text-muted d-block">% Utilization</small>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{currentYearStats.budgetUtilization}%</div>
                      </div>
                    </div>
                    
                    {criticalFundMonths.length > 0 && (
                      <div className="mt-2">
                        <div className="alert py-1 mb-2" style={{ backgroundColor: '#B22222', color: 'white', border: 'none' }}>
                          <div className="d-flex align-items-center">
                            <ExclamationTriangle className="me-2" />
                            <small>
                              <strong>🔴 CRITICAL:</strong> {criticalFundMonths.length} month(s) require immediate attention.
                            </small>
                          </div>
                        </div>
                        <div className="card" style={{ borderColor: '#B22222', borderWidth: '2px' }}>
                          <div className="card-header py-1" style={{ backgroundColor: '#B22222', color: 'white' }}>
                            <small className="fw-bold">Critical Months (Funds)</small>
                            <span className="badge bg-light text-danger ms-2">{criticalFundMonths.length} months</span>
                          </div>
                          <div className="card-body p-2">
                            <div className="row">
                              <div className="col-12">
                                <small className="text-muted d-block mb-1">Click on any month to view details and add remarks:</small>
                                <div className="d-flex flex-wrap gap-1">
                                  {criticalFundMonths.map((item, index) => (
                                    <button
                                      key={index}
                                      className="btn btn-sm d-flex align-items-center"
                                      style={{ backgroundColor: '#B22222', color: 'white', borderColor: '#B22222' }}
                                      onClick={() => viewAlarmingMonth('fund', item.record)}
                                    >
                                      <ExclamationTriangle size={12} className="me-1" />
                                      <small>{item.month}</small>
                                      <span className="badge bg-light text-dark ms-1" style={{ fontSize: '0.7rem' }}>
                                        {item.record.liquidatedFunds > item.record.availableFunds ? 'Over' : 'Low'}
                                      </span>
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

          {/* MSME Records Tab - FIXED: Removed extra column */}
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
                  <button 
                    className="btn btn-sm btn-success" 
                    onClick={() => handleExportCSV('msme')}
                  >
                    <FileEarmarkExcel size={14} className="me-1" /> CSV
                  </button>
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
                  <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                        <tr>
                          <th className="py-2 px-2 text-center align-middle">Month</th>
                          <th className="py-2 px-2 text-center align-middle">Target</th>
                          <th className="py-2 px-2 text-center align-middle">Accomplishment</th>
                          <th className="py-2 px-2 text-center align-middle">Agency</th>
                          <th className="py-2 px-2 text-center align-middle">% Accomplishment</th>
                          <th className="py-2 px-2 text-center align-middle">Status</th>
                          <th className="py-2 px-2 text-center align-middle">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMsmeData.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? '' : 'table-active'}>
                            <td className="py-2 px-2 text-center align-middle">
                              <span className="fw-medium">{item.month}</span>
                            </td>
                            <td className="py-2 px-2 text-center align-middle">
                              {item.target.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-center align-middle">
                              {item.accomplishment.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-center align-middle">
                              <small>{item.agency === 'Others' ? item.agencyOther : item.agency}</small>
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
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handlePrintView('msme', item)}
                                  title="Print"
                                >
                                  <Printer size={12} />
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
                    <div className="table-footer border-top px-3 py-2">
                      <small className="text-muted">
                        Showing {filteredMsmeData.length} of {ncMsmeData.length} records
                        {msmeSearch && ` matching "${msmeSearch}"`}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fund Records Tab - FIXED: Removed extra column to fix cut-off issue */}
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
                  <button 
                    className="btn btn-sm btn-success" 
                    onClick={() => handleExportCSV('fund')}
                  >
                    <FileEarmarkExcel size={14} className="me-1" /> CSV
                  </button>
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
                  <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                        <tr>
                          <th className="py-2 px-2 text-center align-middle">Month</th>
                          <th className="py-2 px-2 text-center align-middle">Purpose</th>
                          <th className="py-2 px-2 text-center align-middle">Available</th>
                          <th className="py-2 px-2 text-center align-middle">Liquidated</th>
                          <th className="py-2 px-2 text-center align-middle">Remaining</th>
                          <th className="py-2 px-2 text-center align-middle">% Used</th>
                          <th className="py-2 px-2 text-center align-middle">Status</th>
                          <th className="py-2 px-2 text-center align-middle">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFundData.map((item, index) => {
                          const fundStatus = getFundStatus(item);
                          return (
                            <tr key={index} className={index % 2 === 0 ? '' : 'table-active'}>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className="fw-medium">{item.month}</span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <small className="text-truncate d-block" style={{ maxWidth: '120px' }}>
                                  {item.purpose === 'Others' ? item.purposeOther : item.purpose}
                                </small>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                {formatCurrency(item.availableFunds)}
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                {formatCurrency(item.liquidatedFunds)}
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className={`fw-medium ${
                                  fundStatus.level === 'critical' ? 'text-danger fw-bold' : 'text-success'
                                }`}>
                                  {formatCurrency(item.fundsRemaining)}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <div className="d-flex flex-column align-items-center">
                                  <div className={`fw-medium mb-1 ${
                                    fundStatus.level === 'critical' ? 'text-danger fw-bold' : ''
                                  }`}>
                                    {item.percentDisbursed.toFixed(1)}%
                                  </div>
                                  <div className="progress w-75" style={{ height: '5px' }}>
                                    <div 
                                      className={`progress-bar ${fundStatus.level === 'critical' ? 'bg-danger' : 'bg-success'}`}
                                      style={{ width: `${Math.min(100, item.percentDisbursed)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center align-middle">
                                <span className={`badge ${fundStatus.level === 'critical' ? 'bg-danger' : 'bg-success'}`}>
                                  {fundStatus.level === 'critical' ? 'CRITICAL' : 'Normal'}
                                </span>
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
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handlePrintView('fund', item)}
                                    title="Print"
                                  >
                                    <Printer size={12} />
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
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="table-footer border-top px-3 py-2">
                      <small className="text-muted">
                        Showing {filteredFundData.length} of {ncFundData.length} records
                        {fundSearch && ` matching "${fundSearch}"`}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .card-header h6 { font-size: 0.9rem; }
          .btn-group-sm .btn { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
          .form-select-sm { padding: 0.25rem 1.75rem 0.25rem 0.5rem; font-size: 0.75rem; }
          .table th, .table td { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
          .badge { font-size: 0.7rem; }
          .input-group-sm .form-control { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
        }
        .table th { white-space: nowrap; background-color: #f8f9fa; }
        .table td { vertical-align: middle; }
        .progress { min-width: 60px; }
        .btn-sm { padding: 0.2rem 0.4rem; }
        .recharts-legend-item-text { font-size: 12px !important; }
        .recharts-tooltip-label { font-size: 12px !important; }
        .table-footer { background-color: #f8f9fa; }
        .is-invalid { border-color: #dc3545 !important; }
        .invalid-feedback { color: #dc3545; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
};

export default NC;