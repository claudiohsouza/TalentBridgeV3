import express from 'express';
import { validate, jovemSchema, recomendacaoSchema } from '../middleware/validator.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { ForbiddenError, NotFoundError, DatabaseError } from '../middleware/errorHandler.js';

const router = express.Router();

// Listar jovens com recomendações e oportunidades (para instituição contratante)
router.get('/recomendados', authMiddleware, checkRole(['instituicao_contratante']), async (req, res) => {
  try {
    // Buscar todos os jovens com suas recomendações e pontuação calculada
    const result = await req.db.query(`
      WITH historico_pontos AS (
        SELECT 
          h.jovem_id,
          SUM(
            CASE h.tipo
              WHEN 'conquista' THEN 5
              WHEN 'projeto' THEN 4
              WHEN 'certificacao' THEN 3
              WHEN 'curso' THEN 2
              ELSE 0
            END
          ) as pontos
        FROM historico_desenvolvimento h
        GROUP BY h.jovem_id
      ),
      jovens_recomendacoes AS (
        SELECT 
          j.id,
          j.nome,
          j.email,
          j.idade,
          j.formacao,
          j.curso,
          j.habilidades,
          j.interesses,
          j.planos_futuros,
          j.status,
          COALESCE(
            jsonb_agg(DISTINCT
              jsonb_build_object(
                'id', r.id,
                'status', r.status,
                'oportunidade_id', o.id,
                'jovem_id', j.id,
                'oportunidade_titulo', o.titulo
              )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'::jsonb
          ) as recomendacoes,
          ROUND(LEAST(COALESCE(hp.pontos, 0) * 5.0 / 20.0, 5.0), 1) as pontuacao_desenvolvimento
        FROM jovens j
        LEFT JOIN recomendacoes r ON j.id = r.jovem_id
        LEFT JOIN oportunidades o ON r.oportunidade_id = o.id
        LEFT JOIN historico_pontos hp ON hp.jovem_id = j.id
        WHERE j.status <> 'contratado'
        GROUP BY j.id, hp.pontos
      )
      SELECT *
      FROM jovens_recomendacoes
      WHERE jsonb_array_length(recomendacoes) > 0
      ORDER BY nome
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar jovens recomendados:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar jovens recomendados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Listar jovens - todos os tipos de usuário podem visualizar
router.get('/', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa', 'instituicao_contratante']), async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT 
        j.id,
        j.nome,
        j.email,
        j.idade,
        j.formacao,
        j.curso,
        j.habilidades,
        j.interesses,
        j.planos_futuros,
        j.status,
        j.criado_em,
        j.atualizado_em
      FROM jovens j
      ORDER BY j.nome
    `);

    // Buscar médias das avaliações para todos os jovens
    const idsJovens = result.rows.map(j => j.id);
    let medias = {};
    if (idsJovens.length > 0) {
      const mediasResult = await req.db.query(`
        SELECT jovem_id, 
          CASE WHEN SUM(c.peso) > 0 THEN SUM(a.nota * c.peso) / SUM(c.peso) ELSE 0 END as media_geral
        FROM avaliacoes a
        LEFT JOIN categorias_avaliacao c ON a.categoria_id = c.id
        WHERE jovem_id = ANY($1)
        GROUP BY jovem_id
      `, [idsJovens]);
      mediasResult.rows.forEach(row => {
        medias[row.jovem_id] = Number(row.media_geral);
      });
    }
    const jovens = result.rows.map(jovem => {
      let parsedHabilidades = [];
      let parsedInteresses = [];
      
      if (Array.isArray(jovem.habilidades)) {
        parsedHabilidades = jovem.habilidades;
      } else if (typeof jovem.habilidades === 'string') {
        parsedHabilidades = jovem.habilidades.split(',').map(h => h.trim());
      } else {
        parsedHabilidades = [];
      }
      
      if (Array.isArray(jovem.interesses)) {
        parsedInteresses = jovem.interesses;
      } else if (typeof jovem.interesses === 'string') {
        parsedInteresses = jovem.interesses.split(',').map(i => i.trim());
      } else {
        parsedInteresses = [];
      }
      
      return {
        ...jovem,
        habilidades: parsedHabilidades,
        interesses: parsedInteresses,
        media_geral: medias[jovem.id] ?? 0
      };
    });

    res.json(jovens);
  } catch (error) {
    console.error('Erro ao listar jovens:', error);
    res.status(500).json({ message: 'Erro ao listar jovens' });
  }
});

// Rota para o formulário de criação de jovem
router.get('/novo', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Formulário para criar um novo jovem',
    campos_obrigatorios: ['nome', 'email', 'idade'],
    campos_opcionais: ['formacao', 'habilidades', 'interesses', 'planos_futuros']
  });
});

// Obter um jovem específico - todos os tipos de usuário podem visualizar
router.get('/:id', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa', 'instituicao_contratante']), async (req, res) => {
  try {
    console.log('Buscando jovem com ID:', req.params.id);
    
    const result = await req.db.query(`
      SELECT 
        j.id,
        j.nome,
        j.email,
        j.idade,
        j.formacao,
        j.curso,
        j.habilidades,
        j.interesses,
        j.planos_futuros,
        j.status,
        j.criado_em,
        j.atualizado_em
      FROM jovens j
      WHERE j.id = $1
    `, [req.params.id]);

    console.log('Resultado da busca:', result.rows.length > 0 ? 'Jovem encontrado' : 'Jovem não encontrado');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    let parsedHabilidades = [];
    let parsedInteresses = [];
    
    if (Array.isArray(result.rows[0].habilidades)) {
      parsedHabilidades = result.rows[0].habilidades;
    } else if (typeof result.rows[0].habilidades === 'string') {
      parsedHabilidades = result.rows[0].habilidades.split(',').map(h => h.trim());
    }
    
    if (Array.isArray(result.rows[0].interesses)) {
      parsedInteresses = result.rows[0].interesses;
    } else if (typeof result.rows[0].interesses === 'string') {
      parsedInteresses = result.rows[0].interesses.split(',').map(i => i.trim());
    }

    const jovem = {
      ...result.rows[0],
      habilidades: parsedHabilidades,
      interesses: parsedInteresses
    };

    console.log('Retornando dados do jovem:', { id: jovem.id, nome: jovem.nome });
    res.json(jovem);
  } catch (error) {
    console.error('Erro ao buscar jovem:', error);
    res.status(500).json({ message: 'Erro ao buscar jovem' });
  }
});

