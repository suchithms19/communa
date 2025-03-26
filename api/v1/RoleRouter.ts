import express, { Router } from 'express';
import RoleController from '../../controllers/v1/RoleController';
import validate from '../../middlewares/v1/validate';
import auth from '../../middlewares/v1/auth';
import Joi from 'joi';

const RoleRouter: Router = express.Router();

// Validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.',
    }),
});

// Routes
RoleRouter.post('/', auth, validate(createRoleSchema), RoleController.createRole);
RoleRouter.get('/', RoleController.getAllRoles);

export default RoleRouter; 