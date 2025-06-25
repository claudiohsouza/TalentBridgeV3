import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Importações locais
import config from './config/config.js';
import logger, { stream } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { responseHandler } from './middleware/responseHandler.js';
import { messages } from './config/messages.js';
import db from './db-connect.js';

// Import routes
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import jovensRoutes from './routes/jovens.js';
import oportunidadesRoutes from './routes/oportunidades.js';
import opcoesRoutes from './routes/opcoes.js';
import avaliacoesRoutes from './routes/avaliacoes.js';
import recomendacoesRoutes from './routes/recomendacoes.js';
import statsRoutes from './routes/stats.js';

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseHandler);

// Set charset for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Security configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors(config.cors));

// Rate limiter
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: messages.system.tooManyRequests
  }
});

if (config.server.nodeEnv === 'production') {
  app.use(limiter);
}

// HTTP request logger
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev', { stream }));
} else {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(config.logging.logDir, 'access.log'), { flags: 'a' })
  }));
}

// Database connection test
db.testarConexao()
  .then(success => {
    if (success) {
      logger.info('Database connection validated successfully');
    } else {
      logger.error('Failed to validate database connection');
    }
  })
  .catch(err => {
    logger.error('Critical database connection error', { error: err.message });
  });

// Expose database connection
app.locals.db = db.pool;

// Inject database pool and utils into request object
app.use((req, res, next) => {
  req.db = db.pool;
  req.dbUtils = db;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/jovens', jovensRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);
app.use('/api/opcoes', opcoesRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/recomendacoes', recomendacoesRoutes);
app.use('/api/stats', statsRoutes);

// Default route
app.get('/', (req, res) => {
  res.success(null, messages.system.apiWorking);
});

// Allow pre-flight requests
app.options('*', cors(config.cors));

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
  logger.info(`Environment: ${config.server.nodeEnv}`);
  logger.info(`CORS allowing origin: ${JSON.stringify(config.cors.allowedOrigins)}`);
});

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', { error: err.message, stack: err.stack });
  
  server.close(() => {
    logger.error('Server closed due to unhandled rejection');
    process.exit(1);
  });
});

export default app;