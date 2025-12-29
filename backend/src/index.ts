import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { testConnection } from './config/database';
import { initializeDatabase } from './config/initDatabase';
import { seedDatabase } from './config/seed';
import { errorHandler, notFound } from './middleware/errorHandler';
import { UserModel } from './models/User';
import { JobModel } from './models/Job';
import { ResumeModel } from './models/Resume';

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import adminRoutes from './routes/admin';
import resumeRoutes from './routes/resume';
import favoritesRoutes from './routes/favorites';
import applicationRoutes from './routes/applications';
import notificationRoutes from './routes/notifications';
import chatRoutes from './routes/chat';
import { resumeController } from './controllers/resumeController';
import path from 'path';

const app = express();

// Debug route
app.get('/api/debug-db', (req, res) => {
  res.json({
    cwd: process.cwd(),
    execPath: process.execPath,
    __dirname: __dirname,
    dbPath: 'PostgreSQL'
  });
});

// Initialize database
initializeDatabase();
// Seed database with test data if empty
seedDatabase();

// Test database connection
testConnection();

// Security middleware
app.use(helmet());

// Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    ip: req.ip
  });
  next();
});

// CORS - permissive for development
app.use(cors({
  origin: true, // Allow any origin
  credentials: true, // Allow cookies
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

import { socketManager } from './socket';
import { searchManager } from './services/SearchManager';
import { createServer } from 'http';

const server = createServer(app);

// Initialize Socket.IO
socketManager.init(server);

// Initialize Search Engine
searchManager.initialize();

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log('💾 Using PostgreSQL database');
});

export default app;
