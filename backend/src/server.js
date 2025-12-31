import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import progressRoutes from './routes/progress.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import courseRoutes from './routes/course.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8006;
export const prisma = new PrismaClient();

// Get root directory (two levels up from backend/src)
const rootDir = path.resolve(__dirname, '../..');

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for frontend
}));
app.use(cors({
  origin: '*', // Allow all origins for static files
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images, etc.) from root directory
app.use(express.static(rootDir, {
  extensions: ['html', 'htm'],
  index: ['index.html', 'index.htm']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      database: 'postgresql',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler - Check if it's an API route or static file
app.use('*', (req, res) => {
  // If it's an API route, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  }
  
  // Otherwise, try to serve index.html for SPA routing
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`✅ SEBS Global Backend API running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
});

export { app };

