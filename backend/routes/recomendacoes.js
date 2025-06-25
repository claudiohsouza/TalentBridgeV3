import express from 'express';
import { authMiddleware, checkRole } from '../middleware/auth.js';
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

    res.success({
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

    res.success(result.rows[0]);
  } catch (error) {
    console.error('[API-recomendacoes] Erro ao obter recomendação:', error);
    next(error);
  }
});

// Criar nova recomendação
router.post('/', authMiddleware, checkRole(['chefe_empresa']), validate(recomendacaoSchema), async (req, res, next) => {
  try {
    const { jovem_id, oportunidade_id, justificativa } = req.body;
    
    console.log('[API-recomendacoes] Criando recomendação:', {
      jovem_id,
      oportunidade_id,
      recomendador_tipo: req.user.papel,
      recomendador_id: req.user.id
    });
    
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
    
    if (recomendadorTipo === 'chefe_empresa') {
      const result = await req.db.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Perfil de empresa não encontrado');
      }
      
      recomendadorId = result.rows[0].id;
      
      // Verificar se o jovem está vinculado a esta empresa
      const vinculo = await req.db.query(
        'SELECT id FROM jovens_chefes_empresas WHERE jovem_id = $1 AND chefe_empresa_id = $2',
        [jovem_id, recomendadorId]
      );
      
      if (vinculo.rows.length === 0) {
        throw new ForbiddenError('Jovem não está vinculado a esta empresa');
      }
    } else {
      throw new ForbiddenError('Apenas chefes de empresa podem fazer recomendações');
    }
    
    // Verificar se já existe uma recomendação similar (validação adicional)
    const recomendacaoExistente = await req.db.query(
      `SELECT id, status FROM recomendacoes 
       WHERE jovem_id = $1 
       AND oportunidade_id = $2 
       AND recomendador_tipo = $3 
       AND recomendador_id = $4`,
      [jovem_id, oportunidade_id, recomendadorTipo, recomendadorId]
    );
    
    if (recomendacaoExistente.rows.length > 0) {
      const recomendacao = recomendacaoExistente.rows[0];
      if (recomendacao.status === 'cancelado') {
        // Se a recomendação foi cancelada, permitir uma nova
        console.log('[API-recomendacoes] Recomendação cancelada encontrada, permitindo nova recomendação');
      } else {
        throw new ForbiddenError('Você já recomendou este jovem para esta oportunidade');
      }
    }
    
    // Criar a recomendação
    const result = await req.db.query(
      `INSERT INTO recomendacoes (
        jovem_id, oportunidade_id, recomendador_id, 
        recomendador_tipo, justificativa, status
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [jovem_id, oportunidade_id, recomendadorId, recomendadorTipo, justificativa, 'pendente']
    );
    
    console.log('[API-recomendacoes] Recomendação criada com sucesso:', result.rows[0].id);
    
    res.success({
      message: 'Recomendação realizada com sucesso',
      recomendacao: result.rows[0]
    }, 201);
  } catch (error) {
    console.error('[API-recomendacoes] Erro ao criar recomendação:', error);
    next(error);
  }
});

// Atualizar status de uma recomendação
router.put('/:id/status', authMiddleware, checkRole(['instituicao_contratante']), async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await db.pool.connect();

  try {
    // Validação do status de entrada
    const statusesValidos = ['em_processo', 'contratado', 'rejeitado'];
    if (!status || !statusesValidos.includes(status)) {
      return res.error('Status inválido ou não fornecido', 400);
    }

    await client.query('BEGIN');

    // 1. Obter a recomendação e os IDs principais
    const recomendacaoQuery = await client.query('SELECT jovem_id, oportunidade_id FROM recomendacoes WHERE id = $1 FOR UPDATE', [id]);
    if (recomendacaoQuery.rows.length === 0) {
      throw new NotFoundError('Recomendação não encontrada');
    }
    const { jovem_id, oportunidade_id } = recomendacaoQuery.rows[0];
    
    // 2. Atualizar o status da recomendação principal
    const updateResult = await client.query(
      'UPDATE recomendacoes SET status = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    console.log(`[Recomendação] Status da recomendação ${id} atualizado para '${status}'.`);


    // 3. Lógica de Contratação
    if (status === 'contratado') {
      console.log(`[Contratação] Iniciando processo de contratação para o jovem ${jovem_id} na oportunidade ${oportunidade_id}.`);

      // 3.1. Atualizar o status global do jovem para 'contratado'
      await client.query(
        "UPDATE jovens SET status = 'contratado' WHERE id = $1",
        [jovem_id]
      );
      console.log(`[Contratação] Status do jovem ${jovem_id} atualizado para 'contratado'.`);

      // 3.2. Cancelar todas as OUTRAS recomendações ativas para o jovem contratado
      await client.query(
        "UPDATE recomendacoes SET status = 'cancelado' WHERE jovem_id = $1 AND status IN ('pendente', 'em_processo')",
        [jovem_id]
      );
      console.log(`[Contratação] Outras recomendações para o jovem ${jovem_id} foram canceladas.`);

      // 3.3. Incrementar vagas preenchidas e verificar se a oportunidade está lotada
      const oportunidadeResult = await client.query(
        `UPDATE oportunidades 
         SET vagas_preenchidas = vagas_preenchidas + 1
         WHERE id = $1 
         RETURNING vagas_preenchidas, vagas_disponiveis`,
        [oportunidade_id]
      );
      const { vagas_preenchidas, vagas_disponiveis } = oportunidadeResult.rows[0];
      console.log(`[Contratação] Vaga ${oportunidade_id} teve vagas preenchidas incrementado para ${vagas_preenchidas}.`);

      // 3.4. Se a oportunidade estiver lotada, rejeitar outras recomendações
      if (vagas_preenchidas >= vagas_disponiveis) {
        console.log(`[Contratação] Vaga ${oportunidade_id} está lotada. Rejeitando outras recomendações.`);
        await client.query(
          "UPDATE recomendacoes SET status = 'rejeitado' WHERE oportunidade_id = $1 AND status IN ('pendente', 'em_processo')",
          [oportunidade_id]
        );
         // Opcional: Mudar status da oportunidade para 'fechada' ou 'cancelado'
        await client.query(
          "UPDATE oportunidades SET status = 'cancelado' WHERE id = $1",
          [oportunidade_id]
        );
        console.log(`[Contratação] Status da oportunidade ${oportunidade_id} atualizado para 'cancelado'.`);
      }
    }

    await client.query('COMMIT');

    res.success({
      message: 'Status da recomendação atualizado com sucesso',
      recomendacao: updateResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[API-recomendacoes] Erro ao atualizar status:', error);
    next(error);
  } finally {
    client.release();
  }
});

export default router; 