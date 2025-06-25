import express from 'express';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const pool = req.db;

    const jovensQuery = pool.query('SELECT COUNT(*) AS total FROM jovens;');
    const oportunidadesQuery = pool.query('SELECT COUNT(*) AS total FROM oportunidades;');
    const chefesEmpresaQuery = pool.query('SELECT COUNT(*) AS total FROM chefes_empresas;');
    const instContratanteQuery = pool.query('SELECT COUNT(*) AS total FROM instituicoes_contratantes;');
    const contratacoesQuery = pool.query("SELECT COUNT(*) AS total FROM jovens WHERE status = 'contratado';");

    const [
      jovensResult, 
      oportunidadesResult, 
      chefesEmpresaResult,
      instContratanteResult,
      contratacoesResult
    ] = await Promise.all([
      jovensQuery, 
      oportunidadesQuery, 
      chefesEmpresaQuery,
      instContratanteQuery,
      contratacoesQuery
    ]);

    const totalJovens = parseInt(jovensResult.rows[0].total, 10);
    const totalOportunidades = parseInt(oportunidadesResult.rows[0].total, 10);
    const totalChefes = parseInt(chefesEmpresaResult.rows[0].total, 10);
    const totalContratantes = parseInt(instContratanteResult.rows[0].total, 10);
    const totalContratacoes = parseInt(contratacoesResult.rows[0].total, 10);

    res.success({
      jovens: totalJovens,
      oportunidades: totalOportunidades,
      empresas: totalChefes + totalContratantes,
      contratacoes: totalContratacoes
    });
  } catch (err) {
    res.error('Erro ao buscar estatísticas', 500, err.message);
  }
});

router.get('/featured', async (req, res, next) => {
  try {
    const pool = req.db;

    // 1. Obter a recomendação mais recente
    const latestRecResult = await pool.query(`
      SELECT 
        r.jovem_id,
        r.oportunidade_id,
        o.titulo as oportunidade_titulo,
        ce.empresa as oportunidade_empresa
      FROM recomendacoes r
      JOIN oportunidades o ON r.oportunidade_id = o.id
      JOIN chefes_empresas ce ON o.empresa_id = ce.id
      ORDER BY r.criado_em DESC 
      LIMIT 1
    `);

    let featuredData = null;
    let featuredOpportunityId = null;

    if (latestRecResult.rows.length > 0) {
      const rec = latestRecResult.rows[0];
      featuredOpportunityId = rec.oportunidade_id;
      
      // 2. Obter detalhes do jovem recomendado
      const jovemResult = await pool.query(
        `SELECT nome, curso, habilidades FROM jovens WHERE id = $1`,
        [rec.jovem_id]
      );

      if (jovemResult.rows.length > 0) {
        featuredData = {
          jovem: jovemResult.rows[0],
          oportunidade: {
            id: rec.oportunidade_id,
            titulo: rec.oportunidade_titulo,
            empresa: rec.oportunidade_empresa,
          }
        };
      }
    }

    // 3. Obter 2 outras oportunidades recentes (excluindo a destacada)
    const otherOpportunitiesResult = await pool.query(`
      SELECT 
        o.id,
        o.titulo, 
        ce.empresa as empresa_nome 
      FROM oportunidades o
      JOIN chefes_empresas ce ON o.empresa_id = ce.id
      WHERE o.id != $1
      ORDER BY o.criado_em DESC 
      LIMIT 2
    `, [featuredOpportunityId]);
    
    res.success({
      featured: featuredData,
      others: otherOpportunitiesResult.rows
    });

  } catch (error) {
    res.error('Erro ao buscar dados em destaque', 500, error.message);
  }
});

export default router; 