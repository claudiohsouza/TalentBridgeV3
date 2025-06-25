import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse,
  Jovem,
  JovemInput,
  Oportunidade,
  OportunidadeInput,
  HistoricoDesenvolvimento,
  HistoricoDesenvolvimentoInput
} from '../types';

// Configuração do axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL 
    : '',  // Em desenvolvimento, usa o proxy do package.json
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  timeout: 10000
});

// Função para decodificar caracteres especiais em objetos
const decodeObject = (obj: any): any => {
  if (!obj) return obj;
  
  // Se for um array, decodifica cada item
  if (Array.isArray(obj)) {
    return obj.map(item => decodeObject(item));
  }
  
  // Se for um objeto, decodifica cada propriedade
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = decodeObject(obj[key]);
    }
    return result;
  }
  
  // Se for uma string, decodifica
  if (typeof obj === 'string') {
    try {
      // Decodifica caracteres HTML e depois UTF-8
      const textarea = document.createElement('textarea');
      textarea.innerHTML = obj;
      const decoded = textarea.value;
      return decodeURIComponent(escape(decoded));
    } catch (e) {
      return obj;
    }
  }
  
  // Outros tipos retornam como estão
  return obj;
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      console.log('[API] Adicionando token à requisição');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API] Nenhum token disponível');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e respostas
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    
    // Decodifica os dados da resposta
    if (response.data) {
      response.data = decodeObject(response.data);
    }
    
    return response;
  },
  (error) => {
    console.error('[API] Erro de resposta:', error.response?.status, error.response?.data);
    
    // Tratar erros de autenticação (401)
    if (error.response?.status === 401) {
      console.log('[API] Token expirado ou inválido, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('papel');
      localStorage.removeItem('email');
      
      // Apenas redirecionar se não estiver já na página de login ou registro
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/cadastro' && path !== '/') {
        window.location.href = '/login';
      }
    }
    
    // Tratar erros 404
    if (error.response?.status === 404) {
      console.log('[API] Recurso não encontrado');
      error.message = error.response.data.message || 'Recurso não encontrado';
    }
    
    // Tratar erros 500
    if (error.response?.status >= 500) {
      console.error('[API] Erro interno do servidor');
      error.message = 'Erro interno do servidor. Por favor, tente novamente.';
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('[Auth Service] Tentando login com:', credentials.email);
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      console.log('[Auth Service] Login bem-sucedido:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Erro no serviço de login:', error);
      throw error;
    }
  },
  
  registro: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    try {
      console.log('[Auth Service] Tentando registro com:', data.email);
      const response = await api.post<ApiResponse<User>>('/api/auth/registro', data);
      console.log('[Auth Service] Registro bem-sucedido:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Erro no serviço de registro:', error);
      throw error;
    }
  },
  
  verificarToken: async (): Promise<ApiResponse<User>> => {
    try {
      console.log('[Auth Service] Verificando token');
      const response = await api.get<ApiResponse<User>>('/api/auth/verificar');
      console.log('[Auth Service] Verificação de token bem-sucedida:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Erro no serviço de verificação de token:', error);
      throw error;
    }
  }
};

