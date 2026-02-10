// src/pages/modules/MEDIATION.js
import React from "react";

const MEDIATION = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">Consumer Mediation</h2>
          <p className="text-muted mb-0">Dispute Resolution & Alternative Dispute Settlement</p>
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
              <h5 className="card-title">Mediation Dashboard</h5>
              <p className="text-muted">Monitor consumer-business mediation cases and settlements.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-file me-2"></i>
                        Active Cases
                      </h6>
                      <h3 className="fw-bold">287</h3>
                      <p className="text-muted small">Under mediation</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-check-circle me-2"></i>
                        Success Rate
                      </h6>
                      <h3 className="fw-bold">92.5%</h3>
                      <p className="text-muted small">Cases resolved</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-time me-2"></i>
                        Avg. Processing
                      </h6>
                      <h3 className="fw-bold">5.8 days</h3>
                      <p className="text-muted small">Case resolution</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Mediation Cases</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Complainant</th>
                        <th>Business</th>
                        <th>Issue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>MED-2024-1023</td>
                        <td>Juan Dela Cruz</td>
                        <td>ABC Electronics</td>
                        <td>Defective Product</td>
                        <td><span className="badge bg-success">Settled</span></td>
                      </tr>
                      <tr>
                        <td>MED-2024-1024</td>
                        <td>Maria Santos</td>
                        <td>XYZ Appliance</td>
                        <td>Poor Service</td>
                        <td><span className="badge bg-info">Mediation</span></td>
                      </tr>
                      <tr>
                        <td>MED-2024-1025</td>
                        <td>Pedro Reyes</td>
                        <td>Quick Auto Repair</td>
                        <td>Overcharging</td>
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
                <button className="btn btn-outline-success">Schedule Hearing</button>
                <button className="btn btn-outline-warning">Case Management</button>
                <button className="btn btn-outline-info">Settlement Agreement</button>
                <button className="btn btn-outline-secondary">Mediator Assignment</button>
                <button className="btn btn-outline-dark">Compliance Monitoring</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Case Statistics</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Product Quality</span>
                    <span className="fw-bold">142</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Service Issues</span>
                    <span className="fw-bold">89</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Warranty Claims</span>
                    <span className="fw-bold">56</span>
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

export default MEDIATION;