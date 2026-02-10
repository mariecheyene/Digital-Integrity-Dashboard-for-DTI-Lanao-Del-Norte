// src/pages/modules/SSF.js
import React from "react";

const SSF = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">SSF Module - Shared Service Facilities</h2>
          <p className="text-muted mb-0">Equipment Sharing and Manufacturing Support Program</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Facility
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bx bx-download me-1"></i> Export Report
          </button>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">SSF Equipment Utilization Dashboard</h5>
              <p className="text-muted">Monitor equipment usage and maintenance budget.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-cog me-2"></i>
                        Active Facilities
                      </h6>
                      <h3 className="fw-bold">127</h3>
                      <p className="text-muted small">Nationwide</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-line-chart me-2"></i>
                        Utilization Rate
                      </h6>
                      <h3 className="fw-bold">82.3%</h3>
                      <p className="text-muted small">Monthly average</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-wrench me-2"></i>
                        Maintenance Fund
                      </h6>
                      <h3 className="fw-bold">₱4.2M</h3>
                      <p className="text-muted small">Annual allocation</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Equipment Usage Summary</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Equipment Type</th>
                        <th>Location</th>
                        <th>Utilization</th>
                        <th>Maintenance Status</th>
                        <th>Users Served</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>CNC Machine</td>
                        <td>Cebu City</td>
                        <td>95%</td>
                        <td><span className="badge bg-success">Optimal</span></td>
                        <td>24 MSMEs</td>
                      </tr>
                      <tr>
                        <td>Food Processor</td>
                        <td>Davao City</td>
                        <td>78%</td>
                        <td><span className="badge bg-warning">Needs Check</span></td>
                        <td>18 MSMEs</td>
                      </tr>
                      <tr>
                        <td>3D Printer</td>
                        <td>Makati City</td>
                        <td>65%</td>
                        <td><span className="badge bg-success">Optimal</span></td>
                        <td>15 MSMEs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">Register Equipment</button>
                <button className="btn btn-outline-success">Schedule Maintenance</button>
                <button className="btn btn-outline-warning">Usage Report</button>
                <button className="btn btn-outline-info">Budget Allocation</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSF;