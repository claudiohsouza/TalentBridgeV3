import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, config.security.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }
    if (!allowedRoles.includes(req.user.papel)) {
      return res.status(403).json({ erro: 'Acesso não autorizado' });
    }
    next();
  };
}; 