/**
 * Tipos comuns para o frontend
 */

// Tipos de usuário
export type UserRole = 'instituicao_ensino' | 'chefe_empresa' | 'instituicao_contratante';

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  verificado?: boolean;
  perfil?: any;
  criado_em?: string;
  atualizado_em?: string;
}

// Autenticação
export interface AuthResponse {
  token: string;
  papel: UserRole;
  usuario: User;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  email: string;
  senha: string;
  nome: string;
  papel: UserRole;
  localizacao: string;
  dadosPerfil?: {
    // Campos para instituição de ensino
    tipo?: string;
    areas_ensino?: string[];
    qtd_alunos?: number;
    // Campos para chefe de empresa
    empresa?: string;
    setor?: string;
    porte?: string;
    areas_atuacao?: string[];
    cargo?: string;
    // Campos para instituição contratante
    areas_interesse?: string[];
    programas_sociais?: string[];
  };
}

// Jovem
export interface Jovem {
  id: number;
  nome: string;
  email: string;
  idade: number;
  formacao: string;
  curso?: string;
  tipo?: string;
  area?: string;
  habilidades: string[];
  interesses: string[];
  planos_futuros: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado' | 'ativo' | 'Ativo' | 'Pendente' | 'Aprovado';
  empresas?: {
    id: number;
    nome: string;
    cargo: string;
    status: 'Contratado' | 'Estagiário' | 'Desligado';
  }[];
  criado_em: string;
  atualizado_em: string;
  ultima_atualizacao: string;
  oportunidades?: {
    id: number;
    titulo: string;
    status: string;
  }[];
  avaliacoes?: Avaliacao[];
  historico?: HistoricoDesenvolvimento[];
  badges?: JovemBadge[];
  media_geral?: number;
  pontuacao_desenvolvimento?: number;
  total_avaliacoes?: number;
  recomendacoes?: Recomendacao[];
}

export interface JovemInput {
  nome: string;
  email: string;
  idade: number;
  formacao?: string;
  curso?: string;
  habilidades?: string[];
  interesses?: string[];
  planos_futuros?: string;
}

// Oportunidade
export interface Oportunidade {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  requisitos: string[] | string;
  area: string;
  salario: string;
  beneficios: string[] | string;
  horario: string;
  local: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
  total_recomendacoes?: number;
  data_inicio?: string;
  data_fim?: string;
  empresa_id: number;
  empresa_nome?: string;
  empresa_representante?: string;
  is_owner?: boolean;
  recomendacoes?: Recomendacao[];
  criado_em: string;
  atualizado_em: string;
  vagas_preenchidas?: number;
}

export interface OportunidadeInput {
  titulo: string;
  descricao: string;
  tipo: string;
  area: string;
  requisitos?: string[];
  beneficios?: string[];
  data_inicio?: string;
  data_fim?: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
}

// Recomendação
export interface Recomendacao {
  id: number;
  jovem_id: number;
  oportunidade_id: number;
  recomendador_tipo: string;
  recomendador_id: number;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado' | 'em_processo' | 'contratado';
  jovem_nome?: string;
  jovem_email?: string;
  jovem_formacao?: string;
  jovem_idade?: number;
  recomendador_nome?: string;
  oportunidade_titulo?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface RecomendacaoInput {
  jovem_id: number;
  oportunidade_id: number;
  justificativa: string;
}

// Respostas de API
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: string;
  usuario?: User;
  token?: string;
  papel?: UserRole;
}

// Rotas
export interface BreadcrumbItem {
  label: string;
  path: string;
}

// Estado global da aplicação
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Avaliações
export interface CategoriaAvaliacao {
  id: number;
  nome: string;
  descricao: string;
  peso: number;
}

export interface Avaliacao {
  id: number;
  jovem_id: number;
  avaliador_tipo: 'instituicao_ensino' | 'chefe_empresa';
  avaliador_id: number;
  categoria_id: number;
  nota: number;
  comentario?: string;
  evidencias?: string[];
  criado_em: string;
  atualizado_em: string;
  categoria?: CategoriaAvaliacao;
  // Campos adicionais que vêm da API
  categoria_nome?: string;
  categoria_descricao?: string;
  categoria_peso?: number;
  avaliador_nome?: string;
}

export interface AvaliacaoInput {
  categoria_id: number;
  nota: number;
  comentario?: string;
  evidencias?: string[];
}

// Histórico de desenvolvimento
export interface HistoricoDesenvolvimento {
  id: number;
  jovem_id: number;
  tipo: 'certificacao' | 'curso' | 'projeto' | 'conquista';
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data_conclusao?: string;
  instituicao?: string;
  comprovante_url?: string;
  validado: boolean;
  validado_por?: number;
  criado_em: string;
}

export interface HistoricoDesenvolvimentoInput {
  tipo: 'certificacao' | 'curso' | 'projeto' | 'conquista';
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data_conclusao?: string;
  instituicao?: string;
  comprovante_url?: string;
}

// Badges
export interface Badge {
  id: number;
  nome: string;
  descricao?: string;
  icone_url?: string;
  criterios?: Record<string, any>;
  criado_em: string;
}

export interface JovemBadge {
  jovem_id: number;
  badge_id: number;
  data_conquista: string;
  concedido_por?: number;
  badge?: Badge;
}

// Interfaces para o serviço de opções
export interface OpcoesResponse {
  [categoria: string]: string[];
}

export interface OpcaoPadrao {
  id: number;
  valor: string;
  descricao?: string;
}

export interface OpcoesService {
  obterTodasOpcoes: () => Promise<OpcoesResponse>;
  obterOpcoesPorCategoria: (categoria: string) => Promise<OpcaoPadrao[]>;
  inicializarOpcoes: (limpar?: boolean) => Promise<any>;
  CATEGORIAS: {
    AREAS_ENSINO: string;
    AREAS_ATUACAO: string;
    AREAS_INTERESSE: string;
    PROGRAMAS_SOCIAIS: string;
    TIPOS_INSTITUICAO: string;
    TIPOS_INSTITUICAO_ENSINO: string;
    SETORES_EMPRESA: string;
    PORTES_EMPRESA: string;
  };
} 