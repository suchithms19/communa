import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import prisma from './config/prisma';
import { initializeRoles } from './config/roles';
import authRoutes from './routes/auth';
import communityRoutes from './routes/community';
import memberRoutes from './routes/member';
import roleRoutes from './routes/role';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize roles
initializeRoles();

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/community', communityRoutes);
app.use('/v1/member', memberRoutes);
app.use('/v1/role', roleRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: false,
    errors: [{ message: err.message || 'Internal server error' }]
  });
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
