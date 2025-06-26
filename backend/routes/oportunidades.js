import express from 'express';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { validate, oportunidadeSchema } from '../middleware/validator.js';
import { ForbiddenError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// Listar todas as oportunidades
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para listar oportunidades');
    console.log('[API-oportunidades] Usuário:', req.user.id, req.user.email, req.user.papel);
    
    const pool = req.db;
    
    // Consultar filtros
    const { status, tipo, data_inicio, data_fim, termo } = req.query;
    
    // Base da query com aliases corretos e contagem de recomendações
    let query = `
      SELECT o.*, 
             ce.empresa as empresa_nome,
             u.nome as empresa_representante,
             (SELECT COUNT(*) FROM recomendacoes r WHERE r.oportunidade_id = o.id) as total_recomendacoes
      FROM oportunidades o
      JOIN chefes_empresas ce ON o.empresa_id = ce.id
      JOIN usuarios u ON ce.usuario_id = u.id
    `;
    
    // Construir cláusulas WHERE
    const whereConditions = [];
    const params = [];
    
    // FILTRO POR EMPRESA: Se o usuário for chefe de empresa, mostrar apenas suas vagas.
    // Instituições contratantes podem ver todas as oportunidades
    if (req.user.papel === 'chefe_empresa') {
      const empresaResult = await pool.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (empresaResult.rows.length > 0) {
        const empresaId = empresaResult.rows[0].id;
        params.push(empresaId);
        whereConditions.push(`o.empresa_id = $${params.length}`);
      } else {
        // Se o chefe de empresa não tiver um perfil de empresa, retorna um array vazio.
        return res.json([]);
      }
    }
    
    // Instituições contratantes e instituições de ensino podem ver todas as oportunidades
    
    // Para instituições contratantes, mostrar apenas oportunidades aprovadas por padrão
    if (req.user.papel === 'instituicao_contratante' && !status) {
      params.push('aprovado');
      whereConditions.push(`o.status = $${params.length}`);
    }
    
    if (status) {
      params.push(status);
      whereConditions.push(`o.status = $${params.length}`);
    }
    
    if (tipo) {
      params.push(tipo);
      whereConditions.push(`o.tipo = $${params.length}`);
    }
    
    if (data_inicio) {
      params.push(data_inicio);
      whereConditions.push(`o.data_inicio >= $${params.length}`);
    }
    
    if (data_fim) {
      params.push(data_fim);
      whereConditions.push(`o.data_fim <= $${params.length}`);
    }
    
    if (termo) {
      params.push(`%${termo}%`);
      whereConditions.push(`(o.titulo ILIKE $${params.length} OR o.descricao ILIKE $${params.length})`);
    }
    
    // Adicionar WHERE se houver condições
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Ordenação e limites
    query += ` ORDER BY o.data_inicio DESC, o.criado_em DESC`;
    
    console.log('[API-oportunidades] Query SQL:', query);
    console.log('[API-oportunidades] Parâmetros:', params);
    
    const result = await pool.query(query, params);
    
    // Processar resultados
    const oportunidades = await Promise.all(result.rows.map(async opp => {
      // Garantir que requisitos seja um array
      if (!opp.requisitos) {
        opp.requisitos = [];
      } else if (typeof opp.requisitos === 'string') {
        try {
          opp.requisitos = JSON.parse(opp.requisitos);
          if (!Array.isArray(opp.requisitos)) {
            opp.requisitos = [opp.requisitos];
          }
        } catch (e) {
          console.warn('[API-oportunidades] Erro ao fazer parsing de requisitos:', e);
          opp.requisitos = [];
        }
      }
      
      // Garantir que beneficios seja um array
      if (!opp.beneficios) {
        opp.beneficios = [];
      } else if (typeof opp.beneficios === 'string') {
        try {
          opp.beneficios = JSON.parse(opp.beneficios);
          if (!Array.isArray(opp.beneficios)) {
            opp.beneficios = [opp.beneficios];
          }
        } catch (e) {
          console.warn('[API-oportunidades] Erro ao fazer parsing de beneficios:', e);
          opp.beneficios = [];
        }
      }
      
      // Garantir que o campo area existe
      if (!opp.area) {
        opp.area = 'Não especificada';
      }
      
      // Converter total_recomendacoes para número
      opp.total_recomendacoes = parseInt(opp.total_recomendacoes || 0, 10);
      
      // Calcular vagas_preenchidas
      const vagasPreenchidasResult = await req.db.query(
        'SELECT COUNT(*) FROM jovens_chefes_empresas WHERE chefe_empresa_id = $1 AND status IN (\'Contratado\', \'Estagiário\')',
        [opp.empresa_id]
      );
      opp.vagas_preenchidas = parseInt(vagasPreenchidasResult.rows[0].count, 10);
      
      return opp;
    }));
    
    console.log(`[API-oportunidades] Retornando ${oportunidades.length} oportunidades`);
    res.json(oportunidades);
  } catch (error) {
    console.error('[API-oportunidades] Erro ao listar oportunidades:', error);
    next(error);
  }
});

