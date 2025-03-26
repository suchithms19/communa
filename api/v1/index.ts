import express, { Router } from 'express';
import AuthRouter from './AuthRouter';
import CommunityRouter from './CommunityRouter';
import MemberRouter from './MemberRouter';
import RoleRouter from './RoleRouter';

const apiRouter: Router = express.Router();

// Register all routes
apiRouter.use('/auth', AuthRouter);
apiRouter.use('/community', CommunityRouter);
apiRouter.use('/member', MemberRouter);
apiRouter.use('/role', RoleRouter);

export default apiRouter; 