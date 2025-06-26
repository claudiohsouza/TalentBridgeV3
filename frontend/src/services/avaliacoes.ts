import api from './api';
import { Avaliacao, AvaliacaoInput, CategoriaAvaliacao } from '../types';

interface AvaliacoesResponse {
  avaliacoes: Avaliacao[];
  media_geral: number;
  total_avaliacoes: number;
}

export const avaliacoesService = {
  // Buscar categorias de avaliação
  obterCategorias: async (): Promise<CategoriaAvaliacao[]> => {
    const response = await api.get('/api/avaliacoes/categorias');
    console.log('[AvaliacoesService] Resposta categorias:', response.data);
    return response.data.data || response.data;
  },

  // Buscar avaliações de um jovem
  obterAvaliacoesJovem: async (jovemId: number): Promise<AvaliacoesResponse> => {
    console.log('[AvaliacoesService] Buscando avaliações para jovem:', jovemId);
    const response = await api.get(`/api/avaliacoes/jovem/${jovemId}`);
    console.log('[AvaliacoesService] Resposta avaliações:', response.data);
    return response.data.data || response.data;
  },

  // Criar nova avaliação
  criarAvaliacao: async (jovemId: number, avaliacao: AvaliacaoInput): Promise<Avaliacao> => {
    const response = await api.post(`/api/avaliacoes/jovem/${jovemId}`, avaliacao);
    console.log('[AvaliacoesService] Nova avaliação criada:', response.data);
    return response.data.data || response.data;
  },

  // Atualizar avaliação
  atualizarAvaliacao: async (avaliacaoId: number, avaliacao: Partial<AvaliacaoInput>): Promise<Avaliacao> => {
    const response = await api.put(`/api/avaliacoes/${avaliacaoId}`, avaliacao);
    return response.data.data || response.data;
  },

  // Excluir avaliação
  excluirAvaliacao: async (avaliacaoId: number): Promise<void> => {
    await api.delete(`/api/avaliacoes/${avaliacaoId}`);
  }
}; 