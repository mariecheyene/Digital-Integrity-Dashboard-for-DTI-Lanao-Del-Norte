import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Line
} from "recharts";
import { 
  Fullscreen, FullscreenExit, Eye, Printer, FileEarmarkExcel, 
  Search, X, ExclamationTriangle, Pencil, Upload, Download,
  FileEarmark, FileEarmarkSpreadsheet, CheckCircle,
  ExclamationCircle, PlusCircle, InfoCircle
} from 'react-bootstrap-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import * as XLSX from 'xlsx';

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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format date for input
const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

// Enums from backend
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GENDERS = ['Male', 'Female', 'Prefer not to say', 'Others'];

const PRIORITY_INDUSTRIES = [
  'Agriculture', 'Aquaculture', 'Food Processing', 'Manufacturing',
  'Retail/Wholesale', 'Services', 'Construction', 'Transportation',
  'Education', 'Healthcare', 'Tourism/Hospitality', 'IT/BPO',
  'Creative Industries', 'Others'
];

const EDT_LEVELS = [
  'Level 1 - MSME', 'Level 2 - SME', 'Level 3 - Large Enterprise',
  'Not Applicable'
];

const TYPES_OF_ASSISTANCE = [
  'Business Advisory', 'Financial Assistance', 'Marketing Assistance',
  'Product Development', 'Training/Seminar', 'Mentoring/Coaching',
  'Linking/Networking', 'Technical Assistance', 'Others'
];

const STRATEGIC_MEASURES = [
  'Increased Access to Finance',
  'Enhanced Market Access',
  'Improved Productivity and Efficiency',
  'Strengthened Business Resilience',
  'Digital Transformation',
  'Regulatory Compliance Assistance',
  'Others'
];

