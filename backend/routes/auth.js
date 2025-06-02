import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate, loginSchema, registroSchema } from '../middleware/validator.js';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler.js';
import config from '../config/config.js';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware de autenticação (JWT)
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new AuthenticationError('Token não fornecido');
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Token inválido');
    }
    
    const jwtSecret = config.security.jwtSecret;
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AuthenticationError('Token inválido'));
  }
};

// Middleware para verificar o papel do usuário
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuário não autenticado'));
    }
    
    if (!roles.includes(req.user.papel)) {
      return next(new AuthenticationError('Acesso não autorizado para este papel'));
    }
    
    next();
  };
};

// Rota de login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const pool = req.db;

    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      throw new AuthenticationError('Usuário não encontrado');
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    const jwtSecret = config.security.jwtSecret;
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, papel: usuario.papel, nome: usuario.nome },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    // Consultar informações específicas do perfil com base no papel
    let dadosAdicionais = null;
    if (usuario.papel === 'instituicao_ensino') {
      const result = await pool.query(
        'SELECT * FROM instituicoes_ensino WHERE usuario_id = $1',
        [usuario.id]
      );
      if (result.rows.length > 0) {
        dadosAdicionais = result.rows[0];
      }
    } else if (usuario.papel === 'chefe_empresa') {
      const result = await pool.query(
        'SELECT * FROM chefes_empresas WHERE usuario_id = $1',
        [usuario.id]
      );
      if (result.rows.length > 0) {
        dadosAdicionais = result.rows[0];
      }
    } else if (usuario.papel === 'instituicao_contratante') {
      const result = await pool.query(
        'SELECT * FROM instituicoes_contratantes WHERE usuario_id = $1',
        [usuario.id]
      );
      if (result.rows.length > 0) {
        dadosAdicionais = result.rows[0];
      }
    }

    res.json({ 
      token,
      papel: usuario.papel,
      usuario: { 
        id: usuario.id, 
        email: usuario.email, 
        papel: usuario.papel,
        nome: usuario.nome,
        perfil: dadosAdicionais
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota de registro
router.post('/registro', validate(registroSchema), async (req, res, next) => {
  try {
    console.log('[Registro] Iniciando registro com dados:', JSON.stringify(req.body, null, 2));
    
    const { email, senha, nome, papel, localizacao, dadosPerfil } = req.body;
    const pool = req.db;

    // Verificar se o email já está em uso
    const emailExists = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (emailExists.rows.length > 0) {
      console.log('[Registro] Email já em uso:', email);
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);
    console.log('[Registro] Senha hasheada com sucesso');

    // Iniciar transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('[Registro] Transação iniciada');

      // Inserir usuário
      const usuarioResult = await client.query(
        'INSERT INTO usuarios (email, senha, nome, papel) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, senha_hash, nome, papel]
      );
      const usuarioId = usuarioResult.rows[0].id;
      console.log('[Registro] Usuário criado com ID:', usuarioId);

      // Inserir dados específicos do perfil
      if (papel === 'instituicao_ensino') {
        console.log('[Registro] Inserindo dados de instituição de ensino');
        await client.query(
          'INSERT INTO instituicoes_ensino (usuario_id, tipo, nome, localizacao, qtd_alunos, areas_ensino) VALUES ($1, $2, $3, $4, $5, $6)',
          [usuarioId, dadosPerfil.tipo, nome, localizacao, dadosPerfil.qtd_alunos, dadosPerfil.areas_ensino || []]
        );
      } else if (papel === 'chefe_empresa') {
        console.log('[Registro] Inserindo dados de chefe de empresa');
        await client.query(
          'INSERT INTO chefes_empresas (usuario_id, empresa, setor, porte, cargo, localizacao, areas_atuacao) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [usuarioId, dadosPerfil.empresa, dadosPerfil.setor, dadosPerfil.porte, dadosPerfil.cargo, localizacao, dadosPerfil.areas_atuacao]
        );
        console.log('[Registro] Dados do chefe de empresa inseridos com sucesso');
      } else if (papel === 'instituicao_contratante') {
        console.log('[Registro] Inserindo dados de instituição contratante');
        await client.query(
          'INSERT INTO instituicoes_contratantes (usuario_id, tipo, nome, localizacao, areas_interesse, programas_sociais) VALUES ($1, $2, $3, $4, $5, $6)',
          [usuarioId, dadosPerfil.tipo, nome, localizacao, dadosPerfil.areas_interesse, dadosPerfil.programas_sociais]
        );
        console.log('[Registro] Dados da instituição contratante inseridos com sucesso');
      }

      await client.query('COMMIT');
      console.log('[Registro] Transação concluída com sucesso');

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuarioId, email, papel },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('[Registro] Token JWT gerado');

      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        usuario: {
          id: usuarioId,
          email,
          nome,
          papel,
          localizacao
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Registro] Erro na transação:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Registro] Erro no registro:', err);
    next(err);
  }
});

// Rota para verificar token
router.get('/verificar', authMiddleware, (req, res) => {
  res.json({
    usuario: req.user,
    valido: true
  });
});

export default router; 