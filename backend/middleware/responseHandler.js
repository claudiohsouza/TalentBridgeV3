import { messages } from '../config/messages.js';

export class ApiResponse {
  static success(data = null, message = 'Success') {
    return {
      status: 'success',
      message,
      data
    };
  }

  static error(message = messages.system.serverError, code = 500, errors = null) {
    return {
      status: 'error',
      message,
      code,
      errors
    };
  }

  static validationError(errors) {
    return {
      status: 'error',
      message: messages.validation.invalidData,
      code: 400,
      errors
    };
  }

  static notFound(message = messages.user.userNotFound) {
    return {
      status: 'error',
      message,
      code: 404
    };
  }

  static unauthorized(message = messages.auth.unauthorized) {
    return {
      status: 'error',
      message,
      code: 401
    };
  }
}

// Middleware to standardize response format
export const responseHandler = (req, res, next) => {
  // Add response methods to res object
  res.success = (data, message) => {
    return res.json(ApiResponse.success(data, message));
  };

  res.error = (message, code, errors) => {
    return res.status(code || 500).json(ApiResponse.error(message, code, errors));
  };

  res.validationError = (errors) => {
    return res.status(400).json(ApiResponse.validationError(errors));
  };

  res.notFound = (message) => {
    return res.status(404).json(ApiResponse.notFound(message));
  };

  res.unauthorized = (message) => {
    return res.status(401).json(ApiResponse.unauthorized(message));
  };

  next();
}; 