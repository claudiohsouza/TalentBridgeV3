import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Jovem, 
  Avaliacao, 
  AvaliacaoInput,
  HistoricoDesenvolvimento,
  HistoricoDesenvolvimentoInput
} from '../types';
import { AvaliacoesJovem } from '../components/AvaliacoesJovem';
import { avaliacoesService } from '../services/avaliacoes';
import { jovemService, contatoService } from '../services/api';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

// Função para formatar a formação
const formatarFormacao = (formacao: string): string => {
  const formatacoes: { [key: string]: string } = {
    'ensino_medio': 'Ensino Médio',
    'tecnico': 'Técnico',
    'superior': 'Superior',
    'pos_graduacao': 'Pós-Graduação'
  };
  return formatacoes[formacao] || formacao;
};

// Função para formatar tipo e área
const formatarTipoArea = (valor: string): string => {
  if (!valor) return '';
  return valor
    .split('_')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
};

// Função para formatar texto com primeira letra maiúscula
const capitalizarPalavras = (texto: string | undefined | null): string => {
  if (!texto || typeof texto !== 'string') {
    return '';
  }
  return texto.split(' ').map(palavra => 
    palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
  ).join(' ');
};

// Modal de Contato
const ContactModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  jovem: Jovem;
  user: any;
}> = ({ isOpen, onClose, jovem, user }) => {
  const [formData, setFormData] = useState({
    assunto: '',
    mensagem: '',
    tipoContato: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar o serviço real de contato
      await contatoService.enviarContato({
        jovem_id: jovem.id,
        assunto: formData.assunto,
        mensagem: formData.mensagem,
        tipo_contato: formData.tipoContato
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ assunto: '', mensagem: '', tipoContato: 'email' });
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      // Aqui você poderia adicionar um estado de erro para mostrar mensagem ao usuário
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cursor-background-light border border-cursor-border rounded-lg p-6 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-cursor-text-primary">
            Entrar em Contato
          </h2>
          <button
            onClick={onClose}
            className="text-cursor-text-tertiary hover:text-cursor-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
              Contato Enviado!
            </h3>
            <p className="text-cursor-text-secondary">
              Sua mensagem foi enviada com sucesso para {jovem.nome}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Para
              </label>
              <div className="p-3 bg-cursor-background border border-cursor-border rounded-lg">
                <p className="text-cursor-text-primary font-medium">{jovem.nome}</p>
                <p className="text-cursor-text-secondary text-sm">{jovem.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Tipo de Contato
              </label>
              <select
                value={formData.tipoContato}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoContato: e.target.value }))}
                className="input-field w-full"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telefone">Telefone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Assunto *
              </label>
              <input
                type="text"
                value={formData.assunto}
                onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
                placeholder="Ex: Oportunidade de estágio"
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Mensagem *
              </label>
              <textarea
                value={formData.mensagem}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                placeholder="Digite sua mensagem..."
                rows={4}
                className="input-field w-full resize-none"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Contato'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const JovemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jovem, setJovem] = useState<Jovem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [mediaGeral, setMediaGeral] = useState<number>(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState<number>(0);
  const [historico, setHistorico] = useState<HistoricoDesenvolvimento[]>([]);
  const [selectedHabilidades, setSelectedHabilidades] = useState<string[]>([]);
  const [selectedInteresses, setSelectedInteresses] = useState<string[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('ID do jovem não fornecido');
          return;
        }

        console.log(`[JovemDetails] Iniciando carregamento de dados para jovem ${id}`);

        // Buscar dados do jovem
        try {
          const jovemData = await jovemService.getJovem(Number(id));
          console.log('[JovemDetails] Dados do jovem carregados:', jovemData);
          setJovem(jovemData);
          setSelectedHabilidades(jovemData.habilidades || []);
          setSelectedInteresses(jovemData.interesses || []);
        } catch (error: any) {
          console.error('[JovemDetails] Erro ao carregar dados do jovem:', error);
          setError(error.message || 'Erro ao carregar dados do jovem');
          return;
        }

        // Buscar avaliações
        try {
          console.log('[JovemDetails] Iniciando busca de avaliações para jovem:', id);
          const avaliacoesData = await avaliacoesService.obterAvaliacoesJovem(Number(id));
          console.log('[JovemDetails] Dados de avaliações recebidos:', avaliacoesData);
          
          if (avaliacoesData && typeof avaliacoesData === 'object') {
            setAvaliacoes(avaliacoesData.avaliacoes || []);
            setMediaGeral(avaliacoesData.media_geral || 0);
            setTotalAvaliacoes(avaliacoesData.total_avaliacoes || 0);
            console.log('[JovemDetails] Avaliações configuradas:', {
              quantidade: avaliacoesData.avaliacoes?.length || 0,
              media: avaliacoesData.media_geral || 0,
              total: avaliacoesData.total_avaliacoes || 0
            });
          } else {
            console.warn('[JovemDetails] Estrutura de dados de avaliações inesperada:', avaliacoesData);
            setAvaliacoes([]);
            setMediaGeral(0);
            setTotalAvaliacoes(0);
          }
        } catch (error: any) {
          console.error('[JovemDetails] Erro ao carregar avaliações:', error);
          console.error('[JovemDetails] Detalhes do erro:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          // Definir valores padrão em caso de erro
          setAvaliacoes([]);
          setMediaGeral(0);
          setTotalAvaliacoes(0);
        }

        // Buscar histórico
        try {
          const historicoData = await jovemService.obterHistoricoJovem(Number(id));
          setHistorico(historicoData);
          console.log('[JovemDetails] Histórico carregado com sucesso');
        } catch (error: any) {
          console.error('[JovemDetails] Erro ao carregar histórico:', error);
        }
      } catch (error: any) {
        console.error('[JovemDetails] Erro geral ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddAvaliacao = async (avaliacaoInput: AvaliacaoInput) => {
    try {
      const novaAvaliacao = await avaliacoesService.criarAvaliacao(Number(id), avaliacaoInput);
      setAvaliacoes(prev => [novaAvaliacao, ...prev]);
      
      // Atualizar média e total
      const avaliacoesData = await avaliacoesService.obterAvaliacoesJovem(Number(id));
      setMediaGeral(avaliacoesData.media_geral);
      setTotalAvaliacoes(avaliacoesData.total_avaliacoes);
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  };

  const handleAddHistorico = async (historico: HistoricoDesenvolvimentoInput) => {
    try {
      await jovemService.adicionarHistorico(Number(id), historico);
      // Atualizar a lista de histórico
      const historicoData = await jovemService.obterHistoricoJovem(Number(id));
      setHistorico(historicoData);
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este jovem?')) {
      return;
    }

    try {
      await jovemService.excluirJovem(Number(id));
      
      // Redirecionar para o dashboard específico do papel do usuário
      if (user?.papel === 'instituicao_ensino') {
        navigate('/instituicao-ensino');
      } else if (user?.papel === 'chefe_empresa') {
        navigate('/chefe-empresa');
      } else if (user?.papel === 'instituicao_contratante') {
        navigate('/instituicao-contratante');
      } else if (user?.papel) {
        // Mapear o papel para a URL correta
        const papelParaUrl = {
          'instituicao_ensino': 'instituicao-ensino',
          'chefe_empresa': 'chefe-empresa',
          'instituicao_contratante': 'instituicao-contratante'
        };
        navigate(`/${papelParaUrl[user.papel]}/jovens`);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao excluir jovem. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!jovem) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
              {error || 'Jovem não encontrado'}
            </h3>
            <button 
              onClick={() => {
                const papelParaUrl = {
                  'instituicao_ensino': 'instituicao-ensino',
                  'chefe_empresa': 'chefe-empresa',
                  'instituicao_contratante': 'instituicao-contratante'
                };
                const urlPapel = user?.papel ? papelParaUrl[user.papel] : '';
                navigate(`/${urlPapel}/jovens`);
              }}
              className="btn-primary mt-4"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Botão de Voltar */}
        <div className="mb-4">
          <button
            onClick={() => {
              const papelParaUrl = {
                'instituicao_ensino': 'instituicao-ensino',
                'chefe_empresa': 'chefe-empresa',
                'instituicao_contratante': 'instituicao-contratante'
              };
              const urlPapel = user?.papel ? papelParaUrl[user.papel] : '';
              navigate(`/${urlPapel}/jovens`);
            }}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cursor-text-primary">{jovem.nome}</h1>
            <p className="text-cursor-text-secondary mt-1">
              {formatarFormacao(jovem.formacao)} • {jovem.curso || 'Sem curso especificado'}
            </p>
          </div>
          <div className="flex gap-4">
            {/* Botões movidos para dentro do componente AvaliacoesJovem */}
            {user?.papel === 'instituicao_contratante' && (
              <button
                onClick={() => setShowContactModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Entrar em Contato
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">Desempenho</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-cursor-text-primary">{(mediaGeral ?? 0).toFixed(1)}</span>
              <span className="text-cursor-text-secondary mb-1">/10</span>
            </div>
            <p className="text-sm text-cursor-text-secondary mt-2">
              Baseado em {totalAvaliacoes} avaliações
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">Status</h3>
            <div className="flex items-center gap-2 mt-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 capitalize ${
                jovem.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                jovem.status === 'rejeitado' || jovem.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={jovem.status === 'aprovado' ? 
                      "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : 
                      "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
                {jovem.status}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades</h3>
            <div className="flex items-end gap-2">
              {jovem.oportunidades && jovem.oportunidades.length > 0 ? (
                <span className="text-3xl font-bold text-cursor-text-primary">
                  {jovem.oportunidades.length}
                </span>
              ) : (
                <span className="text-cursor-text-tertiary text-base font-medium">Ainda não recomendado</span>
              )}
            </div>
            {jovem.oportunidades && jovem.oportunidades.length > 0 && (
              <div className="mt-4 space-y-2">
                {jovem.oportunidades.map((oportunidade) => (
                  <div key={oportunidade.id} className="p-3 bg-cursor-background-light rounded-lg border border-cursor-border">
                    <div className="flex justify-between items-center">
                      <span className="text-cursor-text-primary font-medium">{oportunidade.titulo}</span>
                      <span className={`badge ${
                        oportunidade.status === 'aprovado' ? 'badge-success' : 
                        oportunidade.status === 'pendente' ? 'badge-warning' : 
                        'badge-default'
                      }`}>
                        {oportunidade.status === 'aprovado' ? 'Aberta' : 
                         oportunidade.status === 'pendente' ? 'Pendente' : 
                         oportunidade.status === 'rejeitado' ? 'Rejeitada' : 
                         oportunidade.status === 'cancelado' ? 'Cancelada' : 
                         oportunidade.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações Pessoais */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-cursor-text-primary mb-6">Informações Pessoais</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Nome</label>
                  <p className="text-cursor-text-primary">{jovem.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Email</label>
                  <p className="text-cursor-text-primary">{jovem.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Idade</label>
                  <p className="text-cursor-text-primary">{jovem.idade} anos</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Formação</label>
                  <p className="text-cursor-text-primary">{formatarFormacao(jovem.formacao)}</p>
                </div>
                {jovem.curso && (
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Curso</label>
                    <p className="text-cursor-text-primary">{jovem.curso}</p>
                  </div>
                )}
                {jovem.tipo && (
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Tipo</label>
                    <p className="text-cursor-text-primary">{formatarTipoArea(jovem.tipo)}</p>
                  </div>
                )}
                {jovem.area && (
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Área</label>
                    <p className="text-cursor-text-primary">{formatarTipoArea(jovem.area)}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Habilidades</label>
                <div className="p-3 rounded-lg bg-cursor-bg border border-cursor-border flex flex-wrap gap-2">
                  {jovem.habilidades && jovem.habilidades.length > 0 ? (
                    jovem.habilidades.map((habilidade, idx) => (
                      <span key={idx} className="inline-block bg-cursor-background-light text-cursor-text-primary px-3 py-1 rounded-full text-sm border border-cursor-border">
                        {typeof habilidade === 'string'
                          ? habilidade.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          : String(habilidade)}
                      </span>
                    ))
                  ) : (
                    <span className="text-cursor-text-tertiary">Nenhuma habilidade informada</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Interesses</label>
                <div className="p-3 rounded-lg bg-cursor-bg border border-cursor-border flex flex-wrap gap-2">
                  {jovem.interesses && jovem.interesses.length > 0 ? (
                    jovem.interesses.map((interesse, idx) => (
                      <span key={idx} className="inline-block bg-cursor-background-light text-cursor-text-primary px-3 py-1 rounded-full text-sm border border-cursor-border">
                        {typeof interesse === 'string'
                          ? interesse.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          : String(interesse)}
                      </span>
                    ))
                  ) : (
                    <span className="text-cursor-text-tertiary">Nenhum interesse informado</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-1">Planos Futuros</label>
                <p className="text-cursor-text-primary whitespace-pre-wrap">{jovem.planos_futuros}</p>
              </div>
            </div>
          </div>

          {/* Avaliações e Histórico */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-cursor-text-primary mb-6">Avaliações e Histórico</h2>
            <AvaliacoesJovem
              jovemId={Number(id)}
              avaliacoes={avaliacoes}
              historico={historico}
              badges={jovem.badges || []}
              mediaGeral={mediaGeral}
              onAddAvaliacao={handleAddAvaliacao}
              onAddHistorico={handleAddHistorico}
            />
          </div>
        </div>

        {/* Modal de Contato */}
        {jovem && user && (
          <ContactModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            jovem={jovem}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default JovemDetails; 