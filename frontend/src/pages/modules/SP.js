// src/pages/modules/SP.js
import React from "react";

const SP = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">Sales Promo</h2>
          <p className="text-muted mb-0">Sales Promotion Monitoring & Regulation</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Promotion
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
              <h5 className="card-title">Sales Promotion Dashboard</h5>
              <p className="text-muted">Monitor registered sales promotions and consumer protection compliance.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-badge-check me-2"></i>
                        Registered Promos
                      </h6>
                      <h3 className="fw-bold">342</h3>
                      <p className="text-muted small">Active promotions</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-check-shield me-2"></i>
                        Compliance Rate
                      </h6>
                      <h3 className="fw-bold">94.2%</h3>
                      <p className="text-muted small">Regulation compliance</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-time me-2"></i>
                        Processing Time
                      </h6>
                      <h3 className="fw-bold">3.5 days</h3>
                      <p className="text-muted small">Average approval</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Sales Promotions</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Promo ID</th>
                        <th>Business</th>
                        <th>Promo Type</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>SP-2024-0789</td>
                        <td>ABC Supermarket</td>
                        <td>Price Discount</td>
                        <td>30 days</td>
                        <td><span className="badge bg-success">Approved</span></td>
                      </tr>
                      <tr>
                        <td>SP-2024-0790</td>
                        <td>XYZ Electronics</td>
                        <td>Buy 1 Get 1</td>
                        <td>15 days</td>
                        <td><span className="badge bg-info">Under Review</span></td>
                      </tr>
                      <tr>
                        <td>SP-2024-0791</td>
                        <td>Quick Mart</td>
                        <td>Raffle Promo</td>
                        <td>60 days</td>
                        <td><span className="badge bg-warning">Needs Clarification</span></td>
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
                <button className="btn btn-outline-primary">Register Promotion</button>
                <button className="btn btn-outline-success">Compliance Check</button>
                <button className="btn btn-outline-warning">Violation Reports</button>
                <button className="btn btn-outline-info">Consumer Complaints</button>
                <button className="btn btn-outline-secondary">Promotion Analytics</button>
                <button className="btn btn-outline-dark">Business Advisory</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Promotion Statistics</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Retail Promotions</span>
                    <span className="fw-bold">215</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Service Promotions</span>
                    <span className="fw-bold">89</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Manufacturing Promos</span>
                    <span className="fw-bold">38</span>
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

export default SP;