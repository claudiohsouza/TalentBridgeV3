import 'dotenv/config';
import pg from 'pg';
import config from './config/config.js';
import logger from './config/logger.js';

const { Pool } = pg;

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

// Teste de conexão
async function testarConexao() {
  try {
    const client = await pool.connect();
    logger.info('Conexão com banco de dados estabelecida com sucesso');
    client.release();
    return true;
  } catch (err) {
    logger.error('Erro ao conectar ao banco de dados:', err);
    return false;
  }
}

export default {
  pool,
  testarConexao
}; 