// Obter detalhes de uma oportunidade específica
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para obter detalhes da oportunidade:', req.params.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { id } = req.params;
    
    // Obter detalhes da oportunidade
    const oportunidadeQuery = await pool.query(
      `SELECT o.*, 
              ce.empresa as empresa_nome,
              u.nome as empresa_representante,
              u.email as empresa_email
       FROM oportunidades o
       JOIN chefes_empresas ce ON o.empresa_id = ce.id
       JOIN usuarios u ON ce.usuario_id = u.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (oportunidadeQuery.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada');
    }
    
    const oportunidade = oportunidadeQuery.rows[0];
    
    // Garantir que requisitos seja um array
    if (!oportunidade.requisitos) {
      oportunidade.requisitos = [];
    } else if (typeof oportunidade.requisitos === 'string') {
      try {
        oportunidade.requisitos = JSON.parse(oportunidade.requisitos);
        if (!Array.isArray(oportunidade.requisitos)) {
          oportunidade.requisitos = [oportunidade.requisitos];
        }
      } catch (e) {
        console.warn('[API-oportunidades] Erro ao fazer parsing de requisitos:', e);
        oportunidade.requisitos = [];
      }
    }
    
    // Garantir que beneficios seja um array
    if (!oportunidade.beneficios) {
      oportunidade.beneficios = [];
    } else if (typeof oportunidade.beneficios === 'string') {
      try {
        oportunidade.beneficios = JSON.parse(oportunidade.beneficios);
        if (!Array.isArray(oportunidade.beneficios)) {
          oportunidade.beneficios = [oportunidade.beneficios];
        }
      } catch (e) {
        console.warn('[API-oportunidades] Erro ao fazer parsing de beneficios:', e);
        oportunidade.beneficios = [];
      }
    }
    
    // Garantir que o campo area existe
    if (!oportunidade.area) {
      oportunidade.area = 'Não especificada';
    }
    
    // Converter total_recomendacoes para número
    oportunidade.total_recomendacoes = parseInt(oportunidade.total_recomendacoes || 0, 10);
    
    // Calcular vagas_preenchidas
    const vagasPreenchidasResult = await req.db.query(
      'SELECT COUNT(*) FROM jovens_chefes_empresas WHERE chefe_empresa_id = $1 AND status IN (\'Contratado\', \'Estagiário\')',
      [oportunidade.empresa_id]
    );
    oportunidade.vagas_preenchidas = parseInt(vagasPreenchidasResult.rows[0].count, 10);
    
    // Verificar se o usuário é o dono da oportunidade
    let isOwner = false;
    if (req.user.papel === 'empresa') {
      const empresa = await pool.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (empresa.rows.length > 0) {
        isOwner = empresa.rows[0].id === oportunidade.empresa_id;
      }
    }
    
    // Obter recomendações relacionadas à oportunidade
    let recomendacoes = [];
    if (isOwner) {
      // Se for dono, mostra todas as recomendações
      const recomendacoesQuery = await pool.query(
        `SELECT r.*, 
                j.nome as jovem_nome, 
                j.email as jovem_email,
                j.formacao as jovem_formacao,
                j.idade as jovem_idade,
                CASE 
                  WHEN r.recomendador_tipo = 'instituicao_ensino' THEN
                    (SELECT u.nome FROM instituicoes_ensino ie JOIN usuarios u ON ie.usuario_id = u.id WHERE ie.id = r.recomendador_id)
                  WHEN r.recomendador_tipo = 'chefe_empresa' THEN
                    (SELECT u.nome FROM chefes_empresas ce JOIN usuarios u ON ce.usuario_id = u.id WHERE ce.id = r.recomendador_id)
                END as recomendador_nome
         FROM recomendacoes r
         JOIN jovens j ON r.jovem_id = j.id
         WHERE r.oportunidade_id = $1
         ORDER BY r.criado_em DESC`,
        [id]
      );
      
      recomendacoes = recomendacoesQuery.rows;
    } else {
      // Se for instituição de ensino ou chefe de empresa, mostra apenas suas recomendações
      if (req.user.papel === 'instituicao_ensino') {
        const instituicao = await pool.query(
          'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
          [req.user.id]
        );
        
        if (instituicao.rows.length > 0) {
          const instituicaoId = instituicao.rows[0].id;
          
          const recomendacoesQuery = await pool.query(
            `SELECT r.*, 
                    j.nome as jovem_nome, 
                    j.email as jovem_email,
                    j.formacao as jovem_formacao,
                    j.idade as jovem_idade
             FROM recomendacoes r
             JOIN jovens j ON r.jovem_id = j.id
             WHERE r.oportunidade_id = $1 
             AND r.recomendador_tipo = 'instituicao_ensino' 
             AND r.recomendador_id = $2
             ORDER BY r.criado_em DESC`,
            [id, instituicaoId]
          );
          
          recomendacoes = recomendacoesQuery.rows;
        }
      } else if (req.user.papel === 'chefe_empresa') {
        const empresa = await pool.query(
          'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
          [req.user.id]
        );
        
        if (empresa.rows.length > 0) {
          const empresaId = empresa.rows[0].id;
          
          const recomendacoesQuery = await pool.query(
            `SELECT r.*, 
                    j.nome as jovem_nome, 
                    j.email as jovem_email,
                    j.formacao as jovem_formacao,
                    j.idade as jovem_idade
             FROM recomendacoes r
             JOIN jovens j ON r.jovem_id = j.id
             WHERE r.oportunidade_id = $1 
             AND r.recomendador_tipo = 'chefe_empresa' 
             AND r.recomendador_id = $2
             ORDER BY r.criado_em DESC`,
            [id, empresaId]
          );
          
          recomendacoes = recomendacoesQuery.rows;
        }
      }
    }
    
    // Montar resposta
    const resposta = {
      ...oportunidade,
      is_owner: isOwner,
      recomendacoes: recomendacoes
    };
    
    res.json(resposta);
  } catch (error) {
    next(error);
  }
});

// Criar nova oportunidade (apenas chefes de empresa)
router.post('/', authMiddleware, checkRole(['chefe_empresa']), validate(oportunidadeSchema), async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para criar oportunidade');
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { titulo, descricao, tipo, requisitos, beneficios, data_inicio, data_fim, area, status } = req.body;
    
    // Obter ID do chefe de empresa
    const empresa = await pool.query(
      'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
      [req.user.id]
    );
    
    if (empresa.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de empresa não encontrado' });
    }
    
    const empresaId = empresa.rows[0].id;
    
    // Inserir oportunidade
    const result = await pool.query(
      `INSERT INTO oportunidades
       (empresa_id, titulo, descricao, tipo, area, requisitos, beneficios, data_inicio, data_fim, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        empresaId,
        titulo,
        descricao,
        tipo,
        area,
        requisitos || [],
        beneficios || [],
        data_inicio || null,
        data_fim || null,
        status || 'aprovado'
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Oportunidade criada com sucesso',
      oportunidade: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar uma oportunidade (apenas donos da vaga)
router.put('/:id', authMiddleware, checkRole(['chefe_empresa']), validate(oportunidadeSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, tipo, area, requisitos, beneficios, data_inicio, data_fim } = req.body;
    
    // Obter ID do chefe de empresa e verificar se ele é o dono da vaga
    const empresaResult = await req.db.query('SELECT id FROM chefes_empresas WHERE usuario_id = $1', [req.user.id]);
    if (empresaResult.rows.length === 0) {
      throw new ForbiddenError('Perfil de empresa não encontrado');
    }
    const empresaId = empresaResult.rows[0].id;

    const oportunidadeResult = await req.db.query('SELECT empresa_id FROM oportunidades WHERE id = $1', [id]);
    if (oportunidadeResult.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada');
    }
    if (oportunidadeResult.rows[0].empresa_id !== empresaId) {
      throw new ForbiddenError('Você não tem permissão para editar esta oportunidade');
    }

    const result = await req.db.query(
      `UPDATE oportunidades
       SET titulo = $1, descricao = $2, tipo = $3, area = $4, requisitos = $5, beneficios = $6, data_inicio = $7, data_fim = $8, atualizado_em = NOW()
       WHERE id = $9
       RETURNING *`,
      [titulo, descricao, tipo, area, requisitos, beneficios, data_inicio, data_fim, id]
    );

    res.json({
      success: true,
      message: 'Oportunidade atualizada com sucesso',
      oportunidade: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
});

// Excluir uma oportunidade
router.delete('/:id', authMiddleware, checkRole(['chefe_empresa']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obter ID do chefe de empresa e verificar se ele é o dono da vaga
    const empresaResult = await req.db.query('SELECT id FROM chefes_empresas WHERE usuario_id = $1', [req.user.id]);
    if (empresaResult.rows.length === 0) {
      throw new ForbiddenError('Perfil de empresa não encontrado');
    }
    const empresaId = empresaResult.rows[0].id;

    const oportunidadeResult = await req.db.query('SELECT empresa_id FROM oportunidades WHERE id = $1', [id]);
    if (oportunidadeResult.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada');
    }
    if (oportunidadeResult.rows[0].empresa_id !== empresaId) {
      throw new ForbiddenError('Você não tem permissão para excluir esta oportunidade');
    }

    await req.db.query('DELETE FROM oportunidades WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Oportunidade excluída com sucesso'
    });
  } catch(error) {
    next(error);
  }
});

// Atualizar status de uma oportunidade
router.put('/:id/status', authMiddleware, checkRole(['chefe_empresa']), async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para atualizar status da oportunidade:', req.params.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status não fornecido' });
    }
    
    // Verificar se o status é válido
    const statusesValidos = ['pendente', 'aprovado', 'rejeitado', 'cancelado'];
    if (!statusesValidos.includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }
    
    // Verificar se a oportunidade existe e pertence à empresa
    const empresa = await pool.query(
      'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
      [req.user.id]
    );
    
    if (empresa.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de empresa não encontrado' });
    }
    
    const empresaId = empresa.rows[0].id;
    
    const oportunidade = await pool.query(
      'SELECT * FROM oportunidades WHERE id = $1 AND empresa_id = $2',
      [id, empresaId]
    );
    
    if (oportunidade.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada ou não pertence a esta empresa');
    }
    
    // Atualizar status
    const result = await pool.query(
      `UPDATE oportunidades
       SET status = $1,
           atualizado_em = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Status da oportunidade atualizado com sucesso',
      oportunidade: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router; 