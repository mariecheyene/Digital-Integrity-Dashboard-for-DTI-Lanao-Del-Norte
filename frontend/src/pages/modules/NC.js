// src/pages/modules/NC.js
import React from "react";

const NC = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">NC Module - Negosyo Centers</h2>
          <p className="text-muted mb-0">Micro, Small and Medium Enterprise (MSME) Development Support</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New MSME Registration
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
              <h5 className="card-title">Negosyo Center Performance Dashboard</h5>
              <p className="text-muted">Track MSME assistance programs and budget utilization.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-group me-2"></i>
                        MSMEs Assisted
                      </h6>
                      <h3 className="fw-bold">2,847</h3>
                      <p className="text-muted small">This Fiscal Year</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-money me-2"></i>
                        Budget Utilization
                      </h6>
                      <h3 className="fw-bold">78.5%</h3>
                      <p className="text-muted small">₱18.7M of ₱23.8M</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-check-circle me-2"></i>
                        Business Registered
                      </h6>
                      <h3 className="fw-bold">1,243</h3>
                      <p className="text-muted small">DTI-assisted registrations</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent MSME Assistance</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>MSME Name</th>
                        <th>Location</th>
                        <th>Assistance Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Juan's Handicrafts</td>
                        <td>Quezon City</td>
                        <td>Business Registration</td>
                        <td><span className="badge bg-success">Completed</span></td>
                        <td>Feb 15, 2024</td>
                      </tr>
                      <tr>
                        <td>Maria's Bake Shop</td>
                        <td>Makati City</td>
                        <td>Financial Literacy</td>
                        <td><span className="badge bg-info">Ongoing</span></td>
                        <td>Feb 10, 2024</td>
                      </tr>
                      <tr>
                        <td>Farm Fresh Produce</td>
                        <td>Bulacan</td>
                        <td>Market Linkage</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                        <td>Feb 5, 2024</td>
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
                <button className="btn btn-outline-primary">Register MSME</button>
                <button className="btn btn-outline-success">View Financial Reports</button>
                <button className="btn btn-outline-warning">Budget Allocation</button>
                <button className="btn btn-outline-info">Generate Certificate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NC;