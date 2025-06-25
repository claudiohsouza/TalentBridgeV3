import express from 'express';
import bcrypt from 'bcrypt';
import { authMiddleware } from './auth.js';
import { validate, atualizacaoUsuarioSchema } from '../middleware/validator.js';
import { ValidationError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

const router = express.Router();

// Obter perfil do usuário autenticado
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-usuarios] Recebida solicitação para obter perfil do usuário:', req.user.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-usuarios] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    
    const { id } = req.user;
    
    // Buscar dados básicos do usuário, incluindo nome
    const result = await pool.query(
      'SELECT id, nome, email, papel, verificado, criado_em, atualizado_em FROM usuarios WHERE id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    const usuario = result.rows[0];
    let perfil = null;
    // Buscar dados específicos do perfil conforme o papel
    if (usuario.papel === 'instituicao_ensino') {
      const r = await pool.query('SELECT * FROM instituicoes_ensino WHERE usuario_id = $1', [id]);
      perfil = r.rows[0] || null;
    } else if (usuario.papel === 'chefe_empresa') {
      const r = await pool.query('SELECT * FROM chefes_empresas WHERE usuario_id = $1', [id]);
      perfil = r.rows[0] || null;
    } else if (usuario.papel === 'instituicao_contratante') {
      const r = await pool.query('SELECT * FROM instituicoes_contratantes WHERE usuario_id = $1', [id]);
      perfil = r.rows[0] || null;
    }
    
    res.json({ ...usuario, perfil });
  } catch (error) {
    next(error);
  }
});

// Atualizar perfil do usuário autenticado
router.put('/me', authMiddleware, validate(atualizacaoUsuarioSchema), async (req, res, next) => {
  try {
    console.log('[API-usuarios] Recebida solicitação para atualizar perfil do usuário:', req.user.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-usuarios] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    
    const { id } = req.user;
    const { nome, email, senhaAtual, novaSenha, ...perfilData } = req.body;
    
    // Buscar dados atuais do usuário
    const usuarioAtual = await pool.query(
      'SELECT email, senha FROM usuarios WHERE id = $1', 
      [id]
    );
    
    if (usuarioAtual.rows.length === 0) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    // Verificar senha atual se tentar mudar email ou senha
    if (senhaAtual) {
      const senhaValida = await bcrypt.compare(senhaAtual, usuarioAtual.rows[0].senha);
      if (!senhaValida) {
        throw new ValidationError('Senha atual incorreta');
      }
    }
    
    let alteracoes = [];
    let params = [];
    
    // Atualizar nome se fornecido
    if (nome) {
      alteracoes.push(`nome = $${params.length + 1}`);
      params.push(nome);
    }
    
    // Atualizar email se fornecido
    if (email && email !== usuarioAtual.rows[0].email) {
      // Verificar se o novo email já está em uso
      const emailExistente = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2', 
        [email, id]
      );
      
      if (emailExistente.rows.length > 0) {
        throw new ValidationError('Este email já está em uso');
      }
      
      alteracoes.push(`email = $${params.length + 1}`);
      params.push(email);
    }
    
    // Atualizar senha se fornecida
    if (novaSenha) {
      const senhaHash = await bcrypt.hash(novaSenha, 12);
      alteracoes.push(`senha = $${params.length + 1}`);
      params.push(senhaHash);
    }
    
    // Atualização da data
    alteracoes.push(`atualizado_em = NOW()`);
    
    // Iniciar transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Atualizar usuário se houver alterações
      if (params.length > 0) {
        params.push(id);
        const query = `
          UPDATE usuarios 
          SET ${alteracoes.join(', ')} 
          WHERE id = $${params.length} 
          RETURNING id, email, nome, papel, verificado, criado_em, atualizado_em
        `;
        
        const result = await client.query(query, params);
        var usuarioAtualizado = result.rows[0];
      }
      
      // Atualizar perfil específico baseado no papel
      if (Object.keys(perfilData).length > 0) {
        let perfilQuery;
        let perfilParams = [];
        
        if (req.user.papel === 'instituicao_ensino') {
          const { tipo, localizacao, areas_ensino, qtd_alunos } = perfilData;
          perfilParams = [tipo, nome, localizacao, areas_ensino, qtd_alunos, id];
          perfilQuery = `
            UPDATE instituicoes_ensino 
            SET tipo = $1, nome = $2, localizacao = $3, areas_ensino = $4, qtd_alunos = $5, atualizado_em = NOW()
            WHERE usuario_id = $6
            RETURNING *
          `;
        } else if (req.user.papel === 'chefe_empresa') {
          const { empresa, setor, porte, localizacao, areas_atuacao } = perfilData;
          perfilParams = [empresa, setor, porte, localizacao, areas_atuacao, id];
          perfilQuery = `
            UPDATE chefes_empresas 
            SET empresa = $1, setor = $2, porte = $3, localizacao = $4, areas_atuacao = $5, atualizado_em = NOW()
            WHERE usuario_id = $6
            RETURNING *
          `;
        } else if (req.user.papel === 'instituicao_contratante') {
          const { tipo, localizacao, areas_interesse, programas_sociais } = perfilData;
          perfilParams = [tipo, localizacao, areas_interesse, programas_sociais, id];
          perfilQuery = `
            UPDATE instituicoes_contratantes 
            SET tipo = $1, localizacao = $2, areas_interesse = $3, programas_sociais = $4, atualizado_em = NOW()
            WHERE usuario_id = $5
            RETURNING *
          `;
        }
        
        if (perfilQuery) {
          const perfilResult = await client.query(perfilQuery, perfilParams);
          if (perfilResult.rows[0]) {
            usuarioAtualizado = {
              ...usuarioAtualizado,
              perfil: perfilResult.rows[0]
            };
          }
        }
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: 'Perfil atualizado com sucesso',
        usuario: usuarioAtualizado
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Rota específica para alteração de senha
router.put('/alterar-senha', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-usuarios] Recebida solicitação para alterar senha');
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-usuarios] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    
    const { id } = req.user;
    const { senhaAtual, novaSenha } = req.body;
    
    if (!senhaAtual || !novaSenha) {
      throw new ValidationError('Senha atual e nova senha são obrigatórias');
    }
    
    // Buscar dados atuais do usuário
    const usuarioAtual = await pool.query(
      'SELECT senha FROM usuarios WHERE id = $1', 
      [id]
    );
    
    if (usuarioAtual.rows.length === 0) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuarioAtual.rows[0].senha);
    if (!senhaValida) {
      throw new ValidationError('Senha atual incorreta');
    }
    
    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 12);
    
    // Atualizar senha
    await pool.query(
      'UPDATE usuarios SET senha = $1, atualizado_em = NOW() WHERE id = $2',
      [senhaHash, id]
    );
    
    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Rota para enviar contato
