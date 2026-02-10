import React from 'react';

const Sidebar = ({ onModuleClick, onLogout, accessibleModules }) => {
  const allModules = [
    'BDD', 'NC', 'SSF', 'CPIDP', 'DTDP', 'CPD', 'SP', 'FTL', 'CA'
  ];
  
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';
  
  // Determine which modules to show
  const modulesToShow = accessibleModules || allModules;

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>DID</div>
      
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          <h4 style={styles.sectionTitle}>Modules</h4>
          {modulesToShow.map(module => (
            <button
              key={module}
              onClick={() => onModuleClick(module)}
              style={styles.navButton}
            >
              {module}
              {!isAdmin && !accessibleModules?.includes(module) && ' 🔒'}
            </button>
          ))}
        </div>
      </nav>
      
      <button onClick={onLogout} style={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '200px',
    background: '#f0f2f5',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  logo: {
    padding: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1890ff',
    textAlign: 'center'
  },
  nav: {
    flex: 1,
    padding: '10px'
  },
  navSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '10px 0',
    color: '#666',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  navButton: {
    width: '100%',
    padding: '10px',
    margin: '2px 0',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  logoutButton: {
    margin: '20px',
    padding: '10px',
    background: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Sidebar;