// Add Record Modal Component - UPDATED to match backend changes
const AddRecordModal = ({ show, onClose, onSave, selectedYear }) => {
  const [formData, setFormData] = useState({
    timeStamp: new Date().toISOString().split('T')[0],
    month: MONTHS[new Date().getMonth()],
    year: selectedYear,
    unit: '',
    assistedBy: '',
    ownerName: '',
    gender: 'Prefer not to say',
    genderOther: '',
    businessName: '',
    cityMunicipality: '',
    priorityIndustry: 'Others',
    priorityIndustryOther: '',
    edtLevel: 'Not Applicable',
    typeOfAssistance: 'Others',
    typeOfAssistanceOther: '',
    strategicMeasure: 'Others',
    strategicMeasureOther: '',
    assistanceTitle: '',
    assistanceDate: new Date().toISOString().split('T')[0],
    ecommerce: 'N',
    ecommerceLinkOrNo: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setFormData({
        timeStamp: new Date().toISOString().split('T')[0],
        month: MONTHS[new Date().getMonth()],
        year: selectedYear,
        unit: '',
        assistedBy: '',
        ownerName: '',
        gender: 'Prefer not to say',
        genderOther: '',
        businessName: '',
        cityMunicipality: '',
        priorityIndustry: 'Others',
        priorityIndustryOther: '',
        edtLevel: 'Not Applicable',
        typeOfAssistance: 'Others',
        typeOfAssistanceOther: '',
        strategicMeasure: 'Others',
        strategicMeasureOther: '',
        assistanceTitle: '',
        assistanceDate: new Date().toISOString().split('T')[0],
        ecommerce: 'N',
        ecommerceLinkOrNo: ''
      });
      setErrors({});
    }
  }, [show, selectedYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate required fields - make all optional
    if (formData.gender === 'Others' && !formData.genderOther) {
      newErrors.genderOther = 'Please specify gender';
    }
    
    if (formData.priorityIndustry === 'Others' && !formData.priorityIndustryOther) {
      newErrors.priorityIndustryOther = 'Please specify priority industry';
    }
    
    if (formData.typeOfAssistance === 'Others' && !formData.typeOfAssistanceOther) {
      newErrors.typeOfAssistanceOther = 'Please specify type of assistance';
    }
    
    if (formData.strategicMeasure === 'Others' && !formData.strategicMeasureOther) {
      newErrors.strategicMeasureOther = 'Please specify strategic measure';
    }
    
    const ecommValue = String(formData.ecommerce || '').toUpperCase();
    if ((ecommValue === 'Y' || ecommValue === 'YES') && !formData.ecommerceLinkOrNo) {
      newErrors.ecommerceLinkOrNo = 'E-commerce link is recommended when e-commerce is Yes';
    }

    setErrors(newErrors);
    return true; // Always return true - allow submission even with warnings
  };

  const handleSubmit = async () => {
    validateForm(); // Show warnings but don't block
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        timeStamp: formData.timeStamp ? new Date(formData.timeStamp) : new Date(),
        assistanceDate: formData.assistanceDate ? new Date(formData.assistanceDate) : new Date(),
        ecommerce: formData.ecommerce
      };

      const response = await axios.post('http://localhost:5000/api/nc/nc-data', payload);
      
      if (response.data.success) {
        showToast('✅ Record added successfully!', 'success');
        if (response.data.warnings && response.data.warnings.length > 0) {
          showToast(`⚠️ ${response.data.warnings.length} warnings`, 'info');
        }
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error adding record:', error);
      showToast(error.response?.data?.message || 'Failed to add record', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return React.createElement("div",
    { className: "modal fade show d-block", style: { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 } },
    React.createElement("div", { className: "modal-dialog modal-xl modal-dialog-scrollable" },
      React.createElement("div", { className: "modal-content" },
        React.createElement("div", { className: "modal-header py-2 bg-success text-white" },
          React.createElement("h6", { className: "modal-title mb-0" },
            React.createElement(PlusCircle, { className: "me-2", size: 16 }),
            "Add New NC Data Record"
          ),
          React.createElement("button", {
            type: "button",
            className: "btn-close btn-close-white m-0",
            onClick: onClose
          })
        ),
        React.createElement("div", { className: "modal-body p-3" },
          React.createElement("div", { className: "alert alert-info py-2 mb-3" },
            React.createElement("div", { className: "d-flex align-items-center" },
              React.createElement(InfoCircle, { className: "me-2", size: 16 }),
              React.createElement("small", null,
                "All fields are optional. Non-standard values will be saved in 'Other' fields."
              )
            )
          ),
          React.createElement("div", { className: "row g-3" },
            // Basic Information
            React.createElement("div", { className: "col-12" },
              React.createElement("h6", { className: "border-bottom pb-2" }, "Basic Information")
            ),
            React.createElement("div", { className: "col-md-4" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Timestamp")
              ),
              React.createElement("input", {
                type: "date",
                className: "form-control form-control-sm",
                name: "timeStamp",
                value: formData.timeStamp,
                onChange: handleChange
              })
            ),
            React.createElement("div", { className: "col-md-4" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Month")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "month",
                value: formData.month,
                onChange: handleChange
              },
                MONTHS.map(m =>
                  React.createElement("option", { key: m, value: m }, m)
                )
              )
            ),
            React.createElement("div", { className: "col-md-4" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Year")
              ),
              React.createElement("input", {
                type: "number",
                className: "form-control form-control-sm",
                name: "year",
                value: formData.year,
                onChange: handleChange
              })
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Unit")
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control form-control-sm",
                name: "unit",
                value: formData.unit,
                onChange: handleChange,
                placeholder: "e.g., Negosyo Center Manila"
              })
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Assisted By")
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control form-control-sm",
                name: "assistedBy",
                value: formData.assistedBy,
                onChange: handleChange,
                placeholder: "Staff name"
              })
            ),

            // Personnel Information
            React.createElement("div", { className: "col-12 mt-3" },
              React.createElement("h6", { className: "border-bottom pb-2" }, "Personnel Information")
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Owner's Name")
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control form-control-sm",
                name: "ownerName",
                value: formData.ownerName,
                onChange: handleChange,
                placeholder: "Full name"
              })
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Gender")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "gender",
                value: formData.gender,
                onChange: handleChange
              },
                GENDERS.map(g =>
                  React.createElement("option", { key: g, value: g }, g)
                )
              )
            ),
            formData.gender === 'Others' &&
              React.createElement("div", { className: "col-md-6" },
                React.createElement("label", { className: "form-label mb-1" },
                  React.createElement("small", { className: "fw-bold" }, "Specify Gender")
                ),
                React.createElement("input", {
                  type: "text",
                  className: `form-control form-control-sm ${errors.genderOther ? 'is-invalid' : ''}`,
                  name: "genderOther",
                  value: formData.genderOther,
                  onChange: handleChange,
                  placeholder: "Please specify"
                }),
                errors.genderOther && React.createElement("div", { className: "invalid-feedback" }, errors.genderOther)
              ),

            // Business Information
            React.createElement("div", { className: "col-12 mt-3" },
              React.createElement("h6", { className: "border-bottom pb-2" }, "Business Information")
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Business Name")
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control form-control-sm",
                name: "businessName",
                value: formData.businessName,
                onChange: handleChange,
                placeholder: "Business name"
              })
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "City/Municipality")
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control form-control-sm",
                name: "cityMunicipality",
                value: formData.cityMunicipality,
                onChange: handleChange,
                placeholder: "City or Municipality"
              })
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Priority Industry")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "priorityIndustry",
                value: formData.priorityIndustry,
                onChange: handleChange
              },
                PRIORITY_INDUSTRIES.map(i =>
                  React.createElement("option", { key: i, value: i }, i)
                )
              )
            ),
            formData.priorityIndustry === 'Others' &&
              React.createElement("div", { className: "col-md-6" },
                React.createElement("label", { className: "form-label mb-1" },
                  React.createElement("small", { className: "fw-bold" }, "Specify Industry")
                ),
                React.createElement("input", {
                  type: "text",
                  className: `form-control form-control-sm ${errors.priorityIndustryOther ? 'is-invalid' : ''}`,
                  name: "priorityIndustryOther",
                  value: formData.priorityIndustryOther,
                  onChange: handleChange,
                  placeholder: "Please specify"
                }),
                errors.priorityIndustryOther && React.createElement("div", { className: "invalid-feedback" }, errors.priorityIndustryOther)
              ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "EDT Level")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "edtLevel",
                value: formData.edtLevel,
                onChange: handleChange
              },
                EDT_LEVELS.map(e =>
                  React.createElement("option", { key: e, value: e }, e)
                )
              )
            ),

            // Assistance Information
            React.createElement("div", { className: "col-12 mt-3" },
              React.createElement("h6", { className: "border-bottom pb-2" }, "Assistance Information")
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Type of Assistance")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "typeOfAssistance",
                value: formData.typeOfAssistance,
                onChange: handleChange
              },
                TYPES_OF_ASSISTANCE.map(t =>
                  React.createElement("option", { key: t, value: t }, t)
                )
              )
            ),
            formData.typeOfAssistance === 'Others' &&
              React.createElement("div", { className: "col-md-6" },
                React.createElement("label", { className: "form-label mb-1" },
                  React.createElement("small", { className: "fw-bold" }, "Specify Assistance Type")
                ),
                React.createElement("input", {
                  type: "text",
                  className: `form-control form-control-sm ${errors.typeOfAssistanceOther ? 'is-invalid' : ''}`,
                  name: "typeOfAssistanceOther",
                  value: formData.typeOfAssistanceOther,
                  onChange: handleChange,
                  placeholder: "Please specify"
                }),
                errors.typeOfAssistanceOther && React.createElement("div", { className: "invalid-feedback" }, errors.typeOfAssistanceOther)
              ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Strategic Measure")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "strategicMeasure",
                value: formData.strategicMeasure,
                onChange: handleChange
              },
                STRATEGIC_MEASURES.map(s =>
                  React.createElement("option", { key: s, value: s }, s)
                )
              )
            ),
            formData.strategicMeasure === 'Others' &&
              React.createElement("div", { className: "col-md-6" },
                React.createElement("label", { className: "form-label mb-1" },
                  React.createElement("small", { className: "fw-bold" }, "Specify Strategic Measure")
                ),
                React.createElement("input", {
                  type: "text",
                  className: `form-control form-control-sm ${errors.strategicMeasureOther ? 'is-invalid' : ''}`,
                  name: "strategicMeasureOther",
                  value: formData.strategicMeasureOther,
                  onChange: handleChange,
                  placeholder: "Please specify"
                }),
                errors.strategicMeasureOther && React.createElement("div", { className: "invalid-feedback" }, errors.strategicMeasureOther)
              ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Assistance Title")
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control form-control-sm",
                name: "assistanceTitle",
                value: formData.assistanceTitle,
                onChange: handleChange,
                placeholder: "Title of assistance"
              })
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Assistance Date")
              ),
              React.createElement("input", {
                type: "date",
                className: "form-control form-control-sm",
                name: "assistanceDate",
                value: formData.assistanceDate,
                onChange: handleChange
              })
            ),

            // E-commerce Information
            React.createElement("div", { className: "col-12 mt-3" },
              React.createElement("h6", { className: "border-bottom pb-2" }, "E-commerce Information")
            ),
            React.createElement("div", { className: "col-md-4" },
              React.createElement("label", { className: "form-label mb-1" },
                React.createElement("small", { className: "fw-bold" }, "Has E-commerce?")
              ),
              React.createElement("select", {
                className: "form-select form-select-sm",
                name: "ecommerce",
                value: formData.ecommerce,
                onChange: handleChange
              },
                React.createElement("option", { value: "Y" }, "Yes"),
                React.createElement("option", { value: "N" }, "No")
              )
            ),
            formData.ecommerce === 'Y' &&
              React.createElement("div", { className: "col-md-8" },
                React.createElement("label", { className: "form-label mb-1" },
                  React.createElement("small", { className: "fw-bold" }, "E-commerce Link / Number")
                ),
                React.createElement("input", {
                  type: "text",
                  className: `form-control form-control-sm ${errors.ecommerceLinkOrNo ? 'is-invalid' : ''}`,
                  name: "ecommerceLinkOrNo",
                  value: formData.ecommerceLinkOrNo,
                  onChange: handleChange,
                  placeholder: "Website link or contact number"
                }),
                errors.ecommerceLinkOrNo && React.createElement("div", { className: "invalid-feedback" }, errors.ecommerceLinkOrNo)
              )
          )
        ),
        React.createElement("div", { className: "modal-footer py-2" },
          React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-outline-secondary",
            onClick: onClose,
            disabled: loading
          }, "Cancel"),
          React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-success",
            onClick: handleSubmit,
            disabled: loading
          },
            loading ? 
              React.createElement(React.Fragment, {},
                React.createElement("span", { className: "spinner-border spinner-border-sm me-1" }),
                " Saving..."
              ) :
              React.createElement(React.Fragment, {},
                React.createElement(PlusCircle, { size: 14, className: "me-1" }),
                " Add Record"
              )
          )
        )
      )
    )
  );
};