// Serviços de usuário
export const usuarioService = {
  getPerfil: async (): Promise<User> => {
    try {
      console.log('[User Service] Buscando perfil do usuário');
      const response = await api.get<User>('/api/usuarios/me');
      console.log('[User Service] Perfil recuperado:', response.data);
      return response.data;
    } catch (error) {
      console.error('[User Service] Erro ao buscar perfil:', error);
      throw error;
    }
  },
  
  atualizarPerfil: async (data: { email?: string, senhaAtual?: string, novaSenha?: string }): Promise<ApiResponse<User>> => {
    try {
      console.log('[User Service] Atualizando perfil');
      const response = await api.put<ApiResponse<User>>('/api/usuarios/me', data);
      console.log('[User Service] Perfil atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('[User Service] Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  alterarSenha: async (data: { senhaAtual: string, novaSenha: string }): Promise<ApiResponse<void>> => {
    try {
      console.log('[User Service] Alterando senha');
      const response = await api.put<ApiResponse<void>>('/api/usuarios/alterar-senha', data);
      console.log('[User Service] Senha alterada com sucesso');
      return response.data;
    } catch (error) {
      console.error('[User Service] Erro ao alterar senha:', error);
      throw error;
    }
  }
};

// Serviços de Jovens
export const jovemService = {
  listarJovens: async (): Promise<Jovem[]> => {
    try {
      const response = await api.get<Jovem[]>('/api/jovens');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar jovens:', error);
      throw error;
    }
  },

  getJovem: async (id: number): Promise<Jovem> => {
    try {
      const response = await api.get<Jovem>(`/api/jovens/${id}`);
      console.log('[Jovem Service] Dados do jovem recebidos:', response.data);
      console.log('[Jovem Service] Formato da data de atualização:', response.data.ultima_atualizacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar jovem:', error);
      throw error;
    }
  },

  adicionarJovem: async (data: JovemInput): Promise<Jovem> => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.papel !== 'instituicao_ensino') {
        throw new Error('Apenas instituições de ensino podem adicionar jovens');
      }

      console.log('Adicionando jovem:', data);
      const response = await api.post<Jovem>('/api/jovens', data);
      console.log('Jovem adicionado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar jovem:', error);
      throw error;
    }
  },

  atualizarJovem: async (id: number, data: JovemInput): Promise<Jovem> => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.papel !== 'instituicao_ensino') {
        throw new Error('Apenas instituições de ensino podem atualizar jovens');
      }

      console.log('Atualizando jovem:', id, data);
      const response = await api.put<Jovem>(`/api/jovens/${id}`, data);
      console.log('Jovem atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar jovem:', error);
      throw error;
    }
  },

  excluirJovem: async (id: number): Promise<void> => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.papel !== 'instituicao_ensino') {
        throw new Error('Apenas instituições de ensino podem excluir jovens');
      }

      await api.delete(`/api/jovens/${id}`);
    } catch (error) {
      console.error('Erro ao excluir jovem:', error);
      throw error;
    }
  },

  // Buscar histórico de desenvolvimento do jovem
  async obterHistoricoJovem(id: number): Promise<HistoricoDesenvolvimento[]> {
    try {
      const response = await api.get<HistoricoDesenvolvimento[]>(`/api/jovens/${id}/historico`);
      return decodeObject(response.data);
    } catch (error) {
      console.error('Erro ao buscar histórico do jovem:', error);
      throw error;
    }
  },

  // Adicionar registro de histórico
  async adicionarHistorico(id: number, historico: HistoricoDesenvolvimentoInput): Promise<HistoricoDesenvolvimento> {
    try {
      const response = await api.post<HistoricoDesenvolvimento>(`/api/jovens/${id}/historico`, historico);
      return decodeObject(response.data);
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
      throw error;
    }
  },

  listarJovensRecomendados: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/api/jovens/recomendados');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar jovens recomendados:', error);
      throw error;
    }
  }
};

