import express from 'express';
import db from '../db-connect.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';

const router = express.Router();
const pool = db.pool;

// Obter categorias de avaliação
router.get('/categorias', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias_avaliacao ORDER BY nome'
    );
    res.success(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.error('Erro ao buscar categorias de avaliação', 500, error.message);
  }
});

// Obter avaliações de um jovem
router.get('/jovem/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the student exists
    const jovemExists = await pool.query(
      'SELECT id FROM jovens WHERE id = $1',
      [id]
    );

    if (jovemExists.rows.length === 0) {
      return res.error('Jovem não encontrado', 404);
    }
    
    const result = await pool.query(
      `SELECT a.*, c.nome as categoria_nome, c.descricao as categoria_descricao, c.peso as categoria_peso,
        CASE 
          WHEN a.avaliador_tipo = 'instituicao_ensino' THEN ie.nome
          WHEN a.avaliador_tipo = 'chefe_empresa' THEN u.nome || ' (' || ce.empresa || ')'
          WHEN a.avaliador_tipo = 'instituicao_contratante' THEN ic.nome
        END as avaliador_nome
      FROM avaliacoes a
      LEFT JOIN categorias_avaliacao c ON a.categoria_id = c.id
      LEFT JOIN usuarios u ON a.avaliador_id = u.id
      LEFT JOIN instituicoes_ensino ie ON u.id = ie.usuario_id
      LEFT JOIN chefes_empresas ce ON u.id = ce.usuario_id
      LEFT JOIN instituicoes_contratantes ic ON u.id = ic.usuario_id
      WHERE a.jovem_id = $1
      ORDER BY a.criado_em DESC`,
      [id]
    );

    // Converter nota para número
    const avaliacoes = result.rows.map(av => ({
      ...av,
      nota: av.nota !== null ? Number(av.nota) : null
    }));

    // Calcular média ponderada
    if (avaliacoes.length > 0) {
      const { media, total } = avaliacoes.reduce(
        (acc, av) => {
          const peso = av.categoria_peso || 1;
          return {
            media: acc.media + (av.nota * peso),
            total: acc.total + peso
          };
        },
        { media: 0, total: 0 }
      );

      res.success({
        avaliacoes,
        media_geral: total > 0 ? (media / total) : 0,
        total_avaliacoes: avaliacoes.length
      });
    } else {
      res.success({
        avaliacoes: [],
        media_geral: 0,
        total_avaliacoes: 0
      });
    }
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    console.error(error.stack);
    res.error('Erro ao buscar avaliações', 500, error.message);
  }
});

// Criar nova avaliação
router.post('/jovem/:id', authMiddleware, checkRole(['instituicao_ensino']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { categoria_id, nota, comentario, evidencias } = req.body;
    
    // Validar nota
    if (nota < 0 || nota > 10) {
      return res.error('Nota deve estar entre 0 e 10', 400);
    }
    
    // Verificar se a categoria existe
    const categoriaResult = await client.query(
      'SELECT id FROM categorias_avaliacao WHERE id = $1',
      [categoria_id]
    );
    
    if (categoriaResult.rows.length === 0) {
      return res.error('Categoria de avaliação inválida', 400);
    }
    
    // Verificar se o jovem existe
    const jovemResult = await client.query(
      'SELECT id FROM jovens WHERE id = $1',
      [id]
    );
    
    if (jovemResult.rows.length === 0) {
      return res.error('Jovem não encontrado', 404);
    }
    
    // Iniciar transação
    await client.query('BEGIN');
    
    // Verificar se já existe uma avaliação para esta combinação
    const avaliacaoExistente = await client.query(
      `SELECT id FROM avaliacoes 
       WHERE jovem_id = $1 
       AND avaliador_tipo = $2 
       AND avaliador_id = $3 
       AND categoria_id = $4`,
      [id, req.user.papel, req.user.id, categoria_id]
    );
    
    let result;
    
    if (avaliacaoExistente.rows.length > 0) {
      // Atualizar avaliação existente
      result = await client.query(
        `UPDATE avaliacoes 
         SET nota = $1,
             comentario = $2,
             evidencias = $3,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [nota, comentario, evidencias || [], avaliacaoExistente.rows[0].id]
      );
    } else {
      // Inserir nova avaliação
      result = await client.query(
        `INSERT INTO avaliacoes (
          jovem_id, avaliador_tipo, avaliador_id, categoria_id,
          nota, comentario, evidencias
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          id,
          req.user.papel,
          req.user.id,
          categoria_id,
          nota,
          comentario,
          evidencias || []
        ]
      );
    }
    
    // Buscar detalhes da avaliação com categoria
    const avaliacaoResult = await client.query(
      `SELECT a.*, c.nome as categoria_nome, c.descricao as categoria_descricao
      FROM avaliacoes a
      LEFT JOIN categorias_avaliacao c ON a.categoria_id = c.id
      WHERE a.id = $1`,
      [result.rows[0].id]
    );
    
    await client.query('COMMIT');
    
    res.success({
      ...avaliacaoResult.rows[0],
      mensagem: avaliacaoExistente.rows.length > 0 ? 'Avaliação atualizada com sucesso' : 'Avaliação criada com sucesso'
    }, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar/atualizar avaliação:', error);
    res.error('Erro ao criar/atualizar avaliação', 500, error.message);
  } finally {
    client.release();
  }
});

// Atualizar avaliação
router.put('/:id', authMiddleware, checkRole(['instituicao_ensino']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { nota, comentario, evidencias } = req.body;
    
    // Verificar se a avaliação existe e pertence ao avaliador
    const avaliacaoResult = await client.query(
      'SELECT * FROM avaliacoes WHERE id = $1',
      [id]
    );
    
    if (avaliacaoResult.rows.length === 0) {
      return res.error('Avaliação não encontrada', 404);
    }
    
    const avaliacao = avaliacaoResult.rows[0];
    
    // Verificar permissão
    if (
      avaliacao.avaliador_id !== req.user.id ||
      avaliacao.avaliador_tipo !== req.user.papel
    ) {
      return res.error('Sem permissão para editar esta avaliação', 403);
    }
    
    // Validar nota
    if (nota < 0 || nota > 10) {
      return res.error('Nota deve estar entre 0 e 10', 400);
    }
    
    // Atualizar avaliação
    const result = await client.query(
      `UPDATE avaliacoes
      SET nota = $1,
          comentario = $2,
          evidencias = $3,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`,
      [nota, comentario, evidencias || [], id]
    );
    
    res.success(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.error('Erro ao atualizar avaliação', 500, error.message);
  } finally {
    client.release();
  }
});

// Excluir avaliação
router.delete('/:id', authMiddleware, checkRole(['instituicao_ensino']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    // Verificar se a avaliação existe e pertence ao avaliador
    const avaliacaoResult = await client.query(
      'SELECT * FROM avaliacoes WHERE id = $1',
      [id]
    );
    
    if (avaliacaoResult.rows.length === 0) {
      return res.error('Avaliação não encontrada', 404);
    }
    
    const avaliacao = avaliacaoResult.rows[0];
    
    // Verificar permissão
    if (
      avaliacao.avaliador_id !== req.user.id ||
      avaliacao.avaliador_tipo !== req.user.papel
    ) {
      return res.error('Sem permissão para excluir esta avaliação', 403);
    }
    
    await client.query('DELETE FROM avaliacoes WHERE id = $1', [id]);
    
    res.success({ mensagem: 'Avaliação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir avaliação:', error);
    res.error('Erro ao excluir avaliação', 500, error.message);
  } finally {
    client.release();
  }
});

export default router; 