// NC DATA Import Preview Component - UPDATED to show warnings not errors
const NCImportPreview = ({ records, importBatchId, fileName, onConfirm, onCancel }) => {
  const [editableRecords, setEditableRecords] = useState(records || []);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const totalRecordsCount = (editableRecords || []).length;

  useEffect(() => {
    setEditableRecords(records || []);
    // Auto-select all valid records
    const allValidRows = (records || [])
      .filter(r => r && r.isValid)
      .map(r => r.rowNumber);
    setSelectedRows(allValidRows);
    setSelectAll(true);
  }, [records]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows((editableRecords || [])
        .filter(r => r && r.isValid)
        .map(r => r.rowNumber)
      );
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (rowNumber) => {
    if (selectedRows.includes(rowNumber)) {
      setSelectedRows(selectedRows.filter(r => r !== rowNumber));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, rowNumber]);
    }
  };

  const handleEdit = (rowNumber, field, value) => {
    setEditableRecords(prev => (prev || []).map(record => {
      if (record && record.rowNumber === rowNumber) {
        const updated = { ...record, [field]: value };
        
        // Simple validation for UI feedback only
        if (field === 'ecommerce') {
          const ecommValue = String(value || '').toUpperCase();
          if (ecommValue === 'Y' || ecommValue === 'YES') {
            if (!updated.ecommerceLinkOrNo) {
              updated.validationErrors = [...(updated.validationErrors || []), {
                field: 'ecommerceLinkOrNo',
                message: 'E-commerce link is recommended when e-commerce is Yes'
              }];
            } else {
              updated.validationErrors = (updated.validationErrors || []).filter(e => e.field !== 'ecommerceLinkOrNo');
            }
          }
        }
        
        return updated;
      }
      return record;
    }));
  };

  const handleConfirmImport = () => {
    const selectedRecords = (editableRecords || []).filter(r => selectedRows.includes(r.rowNumber));
    onConfirm(selectedRecords);
  };

  // Count warnings
  const totalWarnings = (editableRecords || []).reduce((sum, r) => 
    sum + (r.validationErrors?.length || 0), 0
  );

  return React.createElement("div", 
    { className: "modal fade show d-block", style: { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 } },
    React.createElement("div", { className: "modal-dialog modal-fullscreen" },
      React.createElement("div", { className: "modal-content" },
        React.createElement("div", { className: "modal-header py-2 bg-primary text-white" },
          React.createElement("h6", { className: "modal-title mb-0" },
            React.createElement(Upload, { className: "me-2", size: 16 }),
            " Import Preview - ", fileName || 'Data Import',
            React.createElement("span", { className: "badge bg-light text-dark ms-2" }, totalRecordsCount, " records")
          ),
          React.createElement("button", {
            type: "button",
            className: "btn-close btn-close-white m-0",
            onClick: onCancel
          })
        ),
        React.createElement("div", { className: "modal-body p-3" },
          // Import Summary - UPDATED to show all records are valid
          React.createElement("div", { className: "row g-2 mb-3" },
            React.createElement("div", { className: "col-md-4" },
              React.createElement("div", { className: "card bg-light" },
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("small", { className: "text-muted d-block" }, "Total Records"),
                  React.createElement("div", { className: "h4 mb-0" }, totalRecordsCount)
                )
              )
            ),
            React.createElement("div", { className: "col-md-4" },
              React.createElement("div", { className: "card bg-success bg-opacity-10" },
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("small", { className: "text-muted d-block" }, "Ready to Import"),
                  React.createElement("div", { className: "h4 mb-0 text-success" }, totalRecordsCount)
                )
              )
            ),
            React.createElement("div", { className: "col-md-4" },
              React.createElement("div", { className: "card bg-info bg-opacity-10" },
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("small", { className: "text-muted d-block" }, "Selected"),
                  React.createElement("div", { className: "h4 mb-0 text-info" }, selectedRows.length)
                )
              )
            )
          ),
          // Import Instructions - UPDATED to show warnings only
          React.createElement("div", { className: `alert ${totalWarnings > 0 ? 'alert-warning' : 'alert-info'} py-2 mb-3` },
            React.createElement("div", { className: "d-flex align-items-center" },
              React.createElement(ExclamationCircle, { className: "me-2", size: 16 }),
              React.createElement("small", null,
                React.createElement("strong", null, "Import Ready: "),
                totalWarnings > 0 ? 
                  `⚠️ ${totalWarnings} warnings found. Records can still be imported.` :
                  ' ✅ All records are ready to import.'
              )
            )
          ),
          // Data Table
          React.createElement("div", { className: "table-responsive", style: { maxHeight: 'calc(100vh - 300px)' } },
            React.createElement("table", { className: "table table-sm table-bordered table-hover" },
              React.createElement("thead", { className: "table-light sticky-top" },
                React.createElement("tr", {},
                  React.createElement("th", { className: "text-center", style: { width: '40px' } },
                    React.createElement("input", {
                      type: "checkbox",
                      className: "form-check-input",
                      checked: selectAll,
                      onChange: handleSelectAll
                    })
                  ),
                  React.createElement("th", { style: { width: '60px' } }, "Row"),
                  React.createElement("th", {}, "Timestamp"),
                  React.createElement("th", {}, "Month"),
                  React.createElement("th", {}, "Unit"),
                  React.createElement("th", {}, "Assisted By"),
                  React.createElement("th", {}, "Owner's Name"),
                  React.createElement("th", {}, "Gender"),
                  React.createElement("th", {}, "Business Name"),
                  React.createElement("th", {}, "City/Municipality"),
                  React.createElement("th", {}, "Priority Industry"),
                  React.createElement("th", {}, "EDT Level"),
                  React.createElement("th", {}, "Type of Assistance"),
                  React.createElement("th", {}, "Strategic Measure"),
                  React.createElement("th", {}, "Assistance Title"),
                  React.createElement("th", {}, "Assistance Date"),
                  React.createElement("th", {}, "E-commerce"),
                  React.createElement("th", {}, "E-commerce Link/No"),
                  React.createElement("th", { style: { width: '200px' } }, "Status")
                )
              ),
              React.createElement("tbody", {},
                (editableRecords || []).map((record, index) => {
                  if (!record) return null;
                  const warnings = record.validationErrors || [];
                  const hasWarnings = warnings.length > 0;
                  
                  return React.createElement("tr", {
                    key: record.rowNumber || index,
                    className: hasWarnings ? 'table-warning' : ''
                  },
                    React.createElement("td", { className: "text-center align-middle" },
                      React.createElement("input", {
                        type: "checkbox",
                        className: "form-check-input",
                        checked: selectedRows.includes(record.rowNumber),
                        onChange: () => handleSelectRow(record.rowNumber)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" }, record.rowNumber || index + 1),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "datetime-local",
                        className: "form-control form-control-sm",
                        value: formatDateForInput(record.timeStamp),
                        onChange: (e) => handleEdit(record.rowNumber, 'timeStamp', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("select", {
                        className: "form-select form-select-sm",
                        value: record.month || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'month', e.target.value)
                      },
                        React.createElement("option", { value: "" }, "Select"),
                        MONTHS.map(m => 
                          React.createElement("option", { key: m, value: m }, m)
                        )
                      )
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.unit || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'unit', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.assistedBy || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'assistedBy', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.ownerName || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'ownerName', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("select", {
                        className: "form-select form-select-sm",
                        value: record.gender || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'gender', e.target.value)
                      },
                        React.createElement("option", { value: "" }, "Select"),
                        GENDERS.map(g =>
                          React.createElement("option", { key: g, value: g }, g)
                        )
                      )
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.businessName || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'businessName', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.cityMunicipality || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'cityMunicipality', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.priorityIndustry || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'priorityIndustry', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("select", {
                        className: "form-select form-select-sm",
                        value: record.edtLevel || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'edtLevel', e.target.value)
                      },
                        React.createElement("option", { value: "" }, "Select"),
                        EDT_LEVELS.map(level =>
                          React.createElement("option", { key: level, value: level }, level)
                        )
                      )
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.typeOfAssistance || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'typeOfAssistance', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.strategicMeasure || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'strategicMeasure', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.assistanceTitle || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'assistanceTitle', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "date",
                        className: "form-control form-control-sm",
                        value: formatDateForInput(record.assistanceDate),
                        onChange: (e) => handleEdit(record.rowNumber, 'assistanceDate', e.target.value)
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("select", {
                        className: "form-select form-select-sm",
                        value: record.ecommerce || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'ecommerce', e.target.value)
                      },
                        React.createElement("option", { value: "" }, "Select"),
                        React.createElement("option", { value: "Y" }, "Yes"),
                        React.createElement("option", { value: "N" }, "No")
                      )
                    ),
                    React.createElement("td", { className: "align-middle" },
                      React.createElement("input", {
                        type: "text",
                        className: "form-control form-control-sm",
                        value: record.ecommerceLinkOrNo || '',
                        onChange: (e) => handleEdit(record.rowNumber, 'ecommerceLinkOrNo', e.target.value),
                        placeholder: record.ecommerce === 'Y' ? 'Recommended' : 'Optional'
                      })
                    ),
                    React.createElement("td", { className: "align-middle" },
                      hasWarnings ? warnings.map((err, idx) =>
                        React.createElement("div", { key: idx, className: "text-warning small" },
                          React.createElement(ExclamationCircle, { size: 12, className: "me-1" }),
                          err.message
                        )
                      ) :
                        React.createElement("span", { className: "badge bg-success" },
                          React.createElement(CheckCircle, { size: 12, className: "me-1" }),
                          "Ready"
                        )
                    )
                  );
                })
              )
            )
          )
        ),
        React.createElement("div", { className: "modal-footer py-2" },
          React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-outline-secondary",
            onClick: onCancel
          }, "Cancel"),
          React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-primary",
            onClick: handleConfirmImport,
            disabled: selectedRows.length === 0
          },
            React.createElement(Upload, { className: "me-1", size: 14 }),
            " Import ", selectedRows.length, " Selected Records"
          )
        )
      )
    )
  );
};

