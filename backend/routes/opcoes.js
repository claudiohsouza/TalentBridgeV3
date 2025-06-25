import express from 'express';
// Removendo a importação do middleware de autenticação
// import { authMiddleware } from './auth.js';
import db from '../db-connect.js';

const router = express.Router();
const pool = db.pool;

// Rota para obter todas as opções
router.get('/', async (req, res) => {
    try {
        // Buscar apenas as opções do banco de dados normalmente:
        const result = await pool.query('SELECT categoria, valor, ordem FROM opcoes_sistema ORDER BY categoria, ordem');
        const opcoes = result.rows;
        
        // Agrupar opções por categoria
        const opcoesAgrupadas = opcoes.reduce((acc, opcao) => {
            if (!acc[opcao.categoria]) {
                acc[opcao.categoria] = [];
            }
            acc[opcao.categoria].push(opcao.valor);
            return acc;
        }, {});

        console.log('Opções agrupadas:', opcoesAgrupadas);
        res.success(opcoesAgrupadas);
    } catch (error) {
        console.error('Erro ao buscar opções:', error);
        res.error('Erro ao buscar opções', 500, error.message);
    }
});

// Rota para obter opções de uma categoria específica
router.get('/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const result = await pool.query(
      'SELECT id, valor, descricao FROM opcoes_sistema WHERE categoria = $1 AND ativo = true ORDER BY valor',
      [categoria]
    );
    
    res.success(result.rows);
  } catch (error) {
    console.error('Erro ao buscar opções:', error);
    res.error('Erro ao buscar opções', 500, error.message);
  }
});

// Obter todas as categorias disponíveis
router.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT categoria FROM opcoes_sistema WHERE ativo = true ORDER BY categoria'
    );
    
    res.success(result.rows.map(row => row.categoria));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.error('Erro ao buscar categorias', 500, error.message);
  }
});

export default router; 