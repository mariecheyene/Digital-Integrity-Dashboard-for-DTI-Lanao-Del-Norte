// src/pages/modules/FTL.js
import React from "react";

const FTL = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">Fair Trade Law</h2>
          <p className="text-muted mb-0">Fair Trade Practices & Regulation Compliance</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Case
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
              <h5 className="card-title">Fair Trade Law Dashboard</h5>
              <p className="text-muted">Monitor fair trade violations, investigations, and compliance.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-gavel me-2"></i>
                        Active Cases
                      </h6>
                      <h3 className="fw-bold">124</h3>
                      <p className="text-muted small">Under investigation</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-check-circle me-2"></i>
                        Resolution Rate
                      </h6>
                      <h3 className="fw-bold">88.7%</h3>
                      <p className="text-muted small">Cases resolved</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-bullseye me-2"></i>
                        Preventive Actions
                      </h6>
                      <h3 className="fw-bold">56</h3>
                      <p className="text-muted small">This quarter</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Fair Trade Cases</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Business</th>
                        <th>Violation Type</th>
                        <th>Date Filed</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>FTL-2024-0456</td>
                        <td>ABC Retail Chain</td>
                        <td>Price Manipulation</td>
                        <td>2024-01-15</td>
                        <td><span className="badge bg-success">Resolved</span></td>
                      </tr>
                      <tr>
                        <td>FTL-2024-0457</td>
                        <td>XYZ Pharmaceuticals</td>
                        <td>Unfair Competition</td>
                        <td>2024-01-18</td>
                        <td><span className="badge bg-info">Investigation</span></td>
                      </tr>
                      <tr>
                        <td>FTL-2024-0458</td>
                        <td>Quick Food Corp</td>
                        <td>Misleading Ads</td>
                        <td>2024-01-20</td>
                        <td><span className="badge bg-warning">Hearing</span></td>
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
                <button className="btn btn-outline-primary">File Complaint</button>
                <button className="btn btn-outline-success">Business Inspection</button>
                <button className="btn btn-outline-warning">Case Management</button>
                <button className="btn btn-outline-info">Compliance Education</button>
                <button className="btn btn-outline-secondary">Legal Advisory</button>
                <button className="btn btn-outline-dark">Market Monitoring</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Violation Statistics</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Price Violations</span>
                    <span className="fw-bold">67</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Advertising Violations</span>
                    <span className="fw-bold">42</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Competition Violations</span>
                    <span className="fw-bold">15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FTL;