// NC Data View Modal - UPDATED to show raw data
const NCDataViewModal = ({ show, record, onClose }) => {
  if (!show || !record) return null;

  return React.createElement("div",
    { className: "modal fade show d-block", style: { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 } },
    React.createElement("div", { className: "modal-dialog modal-lg" },
      React.createElement("div", { className: "modal-content" },
        React.createElement("div", { className: "modal-header py-2 bg-info text-white" },
          React.createElement("h6", { className: "modal-title mb-0" },
            React.createElement(Eye, { className: "me-2", size: 16 }),
            "NC Data Record Details"
          ),
          React.createElement("button", {
            type: "button",
            className: "btn-close btn-close-white m-0",
            onClick: onClose
          })
        ),
        React.createElement("div", { className: "modal-body p-3" },
          React.createElement("div", { className: "row" },
            // Basic Info
            React.createElement("div", { className: "col-md-6 mb-3" },
              React.createElement("div", { className: "card h-100" },
                React.createElement("div", { className: "card-header py-1 bg-light" },
                  React.createElement("small", { className: "fw-bold" }, "Basic Information")
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("table", { className: "table table-sm table-borderless mb-0" },
                    React.createElement("tbody", {},
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted", style: { width: '40%' } }, "Timestamp:"),
                        React.createElement("td", { className: "fw-medium" }, record.timeStamp ? new Date(record.timeStamp).toLocaleString() : '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Month/Year:"),
                        React.createElement("td", { className: "fw-medium" }, record.month || '', " ", record.year || '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Unit:"),
                        React.createElement("td", { className: "fw-medium" }, record.unit || '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Assisted By:"),
                        React.createElement("td", { className: "fw-medium" }, record.assistedBy || '')
                      )
                    )
                  )
                )
              )
            ),
            // Personnel Info
            React.createElement("div", { className: "col-md-6 mb-3" },
              React.createElement("div", { className: "card h-100" },
                React.createElement("div", { className: "card-header py-1 bg-light" },
                  React.createElement("small", { className: "fw-bold" }, "Personnel Information")
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("table", { className: "table table-sm table-borderless mb-0" },
                    React.createElement("tbody", {},
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted", style: { width: '40%' } }, "Owner's Name:"),
                        React.createElement("td", { className: "fw-medium" }, record.ownerName || '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Gender:"),
                        React.createElement("td", { className: "fw-medium" },
                          record.gender === 'Others' ? (record.genderOther || 'Others') : (record.gender || '')
                        )
                      )
                    )
                  )
                )
              )
            ),
            // Business Info
            React.createElement("div", { className: "col-md-6 mb-3" },
              React.createElement("div", { className: "card h-100" },
                React.createElement("div", { className: "card-header py-1 bg-light" },
                  React.createElement("small", { className: "fw-bold" }, "Business Information")
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("table", { className: "table table-sm table-borderless mb-0" },
                    React.createElement("tbody", {},
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted", style: { width: '40%' } }, "Business Name:"),
                        React.createElement("td", { className: "fw-medium" }, record.businessName || '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "City/Municipality:"),
                        React.createElement("td", { className: "fw-medium" }, record.cityMunicipality || '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Priority Industry:"),
                        React.createElement("td", { className: "fw-medium" },
                          record.priorityIndustry === 'Others' ? (record.priorityIndustryOther || 'Others') : (record.priorityIndustry || '')
                        )
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "EDT Level:"),
                        React.createElement("td", { className: "fw-medium" }, record.edtLevel || '')
                      )
                    )
                  )
                )
              )
            ),
            // Assistance Info
            React.createElement("div", { className: "col-md-6 mb-3" },
              React.createElement("div", { className: "card h-100" },
                React.createElement("div", { className: "card-header py-1 bg-light" },
                  React.createElement("small", { className: "fw-bold" }, "Assistance Information")
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("table", { className: "table table-sm table-borderless mb-0" },
                    React.createElement("tbody", {},
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted", style: { width: '40%' } }, "Type of Assistance:"),
                        React.createElement("td", { className: "fw-medium" },
                          record.typeOfAssistance === 'Others' ? (record.typeOfAssistanceOther || 'Others') : (record.typeOfAssistance || '')
                        )
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Strategic Measure:"),
                        React.createElement("td", { className: "fw-medium" },
                          record.strategicMeasure === 'Others' ? (record.strategicMeasureOther || 'Others') : (record.strategicMeasure || '')
                        )
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Assistance Title:"),
                        React.createElement("td", { className: "fw-medium" }, record.assistanceTitle || '')
                      ),
                      React.createElement("tr", {},
                        React.createElement("td", { className: "text-muted" }, "Assistance Date:"),
                        React.createElement("td", { className: "fw-medium" }, record.assistanceDate ? new Date(record.assistanceDate).toLocaleDateString() : '')
                      )
                    )
                  )
                )
              )
            ),
            // E-commerce Info
            React.createElement("div", { className: "col-12 mb-3" },
              React.createElement("div", { className: "card" },
                React.createElement("div", { className: "card-header py-1 bg-light" },
                  React.createElement("small", { className: "fw-bold" }, "E-commerce Information")
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("div", { className: "row" },
                    React.createElement("div", { className: "col-md-6" },
                      React.createElement("table", { className: "table table-sm table-borderless mb-0" },
                        React.createElement("tbody", {},
                          React.createElement("tr", {},
                            React.createElement("td", { className: "text-muted", style: { width: '30%' } }, "Has E-commerce:"),
                            React.createElement("td", { className: "fw-medium" },
                              React.createElement("span", { className: `badge ${record.ecommerce === 'Y' ? 'bg-success' : 'bg-secondary'}` },
                                record.ecommerce === 'Y' ? 'Yes' : 'No'
                              )
                            )
                          )
                        )
                      )
                    ),
                    record.ecommerce === 'Y' && record.ecommerceLinkOrNo ?
                      React.createElement("div", { className: "col-md-6" },
                        React.createElement("table", { className: "table table-sm table-borderless mb-0" },
                          React.createElement("tbody", {},
                            React.createElement("tr", {},
                              React.createElement("td", { className: "text-muted", style: { width: '30%' } }, "Link/Number:"),
                              React.createElement("td", { className: "fw-medium" },
                                React.createElement("a", {
                                  href: record.ecommerceLinkOrNo,
                                  target: "_blank",
                                  rel: "noopener noreferrer"
                                }, record.ecommerceLinkOrNo)
                              )
                            )
                          )
                        )
                      ) : null
                  )
                )
              )
            ),
            // Raw Data - NEW section for non-standard values
            record.rawData && Object.keys(record.rawData).length > 0 &&
              React.createElement("div", { className: "col-12 mb-3" },
                React.createElement("div", { className: "card bg-light" },
                  React.createElement("div", { className: "card-header py-1 bg-warning bg-opacity-25" },
                    React.createElement("small", { className: "fw-bold" },
                      React.createElement(ExclamationCircle, { size: 14, className: "me-1" }),
                      "Original Imported Values"
                    )
                  ),
                  React.createElement("div", { className: "card-body p-2" },
                    React.createElement("div", { className: "row" },
                      Object.entries(record.rawData).map(([key, value]) =>
                        React.createElement("div", { key: key, className: "col-md-4 mb-1" },
                          React.createElement("small", { className: "text-muted d-block" }, key),
                          React.createElement("small", { className: "fw-medium" }, String(value))
                        )
                      )
                    )
                  )
                )
              ),
            // Import Metadata
            record.importBatchId ?
              React.createElement("div", { className: "col-12" },
                React.createElement("div", { className: "card bg-light" },
                  React.createElement("div", { className: "card-header py-1 bg-secondary bg-opacity-10" },
                    React.createElement("small", { className: "fw-bold" }, "Import Information")
                  ),
                  React.createElement("div", { className: "card-body p-2" },
                    React.createElement("div", { className: "row" },
                      React.createElement("div", { className: "col-md-4" },
                        React.createElement("small", { className: "text-muted d-block" }, "Batch ID:"),
                        React.createElement("small", { className: "fw-medium" }, record.importBatchId)
                      ),
                      React.createElement("div", { className: "col-md-4" },
                        React.createElement("small", { className: "text-muted d-block" }, "File Name:"),
                        React.createElement("small", { className: "fw-medium" }, record.importFileName || '')
                      ),
                      React.createElement("div", { className: "col-md-4" },
                        React.createElement("small", { className: "text-muted d-block" }, "Row Number:"),
                        React.createElement("small", { className: "fw-medium" }, record.rowNumber || '')
                      )
                    )
                  )
                )
              ) : null
          )
        ),
        React.createElement("div", { className: "modal-footer py-2" },
          React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-outline-secondary",
            onClick: onClose
          }, "Close"),
          React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-primary",
            onClick: () => {
              window.print();
            }
          },
            React.createElement(Printer, { size: 14, className: "me-1" }),
            " Print"
          )
        )
      )
    )
  );
};

