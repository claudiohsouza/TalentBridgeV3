import express from 'express';
import { authMiddleware, checkRole } from './auth.js';
import { validate, recomendacaoSchema } from '../middleware/validator.js';
import { ForbiddenError, NotFoundError } from '../middleware/errorHandler.js';
import db from '../db-connect.js';

const router = express.Router();

// Listar recomendações
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, jovem_id, oportunidade_id, recomendador_id, recomendador_tipo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, 
             j.nome as jovem_nome, 
             j.email as jovem_email,
             j.formacao as jovem_formacao,
             j.idade as jovem_idade,
             o.titulo as oportunidade_titulo,
             CASE 
               WHEN r.recomendador_tipo = 'instituicao_ensino' THEN
                 (SELECT u.nome FROM instituicoes_ensino ie JOIN usuarios u ON ie.usuario_id = u.id WHERE ie.id = r.recomendador_id)
               WHEN r.recomendador_tipo = 'chefe_empresa' THEN
                 (SELECT u.nome FROM chefes_empresas ce JOIN usuarios u ON ce.usuario_id = u.id WHERE ce.id = r.recomendador_id)
             END as recomendador_nome
      FROM recomendacoes r
      JOIN jovens j ON r.jovem_id = j.id
      JOIN oportunidades o ON r.oportunidade_id = o.id
    `;

    const whereConditions = [];
    const params = [];

    if (status) {
      params.push(status);
      whereConditions.push(`r.status = $${params.length}`);
    }

    if (jovem_id) {
      params.push(jovem_id);
      whereConditions.push(`r.jovem_id = $${params.length}`);
    }

    if (oportunidade_id) {
      params.push(oportunidade_id);
      whereConditions.push(`r.oportunidade_id = $${params.length}`);
    }

    if (recomendador_id) {
      params.push(recomendador_id);
      whereConditions.push(`r.recomendador_id = $${params.length}`);
    }

    if (recomendador_tipo) {
      params.push(recomendador_tipo);
      whereConditions.push(`r.recomendador_tipo = $${params.length}`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await req.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Adicionar ordenação e paginação
    query += ` ORDER BY r.criado_em DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await req.db.query(query, params);

    res.json({
      data: result.rows,
      total
    });
  } catch (error) {
    console.error('[API-recomendacoes] Erro ao listar recomendações:', error);
    next(error);
  }
});

// Obter uma recomendação específica
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      `SELECT r.*, 
              j.nome as jovem_nome, 
              j.email as jovem_email,
              j.formacao as jovem_formacao,
              j.idade as jovem_idade,
              o.titulo as oportunidade_titulo,
              CASE 
                WHEN r.recomendador_tipo = 'instituicao_ensino' THEN
                  (SELECT u.nome FROM instituicoes_ensino ie JOIN usuarios u ON ie.usuario_id = u.id WHERE ie.id = r.recomendador_id)
                WHEN r.recomendador_tipo = 'chefe_empresa' THEN
                  (SELECT u.nome FROM chefes_empresas ce JOIN usuarios u ON ce.usuario_id = u.id WHERE ce.id = r.recomendador_id)
              END as recomendador_nome
       FROM recomendacoes r
       JOIN jovens j ON r.jovem_id = j.id
       JOIN oportunidades o ON r.oportunidade_id = o.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Recomendação não encontrada');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[API-recomendacoes] Erro ao obter recomendação:', error);
    next(error);
  }
});

// Criar nova recomendação
router.post('/', authMiddleware, checkRole(['chefe_empresa']), validate(recomendacaoSchema), async (req, res, next) => {
  try {
    const { jovem_id, oportunidade_id, justificativa } = req.body;
    
    // Verificar se o jovem existe
    const jovemExiste = await req.db.query('SELECT id FROM jovens WHERE id = $1', [jovem_id]);
    if (jovemExiste.rows.length === 0) {
      throw new NotFoundError('Jovem não encontrado');
    }
    
    // Verificar se a oportunidade existe
    const oportunidadeExiste = await req.db.query('SELECT id FROM oportunidades WHERE id = $1', [oportunidade_id]);
    if (oportunidadeExiste.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada');
    }
    
    // Determinar o tipo e id do recomendador
    let recomendadorTipo = req.user.papel;
    let recomendadorId;
    
    if (recomendadorTipo === 'instituicao_ensino') {
      const result = await req.db.query(
        'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Perfil de instituição não encontrado');
      }
      
      recomendadorId = result.rows[0].id;
      
      // Verificar se o jovem está vinculado a esta instituição
      const vinculo = await req.db.query(
        'SELECT id FROM jovens_instituicoes WHERE jovem_id = $1 AND instituicao_id = $2',
        [jovem_id, recomendadorId]
      );
      
      if (vinculo.rows.length === 0) {
        throw new ForbiddenError('Jovem não está vinculado a esta instituição');
      }
    } 
    else if (recomendadorTipo === 'chefe_empresa') {
      const result = await req.db.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Perfil de empresa não encontrado');
      }
      
      recomendadorId = result.rows[0].id;
    }
    
    // Verificar se já existe uma recomendação similar
    const recomendacaoExistente = await req.db.query(
      `SELECT id FROM recomendacoes 
       WHERE jovem_id = $1 
       AND oportunidade_id = $2 
       AND recomendador_id = $3 
       AND recomendador_tipo = $4`,
      [jovem_id, oportunidade_id, recomendadorId, recomendadorTipo]
    );
    
    if (recomendacaoExistente.rows.length > 0) {
      throw new ForbiddenError('Já existe uma recomendação para este jovem nesta oportunidade');
    }
    
    // Criar a recomendação
    const result = await req.db.query(
      `INSERT INTO recomendacoes (
        jovem_id, oportunidade_id, recomendador_id, 
        recomendador_tipo, justificativa, status
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [jovem_id, oportunidade_id, recomendadorId, recomendadorTipo, justificativa, 'pendente']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[API-recomendacoes] Erro ao criar recomendação:', error);
    next(error);
  }
});

// Atualizar status da recomendação
router.patch('/:id/status', authMiddleware, checkRole(['instituicao_contratante']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Verificar se a recomendação existe
    const recomendacaoExiste = await req.db.query(
      'SELECT * FROM recomendacoes WHERE id = $1',
      [id]
    );
    
    if (recomendacaoExiste.rows.length === 0) {
      throw new NotFoundError('Recomendação não encontrada');
    }
    
    // Verificar se o usuário tem permissão para atualizar o status
    const oportunidade = await req.db.query(
      `SELECT o.instituicao_id 
       FROM oportunidades o 
       JOIN recomendacoes r ON r.oportunidade_id = o.id 
       WHERE r.id = $1`,
      [id]
    );
    
    if (oportunidade.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada');
    }
    
    const instituicao = await req.db.query(
      'SELECT id FROM instituicoes_contratantes WHERE usuario_id = $1',
      [req.user.id]
    );
    
    if (instituicao.rows.length === 0 || instituicao.rows[0].id !== oportunidade.rows[0].instituicao_id) {
      throw new ForbiddenError('Você não tem permissão para atualizar esta recomendação');
    }
    
    // Atualizar o status
    const result = await req.db.query(
      'UPDATE recomendacoes SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[API-recomendacoes] Erro ao atualizar status da recomendação:', error);
    next(error);
  }
});

export default router; 