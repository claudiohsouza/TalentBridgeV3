import logger from '../config/logger.js';

// Classe base para erros da aplicação
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

// Erro de validação
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
  }
}

// Erro de autenticação
export class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
  }
}

export class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

// Handler de erro 404
export const notFoundHandler = (req, res, next) => {
  const error = new AppError('Rota não encontrada', 404);
  next(error);
};

// Handler de erro global
export const errorHandler = (err, req, res, next) => {
  logger.error('Erro na aplicação:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const response = {
    status: 'error',
    message: err.message
  };

  if (err instanceof ValidationError && err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}; 