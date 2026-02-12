const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import Models (Register them)
require('./models/User');
require('./models/NCMsmeAssistance');
require('./models/NCFundLiquidation');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const ncRoutes = require('./routes/ncRoutes'); // Add this line

// Routes
app.use('/api/users', userRoutes);
app.use('/api/nc', ncRoutes); // Add this line

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Digital Integrity Dashboard API',
    status: 'running',
    version: '1.0',
    features: ['User Management', 'OTP Login', 'Forgot Password', 'NC Module']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`👤 User Management: http://localhost:${PORT}/api/users`);
  console.log(`📊 NC Module: http://localhost:${PORT}/api/nc`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
});