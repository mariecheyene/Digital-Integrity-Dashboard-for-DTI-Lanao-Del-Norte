// src/pages/modules/CFIDP.js
import React from "react";

const CFIDP = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">CFIDP Module - Coconut Farmers</h2>
          <p className="text-muted mb-0">Coconut Farmers & Industry Development Program</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Farmer Registration
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
              <h5 className="card-title">Coconut Industry Dashboard</h5>
              <p className="text-muted">Monitor coconut farmers, production, and industry programs.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-user me-2"></i>
                        Registered Farmers
                      </h6>
                      <h3 className="fw-bold">15,842</h3>
                      <p className="text-muted small">Active coconut farmers</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-package me-2"></i>
                        Average Yield
                      </h6>
                      <h3 className="fw-bold">3.2 MT/ha</h3>
                      <p className="text-muted small">This harvest season</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-trending-up me-2"></i>
                        Productivity Increase
                      </h6>
                      <h3 className="fw-bold">18.5%</h3>
                      <p className="text-muted small">Year-over-year</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Farmer Registrations</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Farmer ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Farm Size</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>CF-2024-0789</td>
                        <td>Juan Dela Cruz</td>
                        <td>Quezon Province</td>
                        <td>5.2 hectares</td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td>CF-2024-0790</td>
                        <td>Maria Santos</td>
                        <td>Laguna</td>
                        <td>3.8 hectares</td>
                        <td><span className="badge bg-info">Processing</span></td>
                      </tr>
                      <tr>
                        <td>CF-2024-0791</td>
                        <td>Pedro Reyes</td>
                        <td>Bicol Region</td>
                        <td>7.5 hectares</td>
                        <td><span className="badge bg-warning">Needs Assessment</span></td>
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
                <button className="btn btn-outline-primary">Register New Farmer</button>
                <button className="btn btn-outline-success">Input Distribution</button>
                <button className="btn btn-outline-warning">Farm Assessment</button>
                <button className="btn btn-outline-info">Training Programs</button>
                <button className="btn btn-outline-secondary">Harvest Reports</button>
                <button className="btn btn-outline-dark">Subsidy Management</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Program Stats</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Seedlings Distributed</span>
                    <span className="fw-bold">45,230</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Training Conducted</span>
                    <span className="fw-bold">127</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Farmers Assisted</span>
                    <span className="fw-bold">8,956</span>
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

export default CFIDP;