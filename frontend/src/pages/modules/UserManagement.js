import React, { useState, useEffect } from "react";
import { 
  Container, Row, Col, Table, Button, Modal, Form, 
  Spinner, Badge, Card, InputGroup, Alert, ListGroup
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Edit2, Trash2, Eye, EyeOff, Search, Plus, UserCheck, UserX, Shield, Info, Mail } from 'react-feather';

// Colors from your login CSS
const loginColors = {
  primary: "#1a237e",
  secondary: "#3949ab",
  accent: "#00bcd4",
  success: "#4caf50",
  warning: "#ff9800",
  danger: "#f44336",
  lightBg: "#f8f9fa",
  darkText: "#212529",
  glassBg: "rgba(255, 255, 255, 0.1)",
  glassBorder: "rgba(255, 255, 255, 0.2)"
};

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    isActive: true,
    isFirstLogin: true
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Predefined system accounts
  const predefinedAccounts = ["admin@digitalintegrity.com", "system@digitalintegrity.com"];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      // Sort users: Active first, then by name
      const sortedUsers = response.data.sort((a, b) => {
        // First sort by active status (active users first)
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        
        // Then sort by name alphabetically
        return a.name.localeCompare(b.name);
      });
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      return (
        (user.name?.toLowerCase() || '').includes(query) ||
        (user.email?.toLowerCase() || '').includes(query) ||
        (user.role?.toLowerCase() || '').includes(query) ||
        (user.isActive ? 'active' : 'inactive').includes(query) ||
        (user.isFirstLogin ? 'pending' : 'verified').includes(query)
      );
    });
    
    // Maintain the same sorting order
    const sortedFiltered = filtered.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });
    
    setFilteredUsers(sortedFiltered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "role") setRoleError("");
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({ 
      ...editFormData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.role) {
      setRoleError("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users", {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role
      });

      if (response.data.success) {
        const message = response.data.otpSent 
          ? "User created successfully! OTP sent to user's email."
          : "User created successfully! (Email sending failed)";
        
        toast.success(message);
        setFormData({ name: "", email: "", password: "", role: "" });
        setShowPassword(false);
        fetchUsers();
        setShowModal(false);
      } else {
        toast.error(response.data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isFirstLogin: user.isFirstLogin || false
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editFormData.role) {
      setRoleError("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const userToUpdate = users.find(user => user.email === editFormData.email);
      if (!userToUpdate) {
        toast.error("User not found");
        return;
      }

      const response = await axios.put(`http://localhost:5000/api/users/${userToUpdate._id}`, {
        name: editFormData.name,
        role: editFormData.role,
        isActive: editFormData.isActive
      });

      toast.success("User updated successfully!");
      fetchUsers();
      setShowEditModal(false);
      setShowViewModal(false);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (predefinedAccounts.includes(user.email.toLowerCase())) {
      toast.error("Cannot change status of predefined system accounts");
      return;
    }

    const newStatus = !user.isActive;
    const action = newStatus ? "activate" : "deactivate";
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/users/${user._id}`, {
        name: user.name,
        role: user.role,
        isActive: newStatus
      });

      toast.success(`User ${action}d successfully!`);
      fetchUsers();
      setShowViewModal(false);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (predefinedAccounts.includes(email.toLowerCase())) {
      toast.error("Cannot delete predefined system accounts");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setIsLoading(true);
    try {
      const userToDelete = users.find(user => user.email === email);
      if (!userToDelete) {
        toast.error("User not found");
        return;
      }

      await axios.delete(`http://localhost:5000/api/users/${userToDelete._id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
      setShowViewModal(false);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (userId, email) => {
    if (!window.confirm(`Resend OTP to ${email}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/resend-otp', {
        userId
      });

      if (response.data.success) {
        toast.success(`OTP resent to ${email}`);
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format role for display
  const formatRole = (role) => {
    const roleMap = {
      'Admin': 'Administrator',
      'Staff': 'Staff Member'
    };
    return roleMap[role] || role;
  };

  // Function to get status badge
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge 
        style={{ 
          backgroundColor: loginColors.success,
          color: 'white',
          padding: '0.4em 0.8em',
          fontSize: '0.85em',
          fontWeight: '500'
        }}
      >
        Active
      </Badge>
    ) : (
      <Badge 
        style={{ 
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '0.4em 0.8em',
          fontSize: '0.85em',
          fontWeight: '500'
        }}
      >
        Inactive
      </Badge>
    );
  };

  // Function to get OTP status badge
  const getOTPStatusBadge = (isFirstLogin) => {
    return isFirstLogin ? (
      <Badge 
        style={{ 
          backgroundColor: loginColors.warning,
          color: 'white',
          padding: '0.4em 0.8em',
          fontSize: '0.85em',
          fontWeight: '500'
        }}
      >
        Pending OTP
      </Badge>
    ) : (
      <Badge 
        style={{ 
          backgroundColor: loginColors.success,
          color: 'white',
          padding: '0.4em 0.8em',
          fontSize: '0.85em',
          fontWeight: '500'
        }}
      >
        Verified
      </Badge>
    );
  };

  return (
    <Container fluid className="p-4" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <ToastContainer 
        toastClassName="custom-toast"
        progressClassName="custom-progress"
        style={{ fontSize: '0.9rem' }}
      />
      
      {/* Header with Add User Button Only */}
      <div className="d-flex justify-content-end mb-4">
        <Button 
          onClick={() => setShowModal(true)}
          style={{ 
            background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`,
            border: 'none',
            fontWeight: '600',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
            transition: 'all 0.3s ease',
            fontSize: '0.95rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 15px rgba(26, 35, 126, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(26, 35, 126, 0.2)';
          }}
        >
          <Plus size={18} className="me-2" />
          Add User
        </Button>
      </div>

      {/* Search Section */}
      <Card className="mb-4" style={{ 
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '15px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup className="mb-0">
                <InputGroup.Text 
                  style={{ 
                    backgroundColor: 'white', 
                    borderRight: 'none',
                    borderColor: '#dee2e6',
                    borderRadius: '8px 0 0 8px',
                    padding: '0.375rem 0.75rem'
                  }}
                >
                  <Search size={16} color={loginColors.primary} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.9rem',
                    padding: '0.375rem 0.75rem',
                    maxWidth: '300px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = loginColors.primary;
                    e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="text-muted small mt-2 mt-md-0">
                <span className="fw-medium" style={{ color: loginColors.primary }}>
                  {filteredUsers.length}
                </span> users found
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0" style={{ 
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <Card.Body className="p-0">
          {isLoading && users.length === 0 ? (
            <div className="text-center p-5">
              <Spinner 
                animation="border" 
                role="status" 
                style={{ 
                  color: loginColors.primary,
                  width: '3rem',
                  height: '3rem'
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Alert variant="info" className="m-4" style={{ 
              backgroundColor: '#e3f2fd',
              borderColor: '#bbdefb',
              color: '#1565c0',
              borderRadius: '8px',
              border: 'none'
            }}>
              {searchQuery ? 'No users found matching your search.' : 'No users found. Click "Add User" to create the first user.'}
            </Alert>
          ) : (
            <Table hover responsive className="mb-0">
              <thead style={{ 
                background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`, 
                color: 'white' 
              }}>
                <tr>
                  <th className="align-middle py-3 ps-4" style={{ borderTopLeftRadius: '15px' }}>Name</th>
                  <th className="align-middle py-3">Email</th>
                  <th className="align-middle py-3 text-center">Role</th>
                  <th className="align-middle py-3 text-center">Status</th>
                  <th className="align-middle py-3 text-center">OTP Status</th>
                  <th className="align-middle py-3 text-center pe-4" style={{ borderTopRightRadius: '15px', width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isPredefined = predefinedAccounts.includes(user.email.toLowerCase());
                  
                  return (
                    <tr key={user._id} className="align-middle">
                      <td className="py-3 ps-4">
                        <div className="d-flex align-items-center">
                          <span className="fw-medium" style={{ color: loginColors.darkText }}>{user.name}</span>
                          {isPredefined && (
                            <Badge 
                              className="ms-2" 
                              style={{ 
                                backgroundColor: loginColors.accent,
                                fontSize: '0.7em',
                                color: 'white',
                                padding: '0.2em 0.6em',
                                borderRadius: '4px'
                              }}
                            >
                              System
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3" style={{ color: '#666' }}>{user.email}</td>
                      <td className="py-3 text-center">
                        <Badge 
                          style={{ 
                            backgroundColor: user.role === 'Admin' ? '#ff9800' : '#2196f3',
                            color: 'white',
                            padding: '0.4em 0.8em',
                            fontSize: '0.85em',
                            fontWeight: '500',
                            borderRadius: '6px'
                          }}
                        >
                          {formatRole(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="py-3 text-center">
                        {getOTPStatusBadge(user.isFirstLogin)}
                      </td>
                      <td className="py-3 text-center pe-4">
                        <div className="d-flex gap-2 justify-content-center align-items-center" style={{ width: '160px', margin: '0 auto' }}>
                          {/* View Button */}
                          <button 
                            onClick={() => handleViewUser(user)}
                            disabled={isLoading}
                            className="btn btn-link p-1"
                            title="View Details"
                            style={{ 
                              textDecoration: 'none',
                              color: loginColors.primary,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f2ff'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <Eye size={18} />
                          </button>
                          
                          {/* Edit Button */}
                          <button 
                            onClick={() => handleEditUser(user)}
                            disabled={isLoading}
                            className="btn btn-link p-1"
                            title="Edit User"
                            style={{ 
                              textDecoration: 'none',
                              color: loginColors.accent,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f7fa'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <Edit2 size={18} />
                          </button>
                          
                          {/* Toggle Status Button */}
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            disabled={isLoading || isPredefined}
                            className="btn btn-link p-1"
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                            style={{ 
                              textDecoration: 'none',
                              color: user.isActive ? loginColors.warning : loginColors.success,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fff3e0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteUser(user.email)}
                            disabled={isLoading || isPredefined}
                            className="btn btn-link p-1"
                            title="Delete User"
                            style={{ 
                              textDecoration: 'none',
                              color: loginColors.danger,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add User Modal */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setRoleError("");
          setFormData({ name: "", email: "", password: "", role: "" });
          setShowPassword(false);
        }}
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton 
          className="py-3 border-0"
          style={{ 
            background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`,
            color: 'white'
          }}
        >
          <Modal.Title className="fs-5 fw-bold">Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-4" style={{ backgroundColor: 'white' }}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
                className="py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#fafafa',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = loginColors.primary;
                  e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#fafafa';
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
                className="py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#fafafa',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = loginColors.primary;
                  e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#fafafa';
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  minLength="6"
                  className="py-2"
                  style={{ 
                    border: '1px solid #dee2e6',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    background: '#fafafa',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = loginColors.primary;
                    e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#fafafa';
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Button 
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  className="py-2"
                  style={{ 
                    border: '1px solid #dee2e6',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    color: loginColors.primary,
                    background: '#fafafa'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted small">
                Password must be at least 6 characters long. OTP will be sent to user's email.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>User Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                isInvalid={!!roleError}
                className="py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#fafafa',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = loginColors.primary;
                  e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#fafafa';
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select a role</option>
                <option value="Admin">Administrator</option>
                <option value="Staff">Staff Member</option>
              </Form.Select>
              {roleError && (
                <div className="text-danger small mt-1">{roleError}</div>
              )}
            </Form.Group>
            
            <div className="d-flex gap-2 pt-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setShowModal(false);
                  setRoleError("");
                  setShowPassword(false);
                }}
                disabled={isLoading}
                className="flex-fill py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = loginColors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#dee2e6';
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-fill py-2"
                style={{ 
                  background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(26, 35, 126, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Creating...
                  </>
                ) : "Create User"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => {
          setShowEditModal(false);
          setRoleError("");
        }}
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton 
          className="py-3 border-0"
          style={{ 
            background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`,
            color: 'white'
          }}
        >
          <Modal.Title className="fs-5 fw-bold">Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-4" style={{ backgroundColor: 'white' }}>
          <Form onSubmit={handleUpdateUser}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                placeholder="Enter full name"
                required
                className="py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#fafafa',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = loginColors.primary;
                  e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#fafafa';
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                disabled
                className="py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#f5f5f5',
                  fontSize: '0.9rem',
                  color: '#666'
                }}
              />
              <Form.Text className="text-muted small">
                Email cannot be changed.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>User Role</Form.Label>
              <Form.Select
                name="role"
                value={editFormData.role}
                onChange={handleEditInputChange}
                required
                isInvalid={!!roleError}
                className="py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#fafafa',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = loginColors.primary;
                  e.target.style.boxShadow = '0 0 0 0.15rem rgba(26, 35, 126, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#fafafa';
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select a role</option>
                <option value="Admin">Administrator</option>
                <option value="Staff">Staff Member</option>
              </Form.Select>
              {roleError && (
                <div className="text-danger small mt-1">{roleError}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label=""
                  checked={editFormData.isActive}
                  onChange={handleEditInputChange}
                  className="me-2"
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <div className="fw-medium" style={{ color: loginColors.darkText, fontSize: '0.9rem' }}>
                    User is active (can login to system)
                  </div>
                  <div className="text-muted small">
                    When unchecked, user will not be able to login or access the system.
                  </div>
                </div>
              </div>
            </Form.Group>
            
            <div className="d-flex gap-2 pt-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowEditModal(false)}
                disabled={isLoading}
                className="flex-fill py-2"
                style={{ 
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = loginColors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#dee2e6';
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-fill py-2"
                style={{ 
                  background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(26, 35, 126, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Updating...
                  </>
                ) : "Update User"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View User Details Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => setShowViewModal(false)}
        centered
        size="lg"
      >
        <Modal.Header 
          closeButton 
          className="py-3 border-0"
          style={{ 
            background: `linear-gradient(135deg, ${loginColors.primary}, ${loginColors.secondary})`,
            color: 'white'
          }}
        >
          <Modal.Title className="fs-5 fw-bold">User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-4" style={{ backgroundColor: 'white' }}>
          {selectedUser && (
            <div>
              {/* User Information */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: loginColors.primary }}>User Information</h6>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 border-0">
                    <span className="fw-medium" style={{ color: loginColors.darkText }}>Name:</span>
                    <span style={{ color: '#666' }}>{selectedUser.name}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 border-0">
                    <span className="fw-medium" style={{ color: loginColors.darkText }}>Email:</span>
                    <span style={{ color: '#666' }}>{selectedUser.email}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 border-0">
                    <span className="fw-medium" style={{ color: loginColors.darkText }}>Role:</span>
                    <Badge 
                      style={{ 
                        backgroundColor: selectedUser.role === 'Admin' ? '#ff9800' : '#2196f3',
                        color: 'white',
                        padding: '0.4em 0.8em',
                        fontSize: '0.85em',
                        fontWeight: '500'
                      }}
                    >
                      {formatRole(selectedUser.role)}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 border-0">
                    <span className="fw-medium" style={{ color: loginColors.darkText }}>Status:</span>
                    {getStatusBadge(selectedUser.isActive)}
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-2 border-0">
                    <span className="fw-medium" style={{ color: loginColors.darkText }}>OTP Verification:</span>
                    {getOTPStatusBadge(selectedUser.isFirstLogin)}
                  </ListGroup.Item>
                </ListGroup>
              </div>

              {/* Actions Section */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: loginColors.primary }}>Actions</h6>
                <div className="row g-3">
                  {/* Resend OTP Button - Only show if user needs OTP */}
                  {selectedUser.isFirstLogin && selectedUser.isActive && (
                    <div className="col-md-6">
                      <Button 
                        onClick={() => handleResendOTP(selectedUser._id, selectedUser.email)}
                        disabled={isLoading}
                        variant="outline-primary"
                        className="w-100 py-2 d-flex align-items-center justify-content-center"
                        style={{ 
                          border: `1px solid ${loginColors.accent}`,
                          color: loginColors.accent,
                          borderRadius: '8px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#e0f7fa';
                          e.target.style.color = loginColors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = loginColors.accent;
                        }}
                      >
                        <Mail size={16} className="me-2" />
                        Resend OTP
                      </Button>
                    </div>
                  )}
                  
                  {/* Edit Button */}
                  <div className="col-md-6">
                    <Button 
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditUser(selectedUser);
                      }}
                      disabled={isLoading}
                      variant="outline-primary"
                      className="w-100 py-2 d-flex align-items-center justify-content-center"
                      style={{ 
                        border: `1px solid ${loginColors.primary}`,
                        color: loginColors.primary,
                        borderRadius: '8px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f0f2ff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Edit2 size={16} className="me-2" />
                      Edit User
                    </Button>
                  </div>
                  
                  {/* Toggle Status Button */}
                  <div className="col-md-6">
                    <Button 
                      onClick={() => handleToggleStatus(selectedUser)}
                      disabled={isLoading || predefinedAccounts.includes(selectedUser.email.toLowerCase())}
                      variant="outline-warning"
                      className="w-100 py-2 d-flex align-items-center justify-content-center"
                      style={{ 
                        border: `1px solid ${selectedUser.isActive ? loginColors.warning : loginColors.success}`,
                        color: selectedUser.isActive ? loginColors.warning : loginColors.success,
                        borderRadius: '8px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = selectedUser.isActive ? '#fff3e0' : '#e8f5e9';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      {selectedUser.isActive ? (
                        <>
                          <UserX size={16} className="me-2" />
                          Deactivate User
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} className="me-2" />
                          Activate User
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Delete Button */}
                  <div className="col-md-6">
                    <Button 
                      onClick={() => handleDeleteUser(selectedUser.email)}
                      disabled={isLoading || predefinedAccounts.includes(selectedUser.email.toLowerCase())}
                      variant="outline-danger"
                      className="w-100 py-2 d-flex align-items-center justify-content-center"
                      style={{ 
                        border: `1px solid ${loginColors.danger}`,
                        color: loginColors.danger,
                        borderRadius: '8px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#ffebee';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 size={16} className="me-2" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>

              {/* Warning for predefined accounts */}
              {predefinedAccounts.includes(selectedUser.email.toLowerCase()) && (
                <Alert variant="info" className="mt-3" style={{ 
                  backgroundColor: '#e3f2fd',
                  borderColor: '#bbdefb',
                  color: '#1565c0',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.9rem'
                }}>
                  <Info size={16} className="me-2" />
                  This is a predefined system account. Some actions are restricted for security reasons.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserManagement;