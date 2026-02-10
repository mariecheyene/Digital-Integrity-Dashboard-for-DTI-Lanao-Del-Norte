import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Lock, Mail, RefreshCw, ArrowLeft, Shield, CheckCircle } from 'react-feather';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'failed'
  const otpInputs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, name, fromLogin = true, isForgotPassword = false } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      toast.error('Missing user information. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Enable resend after 60 seconds
    const resendTimer = setTimeout(() => {
      setCanResend(true);
    }, 60000);

    return () => {
      clearInterval(timer);
      clearTimeout(resendTimer);
    };
  }, [userId, email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    
    // Auto-submit if all fields filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOTP();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const pasteDigits = pasteData.split('');
      const newOtp = [...otp];
      pasteDigits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus last input
      if (otpInputs.current[5]) {
        otpInputs.current[5].focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    if (!userId) {
      setError('User ID is missing. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError('');
    setVerificationStatus('pending');

    try {
      const endpoint = isForgotPassword ? '/verify-reset-otp' : '/verify-otp';
      console.log('Verifying OTP for user:', userId);
      console.log('OTP:', otpCode);
      
      const response = await axios.post(`http://localhost:5000/api/users${endpoint}`, {
        userId,
        otp: otpCode
      });

      console.log('OTP Verification Response:', response.data);
      
      if (response.data.success) {
        setVerificationStatus('success');
        toast.success('✅ OTP verified successfully!');
        
        if (isForgotPassword) {
          // Redirect to password reset page
          setTimeout(() => {
            navigate('/reset-password', { 
              state: { 
                userId, 
                email, 
                name,
                otp: otpCode 
              } 
            });
          }, 1500);
        } else {
          // For first-time login, mark user as verified and redirect to dashboard
          // IMPORTANT: The backend should have already marked the user as verified
          // So we just need to login normally
          
          // Short delay to show success message
          setTimeout(async () => {
            try {
              // Try to login with the verified user
              const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
                email: email.toLowerCase().trim(),
                password: '' // This should be handled by backend for first-time login
              });
              
              console.log('Login after OTP verification:', loginResponse.data);
              
              if (loginResponse.data.user) {
                const userData = loginResponse.data.user;
                
                // Check if user is active
                if (!userData.isActive) {
                  toast.error('Your account is inactive. Please contact administrator.', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: true,
                  });
                  setIsLoading(false);
                  return;
                }

                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify({
                  ...userData,
                  username: userData.email.split('@')[0]
                }));

                toast.success(`Welcome, ${userData.name}!`, {
                  position: 'top-center',
                  autoClose: 2000,
                  hideProgressBar: true,
                });

                setTimeout(() => {
                  // Navigate based on role
                  const route = userData.role === 'Admin' ? '/admin/dashboard' : '/staff/dashboard';
                  navigate(route);
                }, 1500);
              } else if (loginResponse.data.message) {
                // If there's a specific message from backend
                toast.error(loginResponse.data.message);
                navigate('/login');
              }
            } catch (loginError) {
              console.error('Login after OTP error:', loginError);
              
              // If login fails, redirect to login page with message
              toast.error('Please login with your new password');
              navigate('/login');
            }
          }, 1000);
        }
      } else {
        setVerificationStatus('failed');
        const errorMsg = response.data?.message || 'OTP verification failed';
        setError(errorMsg);
        toast.error(errorMsg);
        
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        if (otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setVerificationStatus('failed');
      
      const errorMsg = error.response?.data?.message || 'Invalid or expired OTP';
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend && resendCount === 0) {
      toast.info('Please wait 60 seconds before resending');
      return;
    }

    if (resendCount >= 3) {
      toast.error('Maximum resend attempts reached. Please contact administrator.');
      return;
    }

    setIsLoading(true);
    setError('');
    setVerificationStatus('pending');

    try {
      const endpoint = isForgotPassword ? '/resend-reset-otp' : '/resend-otp';
      const response = await axios.post(`http://localhost:5000/api/users${endpoint}`, {
        userId
      });

      if (response.data.success) {
        toast.success('✅ New OTP sent to your email!');
        
        // Reset OTP fields
        setOtp(['', '', '', '', '', '']);
        setCountdown(600);
        setCanResend(false);
        setResendCount(prev => prev + 1);
        
        // Reset timer for next resend
        setTimeout(() => {
          setCanResend(true);
        }, 60000);
        
        if (otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to resend OTP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Focus first input on mount
  useEffect(() => {
    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, []);

  // Show verification status
  const renderVerificationStatus = () => {
    if (verificationStatus === 'success') {
      return (
        <Alert variant="success" className="small py-2 text-center">
          <CheckCircle size={16} className="me-2" />
          OTP verified successfully! Redirecting...
        </Alert>
      );
    } else if (verificationStatus === 'failed') {
      return (
        <Alert variant="danger" className="small py-2 text-center">
          OTP verification failed. Please try again.
        </Alert>
      );
    }
    return null;
  };

  if (!userId || !email) {
    return (
      <Container fluid className="p-0" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Alert variant="danger">
              Missing user information. Redirecting to login...
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

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
            overflow: 'hidden',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Card.Header className="py-4 border-0 text-center" style={{ 
              background: isForgotPassword ? 
                'linear-gradient(135deg, #f44336, #d32f2f)' : 
                'linear-gradient(135deg, #1a237e, #3949ab)',
              color: 'white'
            }}>
              <div className="mb-3">
                <div className="rounded-circle bg-white bg-opacity-20 d-inline-flex p-3">
                  {isForgotPassword ? <Lock size={32} /> : <Shield size={32} />}
                </div>
              </div>
              <h4 className="mb-0 fw-bold">
                {isForgotPassword ? 'Password Reset Verification' : 'First-Time Login Verification'}
              </h4>
              <small>{isForgotPassword ? 'Enter OTP to reset password' : 'Enter OTP to verify your account'}</small>
            </Card.Header>
            
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <p className="text-muted mb-1">
                  {isForgotPassword ? 
                    'Enter the OTP sent to your email to reset your password' : 
                    'Enter the OTP sent to your email to complete your first login'}
                </p>
                <p className="fw-medium mb-0" style={{ color: '#1a237e' }}>
                  <Mail size={16} className="me-2" />
                  {email}
                </p>
                {name && (
                  <p className="text-muted small mb-0">
                    Hello, <span className="fw-medium">{name}</span>
                  </p>
                )}
              </div>

              {/* Verification Status */}
              {renderVerificationStatus()}

              {/* OTP Input Fields */}
              <div className="mb-4">
                <Form.Label className="fw-medium mb-3 text-center d-block">
                  Enter 6-digit OTP
                </Form.Label>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={el => otpInputs.current[index] = el}
                      type="text"
                      maxLength="1"
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className="form-control text-center"
                      style={{
                        width: '50px',
                        height: '50px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: verificationStatus === 'success' ? '2px solid #4caf50' : 
                                verificationStatus === 'failed' ? '2px solid #f44336' : '2px solid #dee2e6',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        backgroundColor: verificationStatus === 'success' ? '#f8fff8' : 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1a237e';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(26, 35, 126, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = verificationStatus === 'success' ? '#4caf50' : 
                                                   verificationStatus === 'failed' ? '#f44336' : '#dee2e6';
                        e.target.style.boxShadow = 'none';
                      }}
                      disabled={isLoading || verificationStatus === 'success'}
                    />
                  ))}
                </div>
                
                {/* Countdown Timer */}
                <div className="text-center mb-3">
                  <p className="text-muted small mb-1">
                    OTP expires in: <span className="fw-bold" style={{ color: countdown < 60 ? '#f44336' : '#4caf50' }}>
                      {formatTime(countdown)}
                    </span>
                  </p>
                  {countdown === 0 && (
                    <Alert variant="warning" className="py-2 small">
                      OTP has expired. Please request a new one.
                    </Alert>
                  )}
                </div>
              </div>

              {error && verificationStatus !== 'success' && (
                <Alert variant="danger" className="small py-2 text-center">
                  {error}
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 mb-3">
                <Button
                  variant="outline-secondary"
                  onClick={handleBackToLogin}
                  disabled={isLoading}
                  className="flex-fill py-2"
                >
                  <ArrowLeft size={16} className="me-2" />
                  Back to Login
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.join('').length !== 6 || countdown === 0 || verificationStatus === 'success'}
                  className="flex-fill py-2 fw-semibold"
                  style={{
                    background: verificationStatus === 'success' ? 
                      'linear-gradient(135deg, #4caf50, #2e7d32)' : 
                      (isForgotPassword ? 
                        'linear-gradient(135deg, #f44336, #d32f2f)' : 
                        'linear-gradient(135deg, #1a237e, #3949ab)'),
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Verifying...
                    </>
                  ) : verificationStatus === 'success' ? (
                    <>
                      <CheckCircle size={16} className="me-2" />
                      Verified
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-muted small mb-2">
                  Didn't receive the OTP?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || (!canResend && resendCount > 0) || resendCount >= 3 || verificationStatus === 'success'}
                  className="btn btn-link text-decoration-none"
                  style={{ color: '#1a237e' }}
                >
                  <RefreshCw size={16} className="me-2" />
                  {resendCount >= 3 ? 'Max resends reached' : 'Resend OTP'}
                </button>
                {resendCount > 0 && (
                  <p className="text-muted small mt-1">
                    Resent {resendCount} time{resendCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <Alert variant="info" className="small mt-4">
                <div className="d-flex">
                  <Shield size={16} className="me-2 flex-shrink-0" />
                  <div>
                    <strong>Instructions:</strong>
                    <ul className="mb-0 mt-1">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Enter the 6-digit code exactly as shown</li>
                      <li>Code expires in 10 minutes</li>
                      {isForgotPassword ? (
                        <li>After verification, you'll set a new password</li>
                      ) : (
                        <li>After verification, you'll be automatically logged in</li>
                      )}
                    </ul>
                  </div>
                </div>
              </Alert>
            </Card.Body>
            
            <Card.Footer className="text-center py-3 border-0" style={{ 
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #dee2e6'
            }}>
              <small className="text-muted">
                Need help? Contact system administrator
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        input[type="text"]::-webkit-outer-spin-button,
        input[type="text"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="text"] {
          -moz-appearance: textfield;
        }
        
        .fade-enter {
          opacity: 0;
        }
        .fade-enter-active {
          opacity: 1;
          transition: opacity 300ms;
        }
      `}</style>
    </Container>
  );
};

export default OTPVerification;