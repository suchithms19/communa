require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeRoles } = require('./config/roles');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize roles after database connection
    initializeRoles();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/v1/auth', require('./routes/auth'));
app.use('/v1/community', require('./routes/community'));
app.use('/v1/member', require('./routes/member'));
app.use('/v1/role', require('./routes/role'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: false,
    errors: [{ message: err.message || 'Internal server error' }]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 