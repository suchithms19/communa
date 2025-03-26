import express, { Router } from 'express';
import AuthController from '../../controllers/v1/AuthController';
import validate from '../../middlewares/v1/validate';
import auth from '../../middlewares/v1/auth';
import Joi from 'joi';

const AuthRouter: Router = express.Router();

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
  password: Joi.string().min(2).required()
    .messages({
      'string.min': 'Password should be at least 2 characters.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    })
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
    })
});

// Routes
AuthRouter.post('/signup', validate(signupSchema), AuthController.signup);
AuthRouter.post('/signin', validate(signinSchema), AuthController.signin);
AuthRouter.get('/me', auth, AuthController.getMe);

export default AuthRouter; 