export const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler] Erro recebido:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    details: err.details
  });

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.details || err.message
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado'
    });
  }

  // Erro de banco de dados
  if (err.code === '23505') { // Código de erro de violação de chave única
    return res.status(400).json({
      error: 'Dados duplicados',
      message: 'Já existe um registro com esses dados'
    });
  }

  if (err.code === '23503') { // Código de erro de violação de chave estrangeira
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Referência inválida nos dados enviados'
    });
  }

  // Erro interno do servidor
  console.error('[ErrorHandler] Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro inesperado'
  });
}; 