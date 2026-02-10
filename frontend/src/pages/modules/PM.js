// src/pages/modules/PM.js
import React from "react";

const PM = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">Price Monitoring</h2>
          <p className="text-muted mb-0">Price Watch & Market Surveillance</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Survey
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
              <h5 className="card-title">Price Monitoring Dashboard</h5>
              <p className="text-muted">Monitor essential commodity prices and market trends.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-store me-2"></i>
                        Markets Monitored
                      </h6>
                      <h3 className="fw-bold">128</h3>
                      <p className="text-muted small">Public markets</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-line-chart me-2"></i>
                        Price Stability
                      </h6>
                      <h3 className="fw-bold">94.3%</h3>
                      <p className="text-muted small">Within SRP</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-alarm me-2"></i>
                        Violations Found
                      </h6>
                      <h3 className="fw-bold">23</h3>
                      <p className="text-muted small">This month</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Price Surveys</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Survey ID</th>
                        <th>Market</th>
                        <th>Commodity</th>
                        <th>Average Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>PM-2024-0678</td>
                        <td>Divisoria Market</td>
                        <td>Rice (Regular)</td>
                        <td>₱48/kg</td>
                        <td><span className="badge bg-success">Within SRP</span></td>
                      </tr>
                      <tr>
                        <td>PM-2024-0679</td>
                        <td>Balintawak Market</td>
                        <td>Cooking Oil</td>
                        <td>₱125/L</td>
                        <td><span className="badge bg-warning">Above SRP</span></td>
                      </tr>
                      <tr>
                        <td>PM-2024-0680</td>
                        <td>Pasig City Market</td>
                        <td>Chicken</td>
                        <td>₱160/kg</td>
                        <td><span className="badge bg-success">Within SRP</span></td>
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
                <button className="btn btn-outline-primary">Conduct Survey</button>
                <button className="btn btn-outline-success">Update SRP List</button>
                <button className="btn btn-outline-warning">Violation Report</button>
                <button className="btn btn-outline-info">Market Analysis</button>
                <button className="btn btn-outline-secondary">Price Bulletin</button>
                <button className="btn btn-outline-dark">Consumer Advisory</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Commodity Coverage</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Basic Food Items</span>
                    <span className="fw-bold">18</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Household Goods</span>
                    <span className="fw-bold">12</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Construction Materials</span>
                    <span className="fw-bold">8</span>
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

export default PM;