// Serviços de Oportunidades
export const oportunidadeService = {
  listarOportunidades: async (): Promise<Oportunidade[]> => {
    try {
      console.log('[Oportunidade Service] Listando oportunidades');
      const response = await api.get<Oportunidade[]>('/api/oportunidades');
      console.log('[Oportunidade Service] Oportunidades encontradas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[Oportunidade Service] Erro ao listar oportunidades:', error);
      throw error;
    }
  },

  getOportunidade: async (id: number): Promise<Oportunidade> => {
    try {
      console.log(`[Oportunidade Service] Buscando oportunidade ID ${id}`);
      const response = await api.get<Oportunidade>(`/api/oportunidades/${id}`);
      console.log('[Oportunidade Service] Oportunidade encontrada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[Oportunidade Service] Erro ao buscar oportunidade ID ${id}:`, error);
      throw error;
    }
  },
  
  adicionarOportunidade: async (oportunidade: OportunidadeInput): Promise<Oportunidade> => {
    try {
      console.log('[Oportunidade Service] Adicionando oportunidade:', oportunidade.titulo, 'com status:', oportunidade.status);
      const response = await api.post<Oportunidade>('/api/oportunidades', oportunidade);
      console.log('[Oportunidade Service] Oportunidade adicionada:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Oportunidade Service] Erro ao adicionar oportunidade:', error);
      throw error;
    }
  },

  atualizarOportunidade: async (id: number, oportunidade: OportunidadeInput): Promise<Oportunidade> => {
    try {
      console.log(`[Oportunidade Service] Atualizando oportunidade ID ${id}:`, oportunidade.titulo);
      const response = await api.put<Oportunidade>(`/api/oportunidades/${id}`, oportunidade);
      console.log('[Oportunidade Service] Oportunidade atualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[Oportunidade Service] Erro ao atualizar oportunidade ID ${id}:`, error);
      throw error;
    }
  },

  excluirOportunidade: async (id: number): Promise<ApiResponse<null>> => {
    try {
      console.log(`[Oportunidade Service] Excluindo oportunidade ID ${id}`);
      const response = await api.delete<ApiResponse<null>>(`/api/oportunidades/${id}`);
      console.log('[Oportunidade Service] Oportunidade excluída');
      return response.data;
    } catch (error) {
      console.error(`[Oportunidade Service] Erro ao excluir oportunidade ID ${id}:`, error);
      throw error;
    }
  },

  // Novo método para recomendar jovem
  recomendarJovem: async ({ jovem_id, oportunidade_id, justificativa }: { jovem_id: string | number, oportunidade_id: string | number, justificativa: string }) => {
    try {
      console.log('[Oportunidade Service] Recomendando jovem:', { jovem_id, oportunidade_id });
      const response = await recomendacaoService.criarRecomendacao({
        jovem_id: Number(jovem_id),
        oportunidade_id: Number(oportunidade_id),
        justificativa
      });
      
      console.log('[Oportunidade Service] Recomendação realizada com sucesso:', response);
      
      return response;
    } catch (error) {
      console.error('[Oportunidade Service] Erro ao recomendar jovem:', error);
      throw error;
    }
  }
};

// Serviço para obter opções do sistema
export const opcoesService = {
  // Buscar todas as opções disponíveis
  listarOpcoes: async (): Promise<any> => {
    const response = await api.get('/api/opcoes');
    return response.data;
  },
  obterTodasOpcoes: async () => {
    const opcoes = await opcoesService.listarOpcoes();
    return opcoes;
  },
  // Buscar opções específicas por categoria
  obterOpcoesPorCategoria: async (categoria: string): Promise<any> => {
    const response = await api.get(`/api/opcoes/${categoria}`);
    return response.data;
  }
};

// Serviço de Contatos
export const contatoService = {
  enviarContato: async (data: {
    jovem_id: number;
    assunto: string;
    mensagem: string;
    tipo_contato?: string;
  }): Promise<any> => {
    try {
      console.log('[Contato Service] Enviando contato:', data);
      const response = await api.post('/api/usuarios/contato', data);
      console.log('[Contato Service] Contato enviado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Contato Service] Erro ao enviar contato:', error);
      throw error;
    }
  },

  listarContatos: async (): Promise<any[]> => {
    try {
      console.log('[Contato Service] Listando contatos');
      const response = await api.get('/api/usuarios/contatos');
      console.log('[Contato Service] Contatos encontrados:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[Contato Service] Erro ao listar contatos:', error);
      throw error;
    }
  }
};

// Serviço de Recomendações
export const recomendacaoService = {
  criarRecomendacao: async (data: {
    jovem_id: number;
    oportunidade_id: number;
    justificativa: string;
  }): Promise<any> => {
    try {
      console.log('[Recomendacao Service] Criando recomendação:', data);
      const response = await api.post('/api/recomendacoes', data);
      console.log('[Recomendacao Service] Recomendação criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Recomendacao Service] Erro ao criar recomendação:', error);
      throw error;
    }
  },

  listarRecomendacoes: async (filtros?: {
    status?: string;
    jovem_id?: number;
    oportunidade_id?: number;
  }): Promise<any> => {
    try {
      console.log('[Recomendacao Service] Listando recomendações');
      const params = new URLSearchParams();
      if (filtros?.status) params.append('status', filtros.status);
      if (filtros?.jovem_id) params.append('jovem_id', filtros.jovem_id.toString());
      if (filtros?.oportunidade_id) params.append('oportunidade_id', filtros.oportunidade_id.toString());
      
      const url = `/api/recomendacoes${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      console.log('[Recomendacao Service] Recomendações encontradas:', response.data.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('[Recomendacao Service] Erro ao listar recomendações:', error);
      throw error;
    }
  },

  atualizarStatusRecomendacao: async (id: number, status: 'em_processo' | 'contratado' | 'rejeitado'): Promise<any> => {
    try {
      console.log('[Recomendacao Service] Atualizando status da recomendação:', id, status);
      const response = await api.put(`/api/recomendacoes/${id}/status`, { status });
      console.log('[Recomendacao Service] Status atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Recomendacao Service] Erro ao atualizar status:', error);
      throw error;
    }
  }
};

// Serviço de Estatísticas
export const statsService = {
  getStats: async (): Promise<{ jovens: number; oportunidades: number; empresas: number; contratacoes: number; }> => {
    try {
      console.log('[Stats Service] Buscando estatísticas');
      const response = await api.get('/api/stats');
      console.log('[Stats Service] Estatísticas recuperadas:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Stats Service] Erro ao buscar estatísticas:', error);
      // Retornar valores padrão em caso de erro para não quebrar a página
      return { jovens: 0, oportunidades: 0, empresas: 0, contratacoes: 0 };
    }
  },

  getFeatured: async (): Promise<{ featured: any; others: any[] }> => {
    try {
      console.log('[Stats Service] Buscando dados em destaque');
      const response = await api.get('/api/stats/featured');
      console.log('[Stats Service] Dados em destaque recuperados:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Stats Service] Erro ao buscar dados em destaque:', error);
      return { featured: null, others: [] };
    }
  },
};

export default api; 