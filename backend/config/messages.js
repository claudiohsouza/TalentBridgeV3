export const messages = {
  // Auth messages
  auth: {
    loginSuccess: 'Login realizado com sucesso',
    loginFailed: 'Email ou senha incorretos',
    tokenInvalid: 'Token inválido ou expirado',
    unauthorized: 'Não autorizado',
    passwordChanged: 'Senha alterada com sucesso',
    passwordMismatch: 'Senha atual incorreta',
    emailInUse: 'Este email já está em uso'
  },

  // User messages
  user: {
    profileUpdated: 'Perfil atualizado com sucesso',
    userNotFound: 'Usuário não encontrado',
    invalidData: 'Dados inválidos',
    passwordRequired: 'Senha atual e nova senha são obrigatórias'
  },

  // Validation messages
  validation: {
    required: 'Campo obrigatório',
    invalidEmail: 'Email inválido',
    invalidPassword: 'Senha deve ter no mínimo 6 caracteres',
    invalidData: 'Dados inválidos'
  },

  // System messages
  system: {
    serverError: 'Erro interno do servidor',
    databaseError: 'Erro de conexão com o banco de dados',
    tooManyRequests: 'Muitas requisições, tente novamente mais tarde',
    apiWorking: 'API TalentBridge funcionando!'
  }
}; 