router.post('/contato', authMiddleware, async (req, res, next) => {
  try {
    const { jovem_id, assunto, mensagem, tipo_contato } = req.body;
    const pool = req.db;

    // Verificar se o usuário é uma instituição contratante
    if (req.user.papel !== 'instituicao_contratante') {
      return res.status(403).json({ 
        message: 'Apenas instituições contratantes podem enviar contatos' 
      });
    }

    // Verificar se o jovem existe
    const jovemResult = await pool.query(
      'SELECT id, nome, email FROM jovens WHERE id = $1',
      [jovem_id]
    );

    if (jovemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    const jovem = jovemResult.rows[0];

    // Buscar dados da instituição contratante
    const instituicaoResult = await pool.query(
      'SELECT * FROM instituicoes_contratantes WHERE usuario_id = $1',
      [req.user.id]
    );

    if (instituicaoResult.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de instituição não encontrado' });
    }

    const instituicao = instituicaoResult.rows[0];

    // Registrar o contato no banco de dados
    const contatoResult = await pool.query(
      `INSERT INTO contatos (
        jovem_id, 
        instituicao_id, 
        assunto, 
        mensagem, 
        tipo_contato, 
        status,
        criado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [
        jovem_id,
        instituicao.id,
        assunto,
        mensagem,
        tipo_contato || 'email',
        'enviado'
      ]
    );

    // Log do contato para demonstração
    console.log('Contato registrado:', {
      de: req.user.email,
      para: jovem.email,
      assunto,
      mensagem,
      tipo_contato,
      data: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Contato enviado com sucesso',
      contato: contatoResult.rows[0]
    });

  } catch (error) {
    console.error('Erro ao enviar contato:', error);
    next(error);
  }
});

// Rota para listar contatos de uma instituição
router.get('/contatos', authMiddleware, async (req, res, next) => {
  try {
    const pool = req.db;

    // Verificar se o usuário é uma instituição contratante
    if (req.user.papel !== 'instituicao_contratante') {
      return res.status(403).json({ 
        message: 'Apenas instituições contratantes podem visualizar contatos' 
      });
    }

    // Buscar ID da instituição
    const instituicaoResult = await pool.query(
      'SELECT id FROM instituicoes_contratantes WHERE usuario_id = $1',
      [req.user.id]
    );

    if (instituicaoResult.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de instituição não encontrado' });
    }

    const instituicaoId = instituicaoResult.rows[0].id;

    // Buscar contatos
    const contatosResult = await pool.query(
      `SELECT 
        c.id,
        c.assunto,
        c.mensagem,
        c.tipo_contato,
        c.status,
        c.criado_em,
        j.nome as jovem_nome,
        j.email as jovem_email
       FROM contatos c
       JOIN jovens j ON c.jovem_id = j.id
       WHERE c.instituicao_id = $1
       ORDER BY c.criado_em DESC`,
      [instituicaoId]
    );

    res.json(contatosResult.rows);

  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    next(error);
  }
});

export default router; 