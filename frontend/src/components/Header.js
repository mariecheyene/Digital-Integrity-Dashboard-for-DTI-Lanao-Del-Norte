import React from 'react';

const Header = ({ title }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <header style={styles.header}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.userInfo}>
        <span>{user?.username}</span>
        <span style={styles.role}>({user?.role})</span>
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: '#001529',
    color: 'white',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  role: {
    background: '#1890ff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  }
};

export default Header;