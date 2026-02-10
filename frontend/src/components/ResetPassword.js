import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Key, Eye, EyeOff, CheckCircle, ArrowLeft } from 'react-feather';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, name, otp } = location.state || {};

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) strength++;
    
    if (password.length < 8) feedback.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) feedback.push('One uppercase letter');
    if (!/[a-z]/.test(password)) feedback.push('One lowercase letter');
    if (!/[0-9]/.test(password)) feedback.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) feedback.push('One special character');
    
    return {
      strength,
      feedback,
      isValid: strength === 5
    };
  };

  const handlePasswordChange = (password) => {
    setNewPassword(password);
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!userId || !otp) {
      setError('Missing verification data. Please start over.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const strength = checkPasswordStrength(newPassword);
    if (!strength.isValid) {
      setError('Password does not meet security requirements');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/reset-password', {
        userId,
        otp,
        newPassword
      });

      if (response.data.success) {
        toast.success('✅ Password reset successfully! You can now login.');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/forgot-password');
  };

  if (!userId || !otp) {
    return (
      <Container fluid className="p-0" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Alert variant="danger">
              Missing verification data. Please restart the password reset process.
            </Alert>
            <div className="text-center mt-3">
              <Button 
                variant="primary" 
                onClick={() => navigate('/forgot-password')}
              >
                Go to Forgot Password
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  const strength = checkPasswordStrength(newPassword);

  return (
    <Container fluid className="p-0" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <ToastContainer />
      
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={6} lg={5} xl={4}>
          <Card className="border-0 shadow-lg" style={{ 
            borderRadius: '15px', 
            overflow: 'hidden'
          }}>
            <Card.Header className="py-4 border-0 text-center" style={{ 
              background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
              color: 'white'
            }}>
              <div className="mb-3">
                <div className="rounded-circle bg-white bg-opacity-20 d-inline-flex p-3">
                  <Key size={32} />
                </div>
              </div>
              <h4 className="mb-0 fw-bold">Set New Password</h4>
              <small>Create a secure password for your account</small>
            </Card.Header>
            
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <p className="text-muted mb-1">
                  Hello, <span className="fw-medium">{name || email}</span>
                </p>
                <p className="text-muted small">
                  Create a new secure password for your account
                </p>
              </div>

              <Form onSubmit={handleResetPassword}>
                {/* New Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      style={{ padding: '0.75rem' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </InputGroup>
                  
                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-1">
                        <div style={{ 
                          flex: 1, 
                          height: '4px', 
                          background: '#e9ecef',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${(strength.strength / 5) * 100}%`, 
                            height: '100%',
                            background: strength.strength >= 4 ? '#4caf50' : 
                                      strength.strength >= 3 ? '#ff9800' : '#f44336',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span className="ms-2 small fw-medium" style={{
                          color: strength.strength >= 4 ? '#4caf50' : 
                                strength.strength >= 3 ? '#ff9800' : '#f44336'
                        }}>
                          {strength.strength === 5 ? 'Strong' : 
                           strength.strength >= 3 ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                      
                      {/* Requirements */}
                      <div className="small">
                        {strength.feedback.map((req, index) => (
                          <div key={index} className="d-flex align-items-center mb-1">
                            <CheckCircle 
                              size={14} 
                              className="me-2" 
                              style={{ 
                                color: newPassword.match(getRegexForRequirement(req)) ? '#4caf50' : '#ccc',
                                flexShrink: 0
                              }}
                            />
                            <span style={{ 
                              color: newPassword.match(getRegexForRequirement(req)) ? '#666' : '#999'
                            }}>
                              {req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Confirm Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ padding: '0.75rem' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </InputGroup>
                  
                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="text-danger small mt-1">
                      Passwords do not match
                    </div>
                  )}
                  
                  {confirmPassword && newPassword === confirmPassword && (
                    <div className="text-success small mt-1">
                      ✓ Passwords match
                    </div>
                  )}
                </Form.Group>

                {error && (
                  <Alert variant="danger" className="small">
                    {error}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-fill py-2"
                  >
                    <ArrowLeft size={16} className="me-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !strength.isValid || newPassword !== confirmPassword}
                    className="flex-fill py-2 fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </div>
              </Form>

              {/* Security Tips */}
              <Alert variant="info" className="small mt-4">
                <strong>💡 Security Tips:</strong>
                <ul className="mb-0 mt-1">
                  <li>Use a unique password not used elsewhere</li>
                  <li>Avoid personal information like names or birthdays</li>
                  <li>Consider using a password manager</li>
                  <li>Change your password regularly</li>
                </ul>
              </Alert>
            </Card.Body>
            
            <Card.Footer className="text-center py-3 border-0" style={{ 
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #dee2e6'
            }}>
              <small className="text-muted">
                After resetting, you'll be redirected to login
              </small>
            </Card.Footer>
          </Card>
          
          <div className="text-center mt-3">
            <p className="text-muted small">
              © {new Date().getFullYear()} Department of Trade and Industry - Lanao Del Norte
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

// Helper function to get regex for password requirements
const getRegexForRequirement = (req) => {
  switch (req) {
    case 'At least 8 characters':
      return /.{8,}/;
    case 'One uppercase letter':
      return /[A-Z]/;
    case 'One lowercase letter':
      return /[a-z]/;
    case 'One number':
      return /[0-9]/;
    case 'One special character':
      return /[!@#$%^&*(),.?":{}|<>_-]/;
    default:
      return /./;
  }
};

export default ResetPassword;