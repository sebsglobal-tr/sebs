import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './lib/prisma.js';
import userRoutes from './routes/user.routes.js';
import progressRoutes from './routes/progress.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import courseRoutes from './routes/course.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import adminRoutes from './routes/admin.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import { createRequire } from 'module';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 8006;
export { prisma };

const rootDir = path.resolve(__dirname, '../..');

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

app.use(express.static(rootDir, {
  extensions: ['html', 'htm'],
  index: ['index.html', 'index.htm']
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

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

app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/evaluation', evaluationRoutes);

/* ── Iyzico Payment Routes ─────────────────────────────── */
import { authenticateSupabase } from './middleware/supabase-auth.middleware.js';
try {
  const { getPaymentPool } = _require('./lib/payment-pool.cjs');
  const { registerIyzicoPaymentRoutes } = _require('./routes/iyzico-payments.cjs');
  const paymentPool = getPaymentPool();
  registerIyzicoPaymentRoutes(app, { pool: paymentPool, authenticateToken: authenticateSupabase });
  console.log('✅ Iyzico payment routes registered');
} catch (err) {
  console.warn('⚠️ Iyzico payment routes skipped:', err.message);
}

app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  }
  
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ SEBS Global Backend API running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});

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

