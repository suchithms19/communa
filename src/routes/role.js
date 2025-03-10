const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Role = require('../models/Role');

// Validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.'
    }),
});

// Create role
router.post('/', auth, validate(createRoleSchema), async (req, res) => {
  try {
    const { name } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        status: false,
        errors: [{ 
          param: 'name',
          message: 'Role with this name already exists.',
          code: 'RESOURCE_EXISTS'
        }]
      });
    }

    // Create role
    const role = new Role({ name });
    await role.save();

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: role._id,
          name: role.name,
          created_at: role.created_at,
          updated_at: role.updated_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ 
        message: 'Error creating role',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

// Get all roles
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const roles = await Role.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Role.countDocuments();

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: roles.map(role => ({
          id: role._id,
          name: role.name,
          created_at: role.created_at,
          updated_at: role.updated_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ 
        message: 'Error fetching roles',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

module.exports = router; 