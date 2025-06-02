import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

// Validar variáveis de ambiente críticas
const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingEnvVars.join(', ')}`);
}

const config = {
  // Configurações do Servidor
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Configurações do Banco de Dados
  database: {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432
  },

  // Configurações de Segurança
  security: {
    jwtSecret: process.env.JWT_SECRET,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    }
  },

  // Configurações de Log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logDir: path.join(process.cwd(), 'logs')
  },

  // Configurações de CORS
  cors: {
    allowedOrigins: process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

export default config; 