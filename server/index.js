const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plant');
const financialRoutes = require('./routes/financial');
const investorRoutes = require('./routes/investor');
const scadaRoutes = require('./routes/scada');
const { setupWebSocket } = require('./websocket');

// Choose database based on environment
let initializeDatabase;
if (process.env.DATABASE_URL) {
  // Production: Use PostgreSQL
  initializeDatabase = require('./database/init').initializeDatabase;
} else {
  // Local testing: Use SQLite
  initializeDatabase = require('./database/local').initializeLocalDatabase;
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet());

// CORS logging middleware
app.use((req, res, next) => {
  const origin = req.get('origin');
  console.log(`[CORS] Request from origin: ${origin}`);
  console.log(`[CORS] Allowed origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Mazi Green Energy API',
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite (Local)'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/plant', plantRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/scada', scadaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Mazi Green Energy API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`💾 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite (Local)'}`);
    });

    // Setup WebSocket for real-time updates
    setupWebSocket(server);
    console.log('🔌 WebSocket server initialized');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
