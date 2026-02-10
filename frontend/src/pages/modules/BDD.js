// src/pages/modules/BDD.js
import React from "react";

const BDD = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-2">BDD Module</h2>
          <p className="text-muted mb-0">Behavior-Driven Development & Test Automation</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bx bx-plus me-1"></i> New Feature
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bx bx-download me-1"></i> Export Tests
          </button>
          <button className="btn btn-success">
            <i className="bx bx-play me-1"></i> Run Tests
          </button>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">BDD Test Management</h5>
              <p className="text-muted">Manage your behavior-driven development features, scenarios, and test results.</p>
              
              <div className="alert alert-info mb-3">
                <i className="bx bx-info-circle me-2"></i>
                This module helps you write human-readable specifications that become automated tests.
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bx bx-file me-2"></i>
                        Feature Files
                      </h6>
                      <h3 className="fw-bold">24</h3>
                      <p className="text-muted small">Active Gherkin features</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <i className="bx bx-check-circle me-2"></i>
                        Passing Tests
                      </h6>
                      <h3 className="fw-bold">187</h3>
                      <p className="text-muted small">Of 210 total scenarios</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Recent Test Runs</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Pass Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>User Authentication</td>
                        <td>Today, 10:30 AM</td>
                        <td><span className="badge bg-success">Passed</span></td>
                        <td>100%</td>
                      </tr>
                      <tr>
                        <td>Payment Processing</td>
                        <td>Today, 09:15 AM</td>
                        <td><span className="badge bg-warning">Warning</span></td>
                        <td>92%</td>
                      </tr>
                      <tr>
                        <td>Search Functionality</td>
                        <td>Yesterday, 03:45 PM</td>
                        <td><span className="badge bg-success">Passed</span></td>
                        <td>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bx bx-edit me-2"></i>
                  Write New Feature
                </button>
                <button className="btn btn-outline-success">
                  <i className="bx bx-play-circle me-2"></i>
                  Run All Tests
                </button>
                <button className="btn btn-outline-warning">
                  <i className="bx bx-line-chart me-2"></i>
                  View Reports
                </button>
                <button className="btn btn-outline-info">
                  <i className="bx bx-code-alt me-2"></i>
                  Generate Step Definitions
                </button>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">BDD Guidelines</h5>
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0 py-2">
                  <i className="bx bx-check text-success me-2"></i>
                  <small>Use Given-When-Then format</small>
                </div>
                <div className="list-group-item border-0 px-0 py-2">
                  <i className="bx bx-check text-success me-2"></i>
                  <small>Write scenarios in business language</small>
                </div>
                <div className="list-group-item border-0 px-0 py-2">
                  <i className="bx bx-check text-success me-2"></i>
                  <small>Keep scenarios focused and independent</small>
                </div>
                <div className="list-group-item border-0 px-0 py-2">
                  <i className="bx bx-check text-success me-2"></i>
                  <small>Tag scenarios for better organization</small>
                </div>
                <div className="list-group-item border-0 px-0 py-2">
                  <i className="bx bx-check text-success me-2"></i>
                  <small>Regularly review and refactor features</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Sample Gherkin Syntax</h5>
              <pre className="bg-light p-3 rounded">
                <code>
{`Feature: User login
  As a registered user
  I want to login to the system
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid username and password
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter valid username and invalid password
    And I click the login button
    Then I should see an error message
    And I should remain on the login page`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BDD;