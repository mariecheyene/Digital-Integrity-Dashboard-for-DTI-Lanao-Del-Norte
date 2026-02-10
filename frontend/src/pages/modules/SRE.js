// src/pages/modules/SRE.js
import React from "react";

const SRE = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">Service & Repair Enterprise</h2>
          <p className="text-muted mb-0">Service Industry Regulation & Accreditation</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Registration
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
              <h5 className="card-title">Service Enterprise Dashboard</h5>
              <p className="text-muted">Monitor registered service and repair businesses.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-building me-2"></i>
                        Registered Enterprises
                      </h6>
                      <h3 className="fw-bold">2,845</h3>
                      <p className="text-muted small">Service businesses</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-badge-check me-2"></i>
                        Accredited Shops
                      </h6>
                      <h3 className="fw-bold">1,567</h3>
                      <p className="text-muted small">DTI accredited</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-file me-2"></i>
                        Pending Applications
                      </h6>
                      <h3 className="fw-bold">89</h3>
                      <p className="text-muted small">For accreditation</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Service Enterprise Registrations</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Business ID</th>
                        <th>Business Name</th>
                        <th>Service Type</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>SRE-2024-0890</td>
                        <td>QuickFix Appliance Repair</td>
                        <td>Appliance Repair</td>
                        <td>Quezon City</td>
                        <td><span className="badge bg-success">Accredited</span></td>
                      </tr>
                      <tr>
                        <td>SRE-2024-0891</td>
                        <td>AutoCare Mechanics</td>
                        <td>Automotive Repair</td>
                        <td>Makati City</td>
                        <td><span className="badge bg-info">Under Review</span></td>
                      </tr>
                      <tr>
                        <td>SRE-2024-0892</td>
                        <td>HomeTech Services</td>
                        <td>Electronics Repair</td>
                        <td>Pasig City</td>
                        <td><span className="badge bg-warning">Needs Documents</span></td>
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
                <button className="btn btn-outline-primary">Register Business</button>
                <button className="btn btn-outline-success">Accreditation</button>
                <button className="btn btn-outline-warning">Compliance Check</button>
                <button className="btn btn-outline-info">Training Programs</button>
                <button className="btn btn-outline-secondary">Consumer Complaints</button>
                <button className="btn btn-outline-dark">Industry Standards</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Service Categories</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Appliance Repair</span>
                    <span className="fw-bold">856</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Automotive Services</span>
                    <span className="fw-bold">742</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Electronics Repair</span>
                    <span className="fw-bold">389</span>
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

export default SRE;