import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Spinner, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './Login.css';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoAccountType, setDemoAccountType] = useState('');
  
  const navigate = useNavigate();

  // Demo credentials with passwords
  const demoCredentials = {
    admin: {
      email: 'admin@digitalintegrity.com',
      password: 'Admin@2024',
      name: 'System Administrator',
      role: 'Admin'
    },
    staff: {
      email: 'staff@example.com',
      password: 'Staff@2024',
      name: 'Demo Staff',
      role: 'Staff'
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage('Please fill in both fields.');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    
    return true;
  };

  const handleDemoLogin = (accountType) => {
    setDemoAccountType(accountType);
    setIsDemoMode(true);
    const credentials = demoCredentials[accountType];
    
    // Auto-fill credentials
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    // Simulate login with demo credentials
    simulateLogin(credentials);
  };

  const simulateLogin = async (userData) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store user data
    localStorage.setItem('user', JSON.stringify({
      ...userData,
      username: userData.email.split('@')[0],
      isActive: true
    }));

    toast.success(`Welcome, ${userData.name}!`, {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: true,
      className: 'custom-toast',
    });

    setTimeout(() => {
      const route = userData.role === 'Admin' ? '/admin/dashboard' : '/staff/dashboard';
      navigate(route);
    }, 1800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: email.toLowerCase().trim(),
        password: password
      });

      console.log('Login API Response:', response.data);
      
      if (response.data.requireOTP) {
        // User needs OTP verification (first-time login)
        toast.info('OTP verification required. Check your email.');
        
        // Redirect to OTP verification page
        navigate('/verify-otp', {
          state: {
            userId: response.data.userId,
            email: response.data.email,
            name: response.data.name,
            fromLogin: true,
            isForgotPassword: false
          }
        });
      } else if (response.data.user) {
        // Normal login (already verified)
        const user = response.data.user;
        
        // Check if user is active
        if (!user.isActive) {
          toast.error('Your account is inactive. Please contact administrator.', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: true,
            className: 'custom-toast-error',
          });
          setIsLoading(false);
          return;
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          ...user,
          username: user.email.split('@')[0]
        }));

        toast.success(`Welcome, ${user.name}!`, {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
          className: 'custom-toast',
        });

        setTimeout(() => {
          // Navigate based on role
          const route = user.role === 'Admin' ? '/admin/dashboard' : '/staff/dashboard';
          navigate(route);
        }, 1500);

      } else {
        setErrorMessage(response.data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        switch (error.response.status) {
          case 400:
            setErrorMessage(error.response.data?.message || 'Email and password are required.');
            break;
          case 401:
            setErrorMessage(error.response.data?.message || 'Invalid email or password.');
            break;
          case 403:
            setErrorMessage('Account is inactive. Please contact administrator.');
            break;
          default:
            setErrorMessage(error.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setErrorMessage('Network error. Please check if the backend server is running on http://localhost:5000');
      } else {
        console.error('Error setting up request:', error.message);
        setErrorMessage('An error occurred. Please try again.');
      }
      
      toast.error(errorMessage || 'Login failed', {
        position: 'top-center',
        autoClose: 3000,
        className: 'custom-toast-error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create default admin user on first load
  React.useEffect(() => {
    const createDefaultAdmin = async () => {
      try {
        // Check if default admin exists
        const response = await axios.get('http://localhost:5000/api/users');
        const users = response.data;
        const adminExists = users.some(user => user.email === 'admin@digitalintegrity.com');
        
        if (!adminExists) {
          // Create default admin
          await axios.post('http://localhost:5000/api/users', {
            name: 'System Administrator',
            email: 'admin@digitalintegrity.com',
            password: 'Admin@2024',
            role: 'Admin'
          });
          console.log('Default admin user created');
        }
      } catch (error) {
        console.log('Admin check/create:', error.message);
      }
    };

    createDefaultAdmin();
  }, []);

  return (
    <div className="login-page">
      <div className="split-screen">
        {/* Left side - Background (70%) */}
        <div className="left-side">
          <div className="dark-overlay-gradient"></div>
          
          {/* Animated Background */}
          <div className="bg-animation">
            <div className="bg-circle bg-circle-1"></div>
            <div className="bg-circle bg-circle-2"></div>
            <div className="bg-circle bg-circle-3"></div>
          </div>
          
          {/* Welcome Content */}
          <div className="welcome-content">
            <img
              src="/img/logo.png"
              alt="Digital Integrity Dashboard Logo"
              className="welcome-logo floating-logo"
            />
            <h1 className="welcome-title">
              Digital Integrity Dashboard
            </h1>
            <p className="welcome-subtitle">
              Department of Trade and Industry<br />
              LANAO DEL NORTE PROVINCE
            </p>
          </div>
        </div>

        {/* Right side - Login Form (30%) */}
        <div className="right-side">
          <div className="login-form-wrapper">
            
            {/* Form Header */}
            <div className="form-header-glass">
              <div className="form-header-content">
                <div className="form-avatar">
                  <i className="bx bx-user-circle"></i>
                </div>
                <div className="form-header-text">
                  <h2 className="form-title">Secure Login</h2>
                  <p className="form-subtitle">Access your dashboard</p>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <Card className="login-form-card">
              <Card.Body>
                <Form onSubmit={handleLogin} className="login-form">
                  <Form.Group className="form-group" controlId="formEmail">
                    <Form.Label className="form-label">
                      <i className="bx bx-envelope me-2"></i>
                      Email Address
                    </Form.Label>
                    <div className="input-with-icon">
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isInvalid={errorMessage && !email}
                        required
                        className="custom-input"
                        autoComplete="username"
                      />
                      <div className="input-border"></div>
                    </div>
                  </Form.Group>

                  <Form.Group className="form-group" controlId="formPassword">
                    <Form.Label className="form-label">
                      <i className="bx bx-lock-alt me-2"></i>
                      Password
                    </Form.Label>
                    <div className="input-with-icon">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={errorMessage && !password}
                        required
                        className="custom-input password-input"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                        tabIndex="-1"
                      >
                        <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
                      </button>
                      <div className="input-border"></div>
                    </div>
                  </Form.Group>

                  {/* Remember & Forgot */}
                  <div className="form-options">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                      className="small"
                    />
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot Password?
                    </Link>
                  </div>

                  {errorMessage && (
                    <div className="alert alert-danger error-alert" role="alert">
                      <i className="bx bx-error-circle me-2"></i>
                      {errorMessage}
                    </div>
                  )}

                  {/* Sign In Button */}
                  <div className="login-button-container">
                    <Button
                      variant="primary"
                      type="submit"
                      className="login-button"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          {isDemoMode ? `Logging in...` : 'Authenticating...'}
                        </>
                      ) : (
                        <>
                          <i className="bx bx-log-in-circle me-2"></i>
                          Sign In
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="divider">
                    <span>OR</span>
                  </div>

                  {/* Demo Credentials - Simplified */}
                  <div className="demo-section">
                    <h5 className="demo-title">
                      <i className="bx bx-rocket me-2"></i>
                      Quick Access Demo
                    </h5>
                    
                    <div className="demo-buttons">
                      <button
                        type="button"
                        className={`demo-btn demo-admin ${demoAccountType === 'admin' ? 'demo-active' : ''}`}
                        onClick={() => handleDemoLogin('admin')}
                        disabled={isLoading}
                      >
                        <i className="bx bx-crown"></i>
                        <span>Admin</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`demo-btn demo-staff ${demoAccountType === 'staff' ? 'demo-active' : ''}`}
                        onClick={() => handleDemoLogin('staff')}
                        disabled={isLoading}
                      >
                        <i className="bx bx-user"></i>
                        <span>Staff</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="form-footer">
                    <p className="copyright">
                      © {new Date().getFullYear()} DTI Dashboard
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Login;