// Main StaffNC Component - ONLY NC DATA (16 fields)
const StaffNC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // NC Data State
  const [ncData, setNcData] = useState([]);
  const [filteredNcData, setFilteredNcData] = useState([]);
  const [ncSearch, setNcSearch] = useState("");
  const [ncStats, setNcStats] = useState({
    totalRecords: 0,
    uniqueBusinesses: 0,
    uniqueCities: 0,
    ecommerceEnabled: 0,
    ecommerceRate: 0
  });
  
  // Import/Export State
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  
  // View State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Add Record State
  const [showAddModal, setShowAddModal] = useState(false);
  
  const fileInputRef = useRef();

  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).reverse();

  const ncSearchableFields = [
    'businessName', 'ownerName', 'assistedBy', 'unit', 
    'cityMunicipality', 'assistanceTitle', 'month'
  ];

  useEffect(() => {
    fetchNCData();
    fetchImportHistory();
  }, []);

  useEffect(() => {
    fetchNCData();
  }, [selectedYear]);

  useEffect(() => {
    if (!ncSearch.trim()) {
      setFilteredNcData(ncData || []);
    } else {
      const searchLower = ncSearch.toLowerCase();
      const filtered = (ncData || []).filter(item => {
        return ncSearchableFields.some(field => {
          const value = item[field];
          if (value === undefined || value === null) return false;
          return value.toString().toLowerCase().includes(searchLower);
        });
      });
      setFilteredNcData(filtered);
    }
  }, [ncSearch, ncData]);

  const fetchNCData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/nc/nc-data?year=${selectedYear}&limit=10000`);
      if (response.data && response.data.success) {
        const sortedData = (response.data.data || []).sort((a, b) => {
          return new Date(b.assistanceDate || 0) - new Date(a.assistanceDate || 0);
        });
        setNcData(sortedData);
        setFilteredNcData(sortedData);
        
        const stats = response.data.stats || {
          totalRecords: sortedData.length,
          uniqueBusinesses: new Set(sortedData.map(d => d.businessName).filter(Boolean)).size,
          uniqueCities: new Set(sortedData.map(d => d.cityMunicipality).filter(Boolean)).size,
          ecommerceEnabled: sortedData.filter(d => d.ecommerce === 'Y').length,
          ecommerceRate: sortedData.length > 0 
            ? (sortedData.filter(d => d.ecommerce === 'Y').length / sortedData.length * 100).toFixed(1)
            : 0
        };
        setNcStats(stats);
      }
    } catch (error) {
      console.error('Error fetching NC data:', error);
      showToast('Failed to fetch NC data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nc/nc-data/import/history?limit=10');
      if (response.data && response.data.success) {
        setImportHistory(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data || [];
          processImportData(data, file.name);
        },
        error: (error) => {
          showToast('Error parsing CSV file: ' + error.message, 'error');
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const headers = jsonData[0] || [];
          const rows = (jsonData.slice(1) || []).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              if (header) obj[header] = row[index];
            });
            return obj;
          }).filter(row => Object.keys(row).length > 0);
          
          processImportData(rows, file.name);
        } catch (error) {
          showToast('Error parsing Excel file: ' + error.message, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast('Please upload CSV or Excel file', 'error');
    }
    
    event.target.value = null;
  };

  const processImportData = async (data, fileName) => {
    if (!data || data.length === 0) {
      showToast('No data found in file', 'error');
      return;
    }

    setLoading(true);
    
    const importBatchId = `import_${Date.now()}`;
    
    try {
      const response = await axios.post('http://localhost:5000/api/nc/nc-data/import/preview', {
        records: data,
        importBatchId,
        fileName
      });

      if (response.data && response.data.success) {
        setImportData({
          ...(response.data.data || {}),
          fileName
        });
        setShowImportPreview(true);
      }
    } catch (error) {
      console.error('Error previewing import:', error);
      showToast(error.response?.data?.message || 'Failed to preview import data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async (selectedRecords) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/nc/nc-data/import/confirm', {
        records: selectedRecords || [],
        importBatchId: importData?.importBatchId
      });

      if (response.data && response.data.success) {
        showToast(`✅ Successfully imported ${response.data.data?.savedCount || 0} records`, 'success');
        setShowImportPreview(false);
        setImportData(null);
        fetchNCData();
        fetchImportHistory();
        
        if (response.data.data?.errorCount > 0) {
          showToast(`⚠️ ${response.data.data.errorCount} records failed to import`, 'error');
        }
      }
    } catch (error) {
      console.error('Error confirming import:', error);
      showToast(error.response?.data?.message || 'Failed to import data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format = 'json') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/nc/nc-data/export?year=${selectedYear}&format=${format}`);
      
      if (response.data && response.data.success) {
        if (format === 'csv') {
          const csv = Papa.unparse(response.data.data || []);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `nc_data_export_${selectedYear}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const jsonString = JSON.stringify(response.data.data || [], null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `nc_data_export_${selectedYear}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        showToast(`✅ Exported ${response.data.count || 0} records successfully!`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data', 'error');
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const clearSearch = () => setNcSearch("");

  // Chart Data
  const monthlyChartData = (ncData || []).reduce((acc, record) => {
    if (!record || !record.month) return acc;
    const month = record.month;
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count++;
      if (record.ecommerce === 'Y') existing.ecommerce++;
    } else {
      acc.push({
        month: month.substring(0, 3),
        fullMonth: month,
        count: 1,
        ecommerce: record.ecommerce === 'Y' ? 1 : 0
      });
    }
    return acc;
  }, []).sort((a, b) => (monthOrder[a.fullMonth] || 0) - (monthOrder[b.fullMonth] || 0));

  const industryChartData = (ncData || []).reduce((acc, record) => {
    if (!record) return acc;
    const industry = record.priorityIndustry === 'Others' ? (record.priorityIndustryOther || 'Others') : (record.priorityIndustry || 'Unknown');
    const existing = acc.find(item => item.industry === industry);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        industry: industry,
        count: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 5);

  return React.createElement("div", { className: "p-2 p-md-3 position-relative" },
    React.createElement(ToastContainer, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      newestOnTop: false,
      closeOnClick: true,
      rtl: false,
      pauseOnFocusLoss: true,
      draggable: true,
      pauseOnHover: true
    }),
    React.createElement("input", {
      type: "file",
      ref: fileInputRef,
      style: { display: 'none' },
      accept: ".csv,.xlsx,.xls",
      onChange: handleFileUpload
    }),
    React.createElement(NCDataViewModal, {
      show: showViewModal,
      record: selectedRecord,
      onClose: () => setShowViewModal(false)
    }),
    React.createElement(AddRecordModal, {
      show: showAddModal,
      onClose: () => setShowAddModal(false),
      onSave: fetchNCData,
      selectedYear: selectedYear
    }),
    showImportPreview && importData &&
      React.createElement(NCImportPreview, {
        records: importData.records || [],
        importBatchId: importData.importBatchId,
        fileName: importData.fileName,
        onConfirm: handleConfirmImport,
        onCancel: () => {
          setShowImportPreview(false);
          setImportData(null);
        }
      }),
    // Header
    React.createElement("div", { className: "d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2" },
      React.createElement("div", { className: "text-center text-md-start" },
        React.createElement("h5", { className: "fw-bold mb-0" }, "Negosyo Centers - NC Data Management"),
        React.createElement("small", { className: "text-muted" }, "16 Fields · Flexible Import/Export")
      ),
      React.createElement("div", { className: "d-flex flex-wrap gap-2 align-items-center justify-content-center justify-content-md-end w-100 w-md-auto" },
        React.createElement("div", { className: "btn-group btn-group-sm" },
          React.createElement("button", {
            className: `btn ${activeTab === 'records' ? 'btn-primary' : 'btn-outline-primary'}`,
            onClick: () => setActiveTab('records')
          }, "Records"),
          React.createElement("button", {
            className: `btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline-primary'}`,
            onClick: () => setActiveTab('analytics')
          }, "Analytics"),
          React.createElement("button", {
            className: `btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`,
            onClick: () => setActiveTab('history')
          }, "Import History")
        ),
        React.createElement("select", {
          className: "form-select form-select-sm w-auto",
          value: selectedYear,
          onChange: (e) => setSelectedYear(parseInt(e.target.value))
        },
          years.map(year =>
            React.createElement("option", { key: year, value: year }, year)
          )
        )
      )
    ),
    // Stats Cards
    React.createElement("div", { className: "row g-2 mb-3" },
      React.createElement("div", { className: "col-6 col-md-3" },
        React.createElement("div", { className: "card border-primary h-100" },
          React.createElement("div", { className: "card-body p-2 p-md-3" },
            React.createElement("div", { className: "d-flex justify-content-between align-items-start" },
              React.createElement("div", {},
                React.createElement("h6", { className: "card-title text-primary mb-1", style: { fontSize: '0.85rem' } }, "Total Assistance"),
                React.createElement("h3", { className: "fw-bold mb-0", style: { fontSize: '1.5rem' } }, (ncStats.totalRecords || 0).toLocaleString()),
                React.createElement("small", { className: "text-muted" }, "Records")
              ),
              React.createElement("div", { className: "text-primary" },
                React.createElement("i", { className: "bx bx-group", style: { fontSize: '1.25rem' } })
              )
            )
          )
        )
      ),
      React.createElement("div", { className: "col-6 col-md-3" },
        React.createElement("div", { className: "card border-success h-100" },
          React.createElement("div", { className: "card-body p-2 p-md-3" },
            React.createElement("div", { className: "d-flex justify-content-between align-items-start" },
              React.createElement("div", {},
                React.createElement("h6", { className: "card-title text-success mb-1", style: { fontSize: '0.85rem' } }, "Unique Businesses"),
                React.createElement("h3", { className: "fw-bold mb-0", style: { fontSize: '1.5rem' } }, (ncStats.uniqueBusinesses || 0).toLocaleString()),
                React.createElement("small", { className: "text-muted" }, "Served")
              ),
              React.createElement("div", { className: "text-success" },
                React.createElement("i", { className: "bx bx-store", style: { fontSize: '1.25rem' } })
              )
            )
          )
        )
      ),
      React.createElement("div", { className: "col-6 col-md-3" },
        React.createElement("div", { className: "card border-info h-100" },
          React.createElement("div", { className: "card-body p-2 p-md-3" },
            React.createElement("div", { className: "d-flex justify-content-between align-items-start" },
              React.createElement("div", {},
                React.createElement("h6", { className: "card-title text-info mb-1", style: { fontSize: '0.85rem' } }, "E-commerce Enabled"),
                React.createElement("h3", { className: "fw-bold mb-0", style: { fontSize: '1.5rem' } }, (ncStats.ecommerceEnabled || 0).toLocaleString()),
                React.createElement("small", { className: "text-muted" }, "Businesses")
              ),
              React.createElement("div", { className: "text-info" },
                React.createElement("i", { className: "bx bx-cart", style: { fontSize: '1.25rem' } })
              )
            ),
            React.createElement("div", { className: "mt-2" },
              React.createElement("div", { className: "progress", style: { height: '4px' } },
                React.createElement("div", {
                  className: "progress-bar bg-info",
                  style: { width: `${Math.min(100, parseFloat(ncStats.ecommerceRate || 0))}%` }
                })
              ),
              React.createElement("small", { className: "text-muted" }, (ncStats.ecommerceRate || 0), "% adoption rate")
            )
          )
        )
      ),
      React.createElement("div", { className: "col-6 col-md-3" },
        React.createElement("div", { className: "card border-warning h-100" },
          React.createElement("div", { className: "card-body p-2 p-md-3" },
            React.createElement("div", { className: "d-flex justify-content-between align-items-start" },
              React.createElement("div", {},
                React.createElement("h6", { className: "card-title text-warning mb-1", style: { fontSize: '0.85rem' } }, "Cities Served"),
                React.createElement("h3", { className: "fw-bold mb-0", style: { fontSize: '1.5rem' } }, (ncStats.uniqueCities || 0).toLocaleString()),
                React.createElement("small", { className: "text-muted" }, "Municipalities")
              ),
              React.createElement("div", { className: "text-warning" },
                React.createElement("i", { className: "bx bx-map", style: { fontSize: '1.25rem' } })
              )
            )
          )
        )
      )
    ),
    loading ?
      React.createElement("div", { className: "text-center p-5" },
        React.createElement("div", { className: "spinner-border spinner-border-sm text-primary", role: "status" },
          React.createElement("span", { className: "visually-hidden" }, "Loading...")
        ),
        React.createElement("p", { className: "mt-2 text-muted" }, "Loading NC data for ", selectedYear, "...")
      ) :
      React.createElement(React.Fragment, {},
        // Analytics Tab
        activeTab === 'analytics' &&
          React.createElement("div", { className: "row g-3" },
            React.createElement("div", { className: "col-md-6" },
              React.createElement("div", { className: "card shadow-sm h-100" },
                React.createElement("div", { className: "card-header py-2 bg-light" },
                  React.createElement("h6", { className: "mb-0" }, "Monthly Assistance - ", selectedYear)
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("div", { style: { height: '300px' } },
                    React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                      React.createElement(ComposedChart, { data: monthlyChartData || [], margin: { top: 20, right: 30, left: 0, bottom: 10 } },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
                        React.createElement(XAxis, { dataKey: "month", fontSize: 12 }),
                        React.createElement(YAxis, { yAxisId: "left", fontSize: 12 }),
                        React.createElement(YAxis, { yAxisId: "right", orientation: "right", fontSize: 12 }),
                        React.createElement(Tooltip, { contentStyle: { fontSize: '12px' } }),
                        React.createElement(Legend, { wrapperStyle: { fontSize: '12px' } }),
                        React.createElement(Bar, { yAxisId: "left", dataKey: "count", fill: "#8884d8", name: "Total Assistance", radius: [2, 2, 0, 0] }),
                        React.createElement(Bar, { yAxisId: "left", dataKey: "ecommerce", fill: "#82ca9d", name: "E-commerce Enabled", radius: [2, 2, 0, 0] }),
                        React.createElement(Line, {
                          yAxisId: "right",
                          type: "monotone",
                          dataKey: "ecommerce",
                          stroke: "#ff7300",
                          name: "E-commerce Trend",
                          strokeWidth: 2
                        })
                      )
                    )
                  )
                )
              )
            ),
            React.createElement("div", { className: "col-md-6" },
              React.createElement("div", { className: "card shadow-sm h-100" },
                React.createElement("div", { className: "card-header py-2 bg-light" },
                  React.createElement("h6", { className: "mb-0" }, "Top Priority Industries - ", selectedYear)
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("div", { style: { height: '300px' } },
                    React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                      React.createElement(BarChart, { data: industryChartData || [], margin: { top: 20, right: 30, left: 0, bottom: 10 } },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
                        React.createElement(XAxis, { dataKey: "industry", fontSize: 12, interval: 0, angle: -45, textAnchor: "end", height: 80 }),
                        React.createElement(YAxis, { fontSize: 12 }),
                        React.createElement(Tooltip, { contentStyle: { fontSize: '12px' } }),
                        React.createElement(Bar, { dataKey: "count", fill: "#8884d8", name: "Number of Assistance", radius: [2, 2, 0, 0] })
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "card-footer py-1 bg-light" },
                  React.createElement("small", { className: "text-muted" },
                    "Total Industries: ", new Set((ncData || []).map(d => d.priorityIndustry).filter(Boolean)).size
                  )
                )
              )
            ),
            React.createElement("div", { className: "col-12" },
              React.createElement("div", { className: "card shadow-sm" },
                React.createElement("div", { className: "card-header py-2 bg-light" },
                  React.createElement("h6", { className: "mb-0" }, "Year ", selectedYear, " Summary")
                ),
                React.createElement("div", { className: "card-body p-2" },
                  React.createElement("div", { className: "row g-2" },
                    React.createElement("div", { className: "col-md-3" },
                      React.createElement("div", { className: "p-2 bg-light rounded" },
                        React.createElement("small", { className: "text-muted d-block" }, "Total Records"),
                        React.createElement("div", { className: "h5 mb-0" }, ncStats.totalRecords || 0)
                      )
                    ),
                    React.createElement("div", { className: "col-md-3" },
                      React.createElement("div", { className: "p-2 bg-light rounded" },
                        React.createElement("small", { className: "text-muted d-block" }, "Businesses Served"),
                        React.createElement("div", { className: "h5 mb-0" }, ncStats.uniqueBusinesses || 0)
                      )
                    ),
                    React.createElement("div", { className: "col-md-3" },
                      React.createElement("div", { className: "p-2 bg-light rounded" },
                        React.createElement("small", { className: "text-muted d-block" }, "E-commerce Rate"),
                        React.createElement("div", { className: "h5 mb-0" }, ncStats.ecommerceRate || 0, "%")
                      )
                    ),
                    React.createElement("div", { className: "col-md-3" },
                      React.createElement("div", { className: "p-2 bg-light rounded" },
                        React.createElement("small", { className: "text-muted d-block" }, "Cities"),
                        React.createElement("div", { className: "h5 mb-0" }, ncStats.uniqueCities || 0)
                      )
                    )
                  )
                )
              )
            )
          ),
        // Import History Tab
        activeTab === 'history' &&
          React.createElement("div", { className: "card shadow-sm" },
            React.createElement("div", { className: "card-header py-2 bg-light" },
              React.createElement("h6", { className: "mb-0" }, "Recent Import History")
            ),
            React.createElement("div", { className: "card-body p-0" },
              (importHistory || []).length === 0 ?
                React.createElement("div", { className: "text-center p-4 p-md-5" },
                  React.createElement(Upload, { size: 48, className: "text-muted mb-3" }),
                  React.createElement("p", { className: "text-muted" }, "No import history found")
                ) :
                React.createElement("div", { className: "table-responsive" },
                  React.createElement("table", { className: "table table-sm table-hover mb-0" },
                    React.createElement("thead", { className: "table-light" },
                      React.createElement("tr", {},
                        React.createElement("th", { className: "py-2 px-3" }, "Batch ID"),
                        React.createElement("th", { className: "py-2 px-3" }, "File Name"),
                        React.createElement("th", { className: "py-2 px-3 text-center" }, "Records"),
                        React.createElement("th", { className: "py-2 px-3" }, "Imported By"),
                        React.createElement("th", { className: "py-2 px-3" }, "Date Imported")
                      )
                    ),
                    React.createElement("tbody", {},
                      (importHistory || []).map((item, index) =>
                        React.createElement("tr", { key: index },
                          React.createElement("td", { className: "py-2 px-3" },
                            React.createElement("small", { className: "text-muted" }, item._id || '')
                          ),
                          React.createElement("td", { className: "py-2 px-3" },
                            React.createElement(FileEarmarkSpreadsheet, { className: "me-2 text-success", size: 14 }),
                            item.importFileName || 'Unknown'
                          ),
                          React.createElement("td", { className: "py-2 px-3 text-center" },
                            React.createElement("span", { className: "badge bg-primary" }, item.recordCount || 0)
                          ),
                          React.createElement("td", { className: "py-2 px-3" }, item.createdBy || 'system'),
                          React.createElement("td", { className: "py-2 px-3" },
                            item.firstImport ? new Date(item.firstImport).toLocaleString() : ''
                          )
                        )
                      )
                    )
                  )
                )
            )
          ),
        // NC Data Records Tab
        activeTab === 'records' &&
          React.createElement("div", { className: "card shadow-sm" },
            React.createElement("div", { className: "card-header py-2 bg-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-2" },
              React.createElement("h6", { className: "mb-0 text-center text-md-start" }, "NC Data Records - ", selectedYear),
              React.createElement("div", { className: "d-flex gap-2 align-items-center flex-wrap" },
                React.createElement("div", { className: "position-relative", style: { minWidth: '250px' } },
                  React.createElement("div", { className: "input-group input-group-sm" },
                    React.createElement("span", { className: "input-group-text bg-white border-end-0" },
                      React.createElement(Search, { size: 14 })
                    ),
                    React.createElement("input", {
                      type: "text",
                      className: "form-control border-start-0",
                      placeholder: "Search business, owner, title...",
                      value: ncSearch,
                      onChange: (e) => setNcSearch(e.target.value)
                    }),
                    ncSearch ?
                      React.createElement("button", {
                        className: "btn btn-outline-secondary border-start-0",
                        type: "button",
                        onClick: clearSearch
                      },
                        React.createElement(X, { size: 14 })
                      ) : null
                  )
                ),
                React.createElement("div", { className: "btn-group btn-group-sm" },
                  React.createElement("button", {
                    className: "btn btn-success",
                    onClick: () => handleExportData('csv'),
                    title: "Export as CSV"
                  },
                    React.createElement(Download, { size: 14, className: "me-1" }),
                    " CSV"
                  ),
                  React.createElement("button", {
                    className: "btn btn-info",
                    onClick: () => handleExportData('json'),
                    title: "Export as JSON"
                  },
                    React.createElement(FileEarmark, { size: 14, className: "me-1" }),
                    " JSON"
                  )
                ),
                React.createElement("button", {
                  className: "btn btn-sm btn-primary",
                  onClick: () => fileInputRef.current.click()
                },
                  React.createElement(Upload, { size: 14, className: "me-1" }),
                  " Import"
                ),
                React.createElement("button", {
                  className: "btn btn-sm btn-success",
                  onClick: () => setShowAddModal(true)
                },
                  React.createElement(PlusCircle, { size: 14, className: "me-1" }),
                  " Add Record"
                )
              )
            ),
            React.createElement("div", { className: "card-body p-0" },
              (filteredNcData || []).length === 0 ?
                React.createElement("div", { className: "text-center p-4 p-md-5" },
                  React.createElement("i", { className: "bx bx-data display-6 text-muted mb-3" }),
                  React.createElement("p", { className: "text-muted" },
                    (ncData || []).length === 0 
                      ? `No NC data records found for ${selectedYear}`
                      : 'No records match your search'
                  ),
                  React.createElement("div", { className: "d-flex gap-2 justify-content-center" },
                    React.createElement("button", {
                      className: "btn btn-sm btn-primary",
                      onClick: () => fileInputRef.current.click()
                    },
                      React.createElement(Upload, { size: 14, className: "me-1" }),
                      " Import Data"
                    ),
                    React.createElement("button", {
                      className: "btn btn-sm btn-success",
                      onClick: () => setShowAddModal(true)
                    },
                      React.createElement(PlusCircle, { size: 14, className: "me-1" }),
                      " Add Record"
                    )
                  )
                ) :
                React.createElement(React.Fragment, {},
                  React.createElement("div", { className: "table-responsive", style: { maxHeight: '600px', overflowY: 'auto' } },
                    React.createElement("table", { className: "table table-sm table-hover mb-0" },
                      React.createElement("thead", { className: "table-light position-sticky top-0", style: { zIndex: 1 } },
                        React.createElement("tr", {},
                          React.createElement("th", { className: "py-2 px-2" }, "Date"),
                          React.createElement("th", { className: "py-2 px-2" }, "Business"),
                          React.createElement("th", { className: "py-2 px-2" }, "Owner"),
                          React.createElement("th", { className: "py-2 px-2" }, "City"),
                          React.createElement("th", { className: "py-2 px-2" }, "Industry"),
                          React.createElement("th", { className: "py-2 px-2" }, "Assistance"),
                          React.createElement("th", { className: "py-2 px-2 text-center" }, "EDT Level"),
                          React.createElement("th", { className: "py-2 px-2 text-center" }, "E-comm"),
                          React.createElement("th", { className: "py-2 px-2 text-center" }, "Actions")
                        )
                      ),
                      React.createElement("tbody", {},
                        (filteredNcData || []).map((record) =>
                          record && record._id ?
                          React.createElement("tr", { key: record._id },
                            React.createElement("td", { className: "py-2 px-2 align-middle" },
                              React.createElement("div", {},
                                React.createElement("small", { className: "fw-medium" }, record.month || ''),
                                React.createElement("br", null),
                                React.createElement("small", { className: "text-muted" }, record.year || '')
                              )
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle" },
                              React.createElement("div", {},
                                React.createElement("span", { className: "fw-medium" }, record.businessName || ''),
                                React.createElement("br", null),
                                React.createElement("small", { className: "text-muted" }, record.unit || '')
                              )
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle" },
                              React.createElement("div", {},
                                React.createElement("small", null, record.ownerName || ''),
                                React.createElement("br", null),
                                React.createElement("small", { className: "text-muted" }, "By: ", record.assistedBy || '')
                              )
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle" },
                              React.createElement("small", null, record.cityMunicipality || '')
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle" },
                              React.createElement("small", { className: "text-truncate d-block", style: { maxWidth: '150px' } },
                                record.priorityIndustry === 'Others' 
                                  ? (record.priorityIndustryOther || 'Others') 
                                  : (record.priorityIndustry || '')
                              )
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle" },
                              React.createElement("div", {},
                                React.createElement("small", { className: "fw-medium" }, record.assistanceTitle || ''),
                                React.createElement("br", null),
                                React.createElement("small", { className: "text-muted" },
                                  record.typeOfAssistance === 'Others' 
                                    ? (record.typeOfAssistanceOther || 'Others') 
                                    : (record.typeOfAssistance || '')
                                )
                              )
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle text-center" },
                              React.createElement("span", { className: "badge bg-info bg-opacity-10 text-dark" },
                                record.edtLevel || ''
                              )
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle text-center" },
                              React.createElement("span", { className: `badge ${record.ecommerce === 'Y' ? 'bg-success' : 'bg-secondary'}` },
                                record.ecommerce === 'Y' ? 'Yes' : 'No'
                              ),
                              record.ecommerce === 'Y' && record.ecommerceLinkOrNo ?
                                React.createElement("div", { className: "mt-1" },
                                  React.createElement("small", { className: "text-muted" },
                                    React.createElement("a", {
                                      href: record.ecommerceLinkOrNo,
                                      target: "_blank",
                                      rel: "noopener noreferrer"
                                    }, "Link")
                                  )
                                ) : null
                            ),
                            React.createElement("td", { className: "py-2 px-2 align-middle text-center" },
                              React.createElement("div", { className: "d-flex justify-content-center gap-1" },
                                React.createElement("button", {
                                  className: "btn btn-sm btn-outline-info",
                                  onClick: () => handleViewRecord(record),
                                  title: "View Details"
                                },
                                  React.createElement(Eye, { size: 14 })
                                ),
                                React.createElement("button", {
                                  className: "btn btn-sm btn-outline-success",
                                  onClick: () => {
                                    setSelectedRecord(record);
                                    setTimeout(() => {
                                      window.print();
                                      setSelectedRecord(null);
                                    }, 100);
                                  },
                                  title: "Print"
                                },
                                  React.createElement(Printer, { size: 14 })
                                )
                              )
                            )
                          ) : null
                        )
                      )
                    )
                  ),
                  React.createElement("div", { className: "border-top px-3 py-2 d-flex justify-content-between align-items-center" },
                    React.createElement("small", { className: "text-muted" },
                      "Showing ", (filteredNcData || []).length, " of ", (ncData || []).length, " records",
                      ncSearch ? ` matching "${ncSearch}"` : ''
                    ),
                    React.createElement("small", { className: "text-muted" },
                      React.createElement("span", { className: "badge bg-primary me-2" }, ncStats.totalRecords || 0),
                      " Total Records"
                    )
                  )
                )
            )
          )
      )
  );
};

export default StaffNC;