// Obter histórico de desenvolvimento do jovem
router.get('/:id/historico', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa', 'instituicao_contratante']), async (req, res) => {
  try {
    console.log('Buscando histórico do jovem com ID:', req.params.id);
    
    const result = await req.db.query(`
      SELECT 
        h.id,
        h.jovem_id,
        h.tipo,
        h.titulo,
        h.descricao,
        h.data_inicio,
        h.data_conclusao,
        h.instituicao,
        h.comprovante_url,
        h.validado,
        h.validado_por,
        h.criado_em,
        h.atualizado_em
      FROM historico_desenvolvimento h
      WHERE h.jovem_id = $1
      ORDER BY h.data_conclusao DESC NULLS LAST, h.criado_em DESC
    `, [req.params.id]);

    console.log('Resultado da busca:', result.rows.length > 0 ? 'Histórico encontrado' : 'Nenhum histórico encontrado');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico do jovem:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico do jovem' });
  }
});

// Adicionar registro de histórico
router.post('/:id/historico', authMiddleware, checkRole(['instituicao_ensino']), async (req, res) => {
  try {
    console.log('Adicionando histórico para jovem com ID:', req.params.id);
    
    const {
      tipo,
      titulo,
      descricao,
      data_inicio,
      data_conclusao,
      instituicao,
      comprovante_url
    } = req.body;

    const result = await req.db.query(`
      INSERT INTO historico_desenvolvimento (
        jovem_id,
        tipo,
        titulo,
        descricao,
        data_inicio,
        data_conclusao,
        instituicao,
        comprovante_url,
        validado,
        criado_em,
        atualizado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW())
      RETURNING *
    `, [
      req.params.id,
      tipo,
      titulo,
      descricao,
      data_inicio,
      data_conclusao,
      instituicao,
      comprovante_url
    ]);

    console.log('Histórico adicionado com sucesso');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar histórico:', error);
    res.status(500).json({ message: 'Erro ao adicionar histórico' });
  }
});

// Criar novo jovem - apenas instituições de ensino podem criar
router.post('/', authMiddleware, checkRole(['instituicao_ensino']), validate(jovemSchema), async (req, res) => {
  try {
    console.log('[JOVEM][POST] Dados recebidos:', JSON.stringify(req.body, null, 2));
    // Verificar se o email já está em uso
    const emailCheck = await req.db.query(
      'SELECT id FROM jovens WHERE email = $1',
      [req.body.email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const result = await req.db.query(
      `INSERT INTO jovens (
        nome, email, idade, formacao, curso,
        habilidades, interesses, planos_futuros, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        req.body.nome,
        req.body.email,
        req.body.idade,
        req.body.formacao,
        req.body.curso,
        req.body.habilidades,
        req.body.interesses,
        req.body.planos_futuros,
        'pendente'
      ]
    );

    res.status(201).json({
      message: 'Jovem cadastrado com sucesso',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao cadastrar jovem:', error);
    res.status(500).json({ message: 'Erro ao cadastrar jovem' });
  }
});

// Atualizar jovem - apenas instituições de ensino podem atualizar
router.put('/:id', authMiddleware, checkRole(['instituicao_ensino']), validate(jovemSchema), async (req, res) => {
  try {
    // Verificar se o jovem existe
    const jovemCheck = await req.db.query(
      'SELECT id FROM jovens WHERE id = $1',
      [req.params.id]
    );

    if (jovemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    // Verificar se o email já está em uso por outro jovem
    const emailCheck = await req.db.query(
      'SELECT id FROM jovens WHERE email = $1 AND id != $2',
      [req.body.email, req.params.id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Atualizar jovem
    await req.db.query(
      `UPDATE jovens SET 
        nome = $1,
        email = $2,
        idade = $3,
        formacao = $4,
        curso = $5,
        habilidades = $6,
        interesses = $7,
        planos_futuros = $8
      WHERE id = $9`,
      [
        req.body.nome,
        req.body.email,
        req.body.idade,
        req.body.formacao,
        req.body.curso,
        req.body.habilidades,
        req.body.interesses,
        req.body.planos_futuros,
        req.params.id
      ]
    );

    res.json({ message: 'Jovem atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar jovem:', error);
    res.status(500).json({ message: 'Erro ao atualizar jovem' });
  }
});

// Excluir jovem - apenas instituições de ensino podem excluir
router.delete('/:id', authMiddleware, checkRole(['instituicao_ensino']), async (req, res) => {
  try {
    // Verificar se o jovem existe
    const jovemCheck = await req.db.query(
      'SELECT id FROM jovens WHERE id = $1',
      [req.params.id]
    );

    if (jovemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    // Excluir jovem
    await req.db.query(
      'DELETE FROM jovens WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Jovem excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir jovem:', error);
    res.status(500).json({ message: 'Erro ao excluir jovem' });
  }
});

export default router; 