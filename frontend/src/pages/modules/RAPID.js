// src/pages/modules/RAPID.js
import React from "react";

const RAPID = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">RAPID Program</h2>
          <p className="text-muted mb-0">Rural Agro-Industrial Partnership for Inclusive Development and Growth</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Partnership
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
              <h5 className="card-title">RAPID Program Dashboard</h5>
              <p className="text-muted">Monitor rural agro-industrial partnerships and development initiatives.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-handshake me-2"></i>
                        Active Partnerships
                      </h6>
                      <h3 className="fw-bold">156</h3>
                      <p className="text-muted small">Rural agro-industrial</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-trending-up me-2"></i>
                        Growth Rate
                      </h6>
                      <h3 className="fw-bold">24.7%</h3>
                      <p className="text-muted small">Year-over-year</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-group me-2"></i>
                        Farmers Engaged
                      </h6>
                      <h3 className="fw-bold">5,842</h3>
                      <p className="text-muted small">Across partnerships</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Partnerships</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Partnership ID</th>
                        <th>Agro-Industry</th>
                        <th>Location</th>
                        <th>Farmers</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>RAPID-2024-0345</td>
                        <td>Coconut Processing</td>
                        <td>Quezon Province</td>
                        <td>245</td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td>RAPID-2024-0346</td>
                        <td>Rice Value Chain</td>
                        <td>Nueva Ecija</td>
                        <td>187</td>
                        <td><span className="badge bg-info">New</span></td>
                      </tr>
                      <tr>
                        <td>RAPID-2024-0347</td>
                        <td>Banana Production</td>
                        <td>Davao Region</td>
                        <td>312</td>
                        <td><span className="badge bg-warning">Assessment</span></td>
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
                <button className="btn btn-outline-primary">New Partnership</button>
                <button className="btn btn-outline-success">Farmer Registration</button>
                <button className="btn btn-outline-warning">Project Assessment</button>
                <button className="btn btn-outline-info">Capacity Building</button>
                <button className="btn btn-outline-secondary">Progress Reports</button>
                <button className="btn btn-outline-dark">Market Linkage</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Program Statistics</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Communities Served</span>
                    <span className="fw-bold">89</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Training Conducted</span>
                    <span className="fw-bold">134</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Value Added</span>
                    <span className="fw-bold">₱28.5M</span>
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

export default RAPID;