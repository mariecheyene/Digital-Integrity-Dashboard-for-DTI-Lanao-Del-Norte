// src/pages/modules/CA.js
import React from "react";

const CA = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">Consumer Advocacy</h2>
          <p className="text-muted mb-0">Consumer Rights Protection & Education</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Campaign
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
              <h5 className="card-title">Consumer Advocacy Dashboard</h5>
              <p className="text-muted">Monitor consumer education programs and advocacy campaigns.</p>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-megaphone me-2"></i>
                        Active Campaigns
                      </h6>
                      <h3 className="fw-bold">23</h3>
                      <p className="text-muted small">Advocacy campaigns</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-group me-2"></i>
                        People Reached
                      </h6>
                      <h3 className="fw-bold">45,820</h3>
                      <p className="text-muted small">Consumers educated</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="bx bx-calendar-event me-2"></i>
                        Events This Month
                      </h6>
                      <h3 className="fw-bold">8</h3>
                      <p className="text-muted small">Advocacy events</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Advocacy Activities</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Location</th>
                        <th>Target Audience</th>
                        <th>Participants</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Consumer Rights Seminar</td>
                        <td>Manila City Hall</td>
                        <td>Senior Citizens</td>
                        <td>250</td>
                        <td><span className="badge bg-success">Completed</span></td>
                      </tr>
                      <tr>
                        <td>Online Shopping Safety</td>
                        <td>Online Webinar</td>
                        <td>Youth & Students</td>
                        <td>1,250</td>
                        <td><span className="badge bg-info">Ongoing</span></td>
                      </tr>
                      <tr>
                        <td>Product Safety Fair</td>
                        <td>Quezon City</td>
                        <td>General Public</td>
                        <td>850</td>
                        <td><span className="badge bg-warning">Upcoming</span></td>
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
                <button className="btn btn-outline-primary">Launch Campaign</button>
                <button className="btn btn-outline-success">Educational Materials</button>
                <button className="btn btn-outline-warning">Community Outreach</button>
                <button className="btn btn-outline-info">Media Partnership</button>
                <button className="btn btn-outline-secondary">Impact Assessment</button>
                <button className="btn btn-outline-dark">Hotline Management</button>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-3">Campaign Reach</h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Social Media Reach</span>
                    <span className="fw-bold">125K</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Community Seminars</span>
                    <span className="fw-bold">45</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>School Programs</span>
                    <span className="fw-bold">28</span>
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

export default CA;