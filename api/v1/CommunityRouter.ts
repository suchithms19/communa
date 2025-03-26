import express, { Router } from 'express';
import CommunityController from '../../controllers/v1/CommunityController';
import validate from '../../middlewares/v1/validate';
import auth from '../../middlewares/v1/auth';
import Joi from 'joi';

const CommunityRouter: Router = express.Router();

// Validation schemas
const createCommunitySchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.'
    }),
});

// Routes
CommunityRouter.post('/', auth, validate(createCommunitySchema), CommunityController.createCommunity);
CommunityRouter.get('/', CommunityController.getAllCommunities);
CommunityRouter.get('/me/owner', auth, CommunityController.getMyCommunities);
CommunityRouter.get('/me/member', auth, CommunityController.getMyMemberships);

export default CommunityRouter; 