import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const auth = async (req, res, next) => {
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

export default auth; 