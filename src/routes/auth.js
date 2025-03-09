const express = require('express');
const router = express.Router();
const Joi = require('joi');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name should be at least 2 characters.',
      'any.required': 'Name is required.'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Password should be at least 6 characters.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
});

const signinSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

// Signup route
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        errors: [{ 
          param: 'email',
          message: 'User with this email address already exists.',
          code: 'RESOURCE_EXISTS'
        }]
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        meta: {
          access_token: token
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ 
        message: 'Error creating user',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

// Signin route
router.post('/signin', validate(signinSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        errors: [{ 
          param: 'email',
          message: 'Please provide a valid email address.',
          code: 'INVALID_INPUT'
        }]
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        errors: [{ 
          param: 'password',
          message: 'The credentials you provided are invalid.',
          code: 'INVALID_CREDENTIALS'
        }]
      });
    }

    const token = generateToken(user);

    res.json({
      status: true,
      content: {
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        meta: {
          access_token: token
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ 
        message: 'Error signing in',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

// Get me route
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      status: true,
      content: {
        data: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          created_at: req.user.created_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ 
        message: 'Error fetching user details',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

module.exports = router; 