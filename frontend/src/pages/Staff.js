import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "../css/Style.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Collapse } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import DashboardHome and modules
import DashboardHome from "./DashboardHome";
import BDD from "./modules/BDD";
import StaffNC from "./staff modules/staffNC";
import SSF from "./modules/SSF";
import CFIDP from "./modules/CFIDP";
import OTOP from "./modules/OTOP";
import RAPID from "./modules/RAPID";
import CPD from "./modules/CPD";
import SP from "./modules/SP";
import FTL from "./modules/FTL";
import CA from "./modules/CA";

const Staff = () => {
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  
  // State for dropdown menus
  const [bddOpen, setBddOpen] = useState(false);
  const [cpdOpen, setCpdOpen] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarClosed(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when sidebar is closed
  useEffect(() => {
    if (isSidebarClosed) {
      setBddOpen(false);
      setCpdOpen(false);
    }
  }, [isSidebarClosed]);

  // Auto-open dropdown based on current route
  useEffect(() => {
    const path = location.pathname;
    setBddOpen(path.includes('/staff/bdd/'));
    setCpdOpen(path.includes('/staff/cpd/'));
  }, [location.pathname]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // BDD sub-modules - Short names only
  const bddModules = [
    { 
      name: "NC", 
      icon: "bx bxs-store-alt", 
      path: "/staff/bdd/nc", 
      title: "Negosyo Centers ",
    },
    { 
      name: "SSF", 
      icon: "bx bxs-factory", 
      path: "/staff/bdd/ssf", 
      title: "Shared Service Facilities",
    },
    { 
      name: "CFIDP", 
      icon: "bx bxs-palette", 
      path: "/staff/bdd/cfidp", 
      title: "Coconut Farmers Industry Development Program",
    },
    { 
      name: "RAPID", 
      icon: "bx bxs-leaf", 
      path: "/staff/bdd/rapid", 
      title: "Rural Agro-Industrial Partnership for Inclusive Development and Growth",
    },
    { 
      name: "OTOP", 
      icon: "bx bxs-gift", 
      path: "/staff/bdd/otop", 
      title: "One Town, One Product",
    },
  ];

  // CPD sub-modules - Short names only
  const cpdModules = [
    { 
      name: "SP", 
      icon: "bx bxs-chart", 
      path: "/staff/cpd/sp", 
      title: "Sales Promo ",
    },
    { 
      name: "FTL", 
      icon: "bx bxs-plane-take-off", 
      path: "/staff/cpd/ftl", 
      title: "Fair Trade Law ",
    },
    { 
      name: "CA", 
      icon: "bx bxs-bullhorn", 
      path: "/staff/cpd/ca", 
      title: "Consumer Advocacy ",
    },
  ];

  // Standalone modules - WITHOUT Users panel
  const standaloneModules = [
    { name: "Dashboard", icon: "bx bxs-dashboard", path: "/staff/dashboard", title: "Dashboard Overview" },
  ];

  // Determine if module is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="dashboard">
      <div className={`sidebar ${isSidebarClosed ? "close" : ""}`}>
        <div className="sidebar-content">
          <NavLink to="/staff/dashboard" className="logo">
            <div className="logo-content">
              <div className="logo-img">
                <img src="/img/logo.png" alt="Digital Integrity Logo" />
              </div>
              {!isSidebarClosed && (
                <div className="logo-text">
                  <div className="logo-main">DIGITAL INTEGRITY</div>
                  <div className="logo-subtitle">DTI DASHBOARD</div>
                </div>
              )}
            </div>
          </NavLink>
          
          <div className="side-menu-container">
            <ul className="side-menu">
              {/* Dashboard only (no Users panel) */}
              {standaloneModules.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => (isActive ? "active" : "")}
                    title={link.title}
                  >
                    <i className={link.icon}></i>
                    {!isSidebarClosed && <span className="menu-title">{link.name}</span>}
                  </NavLink>
                </li>
              ))}
              
              {/* BDD Section */}
              <li className="menu-section">
                {!isSidebarClosed && <div className="section-title">BUSINESS DEVELOPMENT DIVISION</div>}
                <div 
                  className={`dropdown-toggle ${bddOpen ? 'open' : ''} ${bddModules.some(m => isActive(m.path)) ? 'active' : ''}`}
                  onClick={() => !isSidebarClosed && setBddOpen(!bddOpen)}
                  title="Business Development Division"
                >
                  <i className="bx bxs-buildings"></i>
                  {!isSidebarClosed && (
                    <>
                      <span className="menu-title">BDD</span>
                      <i className={`bx ${bddOpen ? 'bx-chevron-down' : 'bx-chevron-right'} dropdown-arrow`}></i>
                    </>
                  )}
                </div>
                <Collapse in={!isSidebarClosed && bddOpen}>
                  <ul className="sub-menu">
                    {bddModules.map((link, index) => (
                      <li key={index}>
                        <NavLink
                          to={link.path}
                          className={({ isActive }) => (isActive ? "active" : "")}
                          title={link.title}
                        >
                          <i className={link.icon}></i>
                          <div className="menu-text">
                            <span className="menu-title">{link.name}</span>
                          </div>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </Collapse>
              </li>
              
              {/* CPD Section */}
              <li className="menu-section">
                {!isSidebarClosed && <div className="section-title">CONSUMER PROTECTION DIVISION</div>}
                <div 
                  className={`dropdown-toggle ${cpdOpen ? 'open' : ''} ${cpdModules.some(m => isActive(m.path)) ? 'active' : ''}`}
                  onClick={() => !isSidebarClosed && setCpdOpen(!cpdOpen)}
                  title="Consumer Protection Division"
                >
                  <i className="bx bxs-check-circle"></i>
                  {!isSidebarClosed && (
                    <>
                      <span className="menu-title">CPD</span>
                      <i className={`bx ${cpdOpen ? 'bx-chevron-down' : 'bx-chevron-right'} dropdown-arrow`}></i>
                    </>
                  )}
                </div>
                <Collapse in={!isSidebarClosed && cpdOpen}>
                  <ul className="sub-menu">
                    {cpdModules.map((link, index) => (
                      <li key={index}>
                        <NavLink
                          to={link.path}
                          className={({ isActive }) => (isActive ? "active" : "")}
                          title={link.title}
                        >
                          <i className={link.icon}></i>
                          <div className="menu-text">
                            <span className="menu-title">{link.name}</span>
                          </div>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </Collapse>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Logout button fixed at the bottom */}
        <div className="logout-container">
          <NavLink 
            to="/" 
            className="logout-btn" 
            onClick={() => localStorage.removeItem("user")}
            title="Logout"
          >
            <i className="bx bx-log-out-circle"></i>
            {!isSidebarClosed && <span className="menu-title">Logout</span>}
          </NavLink>
        </div>
      </div>

      <div className="content">
        <nav className="fixed-nav">
          <div className="nav-left">
            <i 
              className="bx bx-menu toggle-sidebar" 
              onClick={() => setIsSidebarClosed(!isSidebarClosed)}
            ></i>
          </div>
          
          {/* Centered Real-time clock */}
          <div className="nav-center">
            <div className="real-time-clock">
              <span className="clock-time">{formatTime(currentTime)}</span>
              <span className="clock-date">{formatDate(currentTime)}</span>
            </div>
          </div>
          
          <div className="nav-right">
            <Dropdown className="profile-dropdown">
              <Dropdown.Toggle variant="link" id="dropdown-profile">
                <div className="profile">
                  <img 
                    src="/img/staff.png" 
                    alt="Profile" 
                  />
                  {!isSidebarClosed && (
                    <div className="profile-info">
                      <strong>
                        {user?.username || 'Staff'}
                      </strong>
                      <small>
                        {user?.role?.toUpperCase() || 'STAFF'}
                      </small>
                    </div>
                  )}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Header>
                  <strong>
                    {user?.username || 'Staff'}
                  </strong>
                  <small className="d-block text-muted">
                    {user?.email || 'staff@dti.gov.ph'}
                  </small>
                </Dropdown.Header>
                <Dropdown.Item as={NavLink} to="/staff/dashboard">
                  <i className="bx bx-user me-2"></i>
                  My Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={NavLink} to="/" onClick={() => localStorage.removeItem("user")}>
                  <i className="bx bx-log-out me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/staff/dashboard" />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            
            {/* BDD Main Page */}
            <Route path="/bdd" element={<BDD />} />
            
            {/* BDD Sub-modules - USING StaffNC FOR NC */}
            <Route path="/bdd/nc" element={<StaffNC />} />
            <Route path="/bdd/ssf" element={<SSF />} />
            <Route path="/bdd/cfidp" element={<CFIDP />} />
            <Route path="/bdd/rapid" element={<RAPID />} />
            <Route path="/bdd/otop" element={<OTOP />} />
            
            {/* CPD Main Page */}
            <Route path="/cpd" element={<CPD />} />
            
            {/* CPD Sub-modules */}
            <Route path="/cpd/sp" element={<SP />} />
            <Route path="/cpd/ftl" element={<FTL />} />
            <Route path="/cpd/ca" element={<CA />} />
          </Routes>
        </main>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Staff;