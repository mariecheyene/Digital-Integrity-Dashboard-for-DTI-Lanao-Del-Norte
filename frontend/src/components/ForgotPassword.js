import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Mail } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/forgot-password', 
        { email }
      );
      
      if (response.data.success) {
        toast.success('✅ OTP sent to your email! Please check your inbox.');
        
        // Redirect to OTP verification page
        navigate('/verify-otp', {
          state: {
            userId: response.data.userId,
            email: response.data.email,
            fromLogin: false,
            isForgotPassword: true
          }
        });
      } else {
        toast.info(response.data.message || 'If your email exists, you will receive an OTP.');
      }
    } catch (error) {
      console.error('Error details:', error);
      
      let errorMsg = 'Failed to send OTP';
      
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'No response from server. Is the backend running?';
      } else {
        errorMsg = error.message;
      }
      
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-0" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <ToastContainer />
      
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={6} lg={5} xl={4}>
          <Card className="border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <Card.Header className="py-4 border-0 text-center" style={{ 
              background: 'linear-gradient(135deg, #f44336, #d32f2f)',
              color: 'white'
            }}>
              <h4 className="mb-0 fw-bold">
                Forgot Password
              </h4>
              <small>DTI - Lanao Del Norte Province</small>
            </Card.Header>
            
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex p-3 mb-3">
                  <Mail size={32} color="#d32f2f" />
                </div>
                <h4 className="fw-bold">Reset Your Password</h4>
                <p className="text-muted">
                  Enter your email address to receive a verification OTP
                </p>
              </div>

              <Form onSubmit={handleRequestReset}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                      <Mail size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ 
                        borderLeft: 'none',
                        padding: '0.75rem'
                      }}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    You'll receive a 6-digit OTP via email
                  </Form.Text>
                </Form.Group>

                {message && (
                  <Alert variant="danger" className="small">
                    {message}
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2 fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP to Email'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <Link 
                  to="/login" 
                  className="text-decoration-none d-flex align-items-center justify-content-center"
                  style={{ color: '#1a237e' }}
                >
                  ← Back to Login
                </Link>
              </div>

              <Alert variant="info" className="small mt-4">
                <strong>Note:</strong>
                <ul className="mb-0 mt-1">
                  <li>Check your email inbox and spam folder</li>
                  <li>OTP is valid for 10 minutes</li>
                  <li>After OTP verification, you'll set a new password</li>
                </ul>
              </Alert>
            </Card.Body>
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

export default ForgotPassword;