import express from 'express';
import { initializeRoles } from "@loaders/v1/roles";
import apiRoutes from '@api/v1';
import FrameworkLoader from '@loaders/v1/framework';
import Logger from '@universe/v1/libraries/logger';
import Env from '@loaders/v1/Env';
import Database from '@loaders/v1/database';

const server = async(): Promise<express.Application> =>{
    const app = express();

    // Middleware
    Env.Loader();
    Logger.Loader();
    FrameworkLoader(app);
    await Database.Loader();

    // Initialize roles
    initializeRoles();

    // Routes
    app.use('/v1', apiRoutes);

    return app;
}

export default server;