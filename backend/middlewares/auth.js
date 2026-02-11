const jwt = require('jsonwebtoken');

// Authentication middleware - verifies JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production');
    req.user = decoded; // Contains { userId, email, name, role }
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.' 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Role-based authorization
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
};

// Authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeRoles
};