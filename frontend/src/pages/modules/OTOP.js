// src/pages/modules/OTOP.js
import React from "react";

const OTOP = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">OTOP Program</h2>
          <p className="text-muted mb-0">One Town, One Product - Local Product Development</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Product
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
              <h5 className="card-title">OTOP Dashboard</h5>
              <p className="text-muted">Monitor local products and town development initiatives.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-package me-2"></i>
                        Total Products
                      </h6>
                      <h3 className="fw-bold">1,245</h3>
                      <p className="text-muted small">Registered OTOP products</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-store me-2"></i>
                        Participating Towns
                      </h6>
                      <h3 className="fw-bold">428</h3>
                      <p className="text-muted small">Towns with OTOP</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-trending-up me-2"></i>
                        Sales Growth
                      </h6>
                      <h3 className="fw-bold">32.5%</h3>
                      <p className="text-muted small">Year-over-year</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent OTOP Products</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Product Name</th>
                        <th>Town/City</th>
                        <th>Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>OTOP-2024-0567</td>
                        <td>Bicol Pili Nuts</td>
                        <td>Legazpi City</td>
                        <td>Food Products</td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td>OTOP-2024-0568</td>
                        <td>Ilocos Abel Fabric</td>
                        <td>Vigan City</td>
                        <td>Handicrafts</td>
                        <td><span className="badge bg-info">New</span></td>
                      </tr>
                      <tr>
                        <td>OTOP-2024-0569</td>
                        <td>Davao Durian Candy</td>
                        <td>Davao City</td>
                        <td>Processed Food</td>
                        <td><span className="badge bg-warning">Needs Update</span></td>
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
                <button className="btn btn-outline-primary">Register Product</button>
                <button className="btn btn-outline-success">Market Linkage</button>
                <button className="btn btn-outline-warning">Product Assessment</button>
                <button className="btn btn-outline-info">Capacity Building</button>
                <button className="btn btn-outline-secondary">Sales Reports</button>
                <button className="btn btn-outline-dark">Export Assistance</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Program Highlights</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>MSMEs Assisted</span>
                    <span className="fw-bold">2,548</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Training Conducted</span>
                    <span className="fw-bold">187</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Export Ready</span>
                    <span className="fw-bold">342</span>
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

export default OTOP;