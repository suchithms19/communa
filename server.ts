import express from 'express';
import { initializeRoles } from "./loaders/v1/roles";
import authRoutes from './src/routes/auth';
import communityRoutes from './src/routes/community';
import memberRoutes from './src/routes/member';
import roleRoutes from './src/routes/role';
import FrameworkLoader from './loaders/v1/framework';
import Logger from './universe/v1/libraries/logger';

const server = async(): Promise<express.Application> =>{
    const app = express();

    // Middleware
    Logger.Loader();
    FrameworkLoader(app);

    // Initialize roles
    initializeRoles();

    // Routes
    app.use('/v1/auth', authRoutes);
    app.use('/v1/community', communityRoutes);
    app.use('/v1/member', memberRoutes);
    app.use('/v1/role', roleRoutes);

    return app;
}

export default server;