import express, { Router } from 'express';
import MemberController from '@controllers/v1/MemberController';
import validate from '@middlewares/v1/validate';
import auth from '@middlewares/v1/auth';
import Joi from 'joi';

const MemberRouter: Router = express.Router();

// Validation schemas
const addMemberSchema = Joi.object({
  community: Joi.number().required()
    .messages({
      'number.base': 'Community ID must be a number.',
      'any.required': 'Community ID is required.'
    }),
  user: Joi.number().required()
    .messages({
      'number.base': 'User ID must be a number.',
      'any.required': 'User ID is required.'
    }),
  role: Joi.number().required()
    .messages({
      'number.base': 'Role ID must be a number.',
      'any.required': 'Role ID is required.'
    }),
});

// Routes
MemberRouter.post('/', auth, validate(addMemberSchema), MemberController.addMember);
MemberRouter.delete('/:id', auth, MemberController.removeMember);

export default MemberRouter; 