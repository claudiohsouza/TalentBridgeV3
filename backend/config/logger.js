import winston from 'winston';
import path from 'path';
import config from './config.js';

// Criar diretório de logs se não existir
import fs from 'fs';
if (!fs.existsSync(config.logging.logDir)) {
  fs.mkdirSync(config.logging.logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    // Console transport para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport para todos os logs
    new winston.transports.File({
      filename: path.join(config.logging.logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport para erros
    new winston.transports.File({
      filename: path.join(config.logging.logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Criar um stream para o Morgan
export const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger; 