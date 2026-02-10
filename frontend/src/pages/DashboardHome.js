// src/pages/DashboardHome.js
import React, { useState } from "react";
import { 
  Card, Row, Col, ProgressBar, Badge, Table, Button, 
  Form, Dropdown, ButtonGroup, Nav, Tab, Tabs, Container
} from "react-bootstrap";
import { 
  FiTrendingUp, FiDollarSign, FiCheckCircle, FiAlertCircle,
  FiUsers, FiPackage, FiShoppingCart, FiShield,
  FiDownload, FiFilter, FiCalendar, FiBarChart2,
  FiEye, FiMoreVertical, FiFileText,
  FiPercent, FiTarget, FiActivity, FiTrendingDown,
  FiCreditCard, FiArrowUpRight, FiArrowDownRight, FiBox
} from "react-icons/fi";
import { 
  BsThreeDotsVertical, BsArrowUpRight, BsArrowDownRight,
  BsGraphUp, BsCashStack, BsShieldCheck
} from "react-icons/bs";

const DashboardHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');

  // DTI Program Data with enhanced metrics
  const dtiPrograms = [
    { 
      code: 'NC', 
      name: 'Negosyo Centers', 
      budget: 50000000, 
      disbursed: 42000000, 
      liquidated: 38000000,
      physicalTarget: 150,
      physicalActual: 142,
      riskLevel: 'low',
      trend: 'up',
      change: '+12%',
      color: '#6366f1',
      icon: <FiUsers className="fs-5" />,
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
    },
    { 
      code: 'SSF', 
      name: 'Shared Service Facilities', 
      budget: 75000000, 
      disbursed: 68000000, 
      liquidated: 62000000,
      physicalTarget: 85,
      physicalActual: 79,
      riskLevel: 'medium',
      trend: 'up',
      change: '+8%',
      color: '#10b981',
      icon: <FiPackage className="fs-5" />,
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    },
    { 
      code: 'RAPID', 
      name: 'Rural Agro-enterprise', 
      budget: 45000000, 
      disbursed: 42000000, 
      liquidated: 38000000,
      physicalTarget: 200,
      physicalActual: 185,
      riskLevel: 'low',
      trend: 'up',
      change: '+15%',
      color: '#8b5cf6',
      icon: <FiShoppingCart className="fs-5" />,
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
    },
    { 
      code: 'OTOP', 
      name: 'One Town, One Product', 
      budget: 60000000, 
      disbursed: 52000000, 
      liquidated: 48000000,
      physicalTarget: 120,
      physicalActual: 110,
      riskLevel: 'medium',
      trend: 'stable',
      change: '+5%',
      color: '#f59e0b',
      icon: <FiTarget className="fs-5" />,
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    },
    { 
      code: 'CPIDP', 
      name: 'Consumer Protection', 
      budget: 30000000, 
      disbursed: 28000000, 
      liquidated: 22000000,
      physicalTarget: 5000,
      physicalActual: 4200,
      riskLevel: 'high',
      trend: 'down',
      change: '-3%',
      color: '#ef4444',
      icon: <FiShield className="fs-5" />,
      bgGradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
    },
    { 
      code: 'DTDP', 
      name: 'Digital Trade Development', 
      budget: 55000000, 
      disbursed: 48000000, 
      liquidated: 42000000,
      physicalTarget: 75,
      physicalActual: 68,
      riskLevel: 'medium',
      trend: 'up',
      change: '+9%',
      color: '#06b6d4',
      icon: <FiActivity className="fs-5" />,
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)'
    },
  ];

  // Calculate metrics
  const totalBudget = dtiPrograms.reduce((sum, prog) => sum + prog.budget, 0);
  const totalDisbursed = dtiPrograms.reduce((sum, prog) => sum + prog.disbursed, 0);
  const totalLiquidated = dtiPrograms.reduce((sum, prog) => sum + prog.liquidated, 0);
  const totalUtilization = Math.round((totalDisbursed / totalBudget) * 100);
  const totalLiquidationRate = Math.round((totalLiquidated / totalDisbursed) * 100);
  
  const physicalTargetTotal = dtiPrograms.reduce((sum, prog) => sum + prog.physicalTarget, 0);
  const physicalActualTotal = dtiPrograms.reduce((sum, prog) => sum + prog.physicalActual, 0);
  const physicalAchievement = Math.round((physicalActualTotal / physicalTargetTotal) * 100);

  // Compact Summary KPIs - Modern Glass Cards
  const summaryMetrics = [
    { 
      title: "Total Budget", 
      value: `₱${(totalBudget / 1000000).toFixed(1)}M`, 
      subtitle: "Annual Allocation",
      color: "#6366f1",
      icon: <BsCashStack className="fs-4" />,
      trend: null,
      progress: null,
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
    },
    { 
      title: "Funds Disbursed", 
      value: `${totalUtilization}%`, 
      subtitle: `₱${(totalDisbursed / 1000000).toFixed(1)}M`,
      color: "#10b981",
      icon: <FiTrendingUp className="fs-4" />,
      trend: "+5.2%",
      progress: totalUtilization,
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
    },
    { 
      title: "Liquidation Rate", 
      value: `${totalLiquidationRate}%`, 
      subtitle: `₱${(totalLiquidated / 1000000).toFixed(1)}M`,
      color: totalLiquidationRate >= 85 ? "#10b981" : totalLiquidationRate >= 70 ? "#f59e0b" : "#ef4444",
      icon: <BsShieldCheck className="fs-4" />,
      trend: "+2.8%",
      progress: totalLiquidationRate,
      bgGradient: totalLiquidationRate >= 85 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
        : totalLiquidationRate >= 70
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
    },
    { 
      title: "Physical Achievement", 
      value: `${physicalAchievement}%`, 
      subtitle: `${physicalActualTotal} of ${physicalTargetTotal} targets`,
      color: physicalAchievement >= 90 ? "#10b981" : physicalAchievement >= 75 ? "#f59e0b" : "#ef4444",
      icon: <FiTarget className="fs-4" />,
      trend: "+3.5%",
      progress: physicalAchievement,
      bgGradient: physicalAchievement >= 90 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
        : physicalAchievement >= 75
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
    },
  ];

  // Risk programs
  const highRiskPrograms = dtiPrograms.filter(prog => prog.riskLevel === 'high');
  const mediumRiskPrograms = dtiPrograms.filter(prog => prog.riskLevel === 'medium');

  // Recent activities
  const recentActivities = [
    { id: 1, program: "NC", action: "Disbursement Approved", amount: "₱2.5M", time: "2h ago", status: "completed", icon: <FiDollarSign /> },
    { id: 2, program: "SSF", action: "Liquidation Submitted", amount: "₱1.8M", time: "5h ago", status: "pending", icon: <FiCheckCircle /> },
    { id: 3, program: "OTOP", action: "Budget Allocation", amount: "₱3.2M", time: "1d ago", status: "completed", icon: <FiTrendingUp /> },
    { id: 4, program: "CPIDP", action: "Audit Flag", amount: "₱850K", time: "2d ago", status: "alert", icon: <FiAlertCircle /> },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount / 1000000).toFixed(1)}M`;
  };

  const formatExactCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH')}`;
  };

  // Get progress bar variant
  const getProgressVariant = (value) => {
    if (value >= 85) return "success";
    if (value >= 70) return "warning";
    return "danger";
  };

  // Get risk badge
  const getRiskBadge = (riskLevel) => {
    switch(riskLevel) {
      case 'low': return <Badge bg="success" className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>Low</Badge>;
      case 'medium': return <Badge bg="warning" className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>Medium</Badge>;
      case 'high': return <Badge bg="danger" className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>High</Badge>;
      default: return <Badge bg="secondary" className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>Unknown</Badge>;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <FiArrowUpRight className="text-success" />;
      case 'down': return <FiArrowDownRight className="text-danger" />;
      default: return <span className="text-muted">→</span>;
    }
  };

  return (
    <Container fluid className="dashboard-home px-3 py-2">
      {/* Header Section - Compact */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0">DTI Integrity Dashboard</h4>
          <p className="text-muted mb-0 small">
            Financial transparency & program performance
          </p>
        </div>
        <div className="d-flex gap-2">
          <ButtonGroup size="sm">
            <Button 
              variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <FiBarChart2 className="me-1" /> Grid
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <FiFileText className="me-1" /> List
            </Button>
          </ButtonGroup>
          
          <Button variant="outline-secondary" size="sm" className="px-3">
            <FiDownload className="me-1" /> Export
          </Button>
        </div>
      </div>

      {/* Compact Summary Metrics - Glass Cards */}
      <Row className="g-2 mb-3">
        {summaryMetrics.map((metric, index) => (
          <Col key={index} xl={3} lg={6} md={6} sm={6}>
            <Card className="border-0 shadow-sm h-100" style={{ 
              background: metric.bgGradient,
              backdropFilter: 'blur(10px)'
            }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <div className="me-2" style={{ color: metric.color }}>
                        {metric.icon}
                      </div>
                      <h6 className="text-uppercase text-muted mb-0 small fw-semibold">{metric.title}</h6>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: metric.color }}>{metric.value}</h3>
                    <p className="text-muted small mb-2">{metric.subtitle}</p>
                    {metric.trend && (
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${metric.trend.startsWith('+') ? 'success' : 'danger'}-subtle text-${metric.trend.startsWith('+') ? 'success' : 'danger'} small fw-normal px-2 py-1`}>
                          {getTrendIcon(metric.trend.startsWith('+') ? 'up' : 'down')} {metric.trend}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {metric.progress !== null && (
                  <div className="mt-2">
                    <ProgressBar 
                      now={metric.progress} 
                      variant={getProgressVariant(metric.progress)}
                      className="rounded-pill"
                      style={{ height: '4px' }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">0%</small>
                      <small className="text-muted">100%</small>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Area */}
      <Row className="g-3">
        {/* Programs Grid - Left Column */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">Program Performance</h5>
                <div className="d-flex gap-2">
                  <Form.Select size="sm" className="border-0 bg-light" style={{ width: '130px' }}>
                    <option>All Programs</option>
                    {dtiPrograms.map(p => (
                      <option key={p.code}>{p.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Select size="sm" className="border-0 bg-light" style={{ width: '100px' }}>
                    <option>2024</option>
                    <option>2023</option>
                    <option>2022</option>
                  </Form.Select>
                </div>
              </div>
              
              {/* Compact Programs Grid */}
              <Row className="g-2">
                {dtiPrograms.map(prog => {
                  const utilizationRate = Math.round((prog.disbursed / prog.budget) * 100);
                  const liquidationRate = Math.round((prog.liquidated / prog.disbursed) * 100);
                  
                  return (
                    <Col key={prog.code} md={6} lg={4}>
                      <Card className="border-0 shadow-sm h-100" style={{ 
                        borderLeft: `4px solid ${prog.color}`,
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle p-2 me-2" style={{ 
                                background: prog.bgGradient,
                                color: prog.color
                              }}>
                                {prog.icon}
                              </div>
                              <div>
                                <h6 className="fw-bold mb-0">{prog.code}</h6>
                                <small className="text-muted">{prog.name}</small>
                              </div>
                            </div>
                            {getRiskBadge(prog.riskLevel)}
                          </div>
                          
                          <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Budget</small>
                              <span className="fw-semibold">{formatCurrency(prog.budget)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Disbursed</small>
                              <span>{formatCurrency(prog.disbursed)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Liquidated</small>
                              <span>{formatCurrency(prog.liquidated)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="d-flex justify-content-between mb-1">
                              <small>Utilization</small>
                              <small className="fw-semibold">{utilizationRate}%</small>
                            </div>
                            <ProgressBar 
                              now={utilizationRate} 
                              variant={getProgressVariant(utilizationRate)}
                              className="rounded-pill mb-2"
                              style={{ height: '4px' }}
                            />
                            
                            <div className="d-flex justify-content-between mb-1">
                              <small>Liquidation</small>
                              <small className="fw-semibold">{liquidationRate}%</small>
                            </div>
                            <ProgressBar 
                              now={liquidationRate} 
                              variant={getProgressVariant(liquidationRate)}
                              className="rounded-pill"
                              style={{ height: '4px' }}
                            />
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                            <div className="d-flex align-items-center">
                              {getTrendIcon(prog.trend)}
                              <small className="ms-1 text-muted">{prog.change}</small>
                            </div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-decoration-none p-0"
                            >
                              <FiEye size={14} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Risk & Activity */}
        <Col lg={4}>
          {/* Risk Assessment Card */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">Risk Assessment</h5>
                <Badge bg="light" text="dark" className="rounded-pill px-2">
                  {highRiskPrograms.length + mediumRiskPrograms.length} flagged
                </Badge>
              </div>
              
              {/* High Risk Section */}
              {highRiskPrograms.length > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-danger fw-semibold">High Risk</small>
                    <Badge bg="danger" pill>{highRiskPrograms.length}</Badge>
                  </div>
                  {highRiskPrograms.map(prog => (
                    <div key={prog.code} className="d-flex align-items-center justify-content-between p-2 mb-1 rounded bg-danger-light">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle p-1 me-2 bg-danger bg-opacity-10">
                          <FiAlertCircle size={12} className="text-danger" />
                        </div>
                        <span className="small">{prog.name}</span>
                      </div>
                      <small className="text-danger">Review</small>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Medium Risk Section */}
              {mediumRiskPrograms.length > 0 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-warning fw-semibold">Medium Risk</small>
                    <Badge bg="warning" pill>{mediumRiskPrograms.length}</Badge>
                  </div>
                  {mediumRiskPrograms.map(prog => (
                    <div key={prog.code} className="d-flex align-items-center justify-content-between p-2 mb-1 rounded bg-warning-light">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle p-1 me-2 bg-warning bg-opacity-10">
                          <FiAlertCircle size={12} className="text-warning" />
                        </div>
                        <span className="small">{prog.name}</span>
                      </div>
                      <small className="text-warning">Monitor</small>
                    </div>
                  ))}
                </div>
              )}
              
              <Button variant="outline-danger" size="sm" className="w-100 mt-3 border-0 bg-danger-light">
                <FiAlertCircle className="me-1" /> View Risk Report
              </Button>
            </Card.Body>
          </Card>

          {/* Recent Activities Card */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">Recent Activity</h5>
                <Button variant="link" size="sm" className="text-decoration-none p-0">
                  View all
                </Button>
              </div>
              
              <div className="timeline-compact">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="d-flex mb-2">
                    <div className="flex-shrink-0 me-3">
                      <div className={`rounded-circle p-2 ${activity.status === 'completed' ? 'bg-success-light' : activity.status === 'alert' ? 'bg-danger-light' : 'bg-warning-light'}`}>
                        <div className={`${activity.status === 'completed' ? 'text-success' : activity.status === 'alert' ? 'text-danger' : 'text-warning'}`}>
                          {activity.icon}
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-0 fw-semibold small">{activity.program}</h6>
                          <p className="mb-0 small text-muted">{activity.action}</p>
                        </div>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="fw-semibold small">{activity.amount}</span>
                        <Badge bg={activity.status === 'completed' ? 'success' : activity.status === 'alert' ? 'danger' : 'warning'} pill className="px-2 py-1" style={{ fontSize: '0.65rem' }}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Footer */}
      <Row className="g-2 mt-3">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-primary-light">
            <Card.Body className="p-2">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-1 bg-primary bg-opacity-10 me-2">
                  <FiUsers size={14} className="text-primary" />
                </div>
                <div>
                  <div className="fw-bold small">{physicalActualTotal.toLocaleString()}</div>
                  <small className="text-muted">Beneficiaries</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-success-light">
            <Card.Body className="p-2">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-1 bg-success bg-opacity-10 me-2">
                  <FiCheckCircle size={14} className="text-success" />
                </div>
                <div>
                  <div className="fw-bold small">{totalLiquidationRate}%</div>
                  <small className="text-muted">Avg. Liquidation</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-info-light">
            <Card.Body className="p-2">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-1 bg-info bg-opacity-10 me-2">
                  <FiPercent size={14} className="text-info" />
                </div>
                <div>
                  <div className="fw-bold small">{totalUtilization}%</div>
                  <small className="text-muted">Utilization Rate</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-warning-light">
            <Card.Body className="p-2">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-1 bg-warning bg-opacity-10 me-2">
                  <FiTarget size={14} className="text-warning" />
                </div>
                <div>
                  <div className="fw-bold small">{physicalAchievement}%</div>
                  <small className="text-muted">Target Achieved</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CSS for custom classes */}
      <style>{`
        .dashboard-home {
          background: #f8fafc;
          min-height: 100vh;
        }
        .card {
          border-radius: 12px !important;
          transition: all 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
        }
        .bg-primary-light {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%);
        }
        .bg-success-light {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%);
        }
        .bg-warning-light {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%);
        }
        .bg-danger-light {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
        }
        .bg-info-light {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%);
        }
        .timeline-compact::before {
          display: none;
        }
        .progress {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .border-0 {
          border: none !important;
        }
        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        .rounded-pill {
          border-radius: 50rem !important;
        }
        .fs-5 {
          font-size: 1.125rem !important;
        }
        .fs-4 {
          font-size: 1.25rem !important;
        }
      `}</style>
    </Container>
  );
};

export default DashboardHome;