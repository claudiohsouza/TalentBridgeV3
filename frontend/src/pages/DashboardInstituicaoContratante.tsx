import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jovemService, oportunidadeService, recomendacaoService } from '../services/api';
import { Jovem, Oportunidade, Recomendacao } from '../types';

interface Stats {
  jovensRecomendados: number;
  oportunidadesAtivas: number;
  contratacoesRealizadas: number;
}

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

// Novo componente para gerenciar o status da recomendação
const StatusContratacao: React.FC<{ recomendacao: Partial<Recomendacao>, onStatusChange: () => void }> = ({ recomendacao, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (novoStatus: 'em_processo' | 'contratado' | 'rejeitado') => {
    if (!recomendacao.id) return; // Garante que o ID existe

    console.log('[StatusContratacao] Tentando atualizar status:', {
      recomendacaoId: recomendacao.id,
      novoStatus,
      recomendacaoData: recomendacao
    });

    setLoading(true);
    try {
      await recomendacaoService.atualizarStatusRecomendacao(recomendacao.id, novoStatus);
      console.log('[StatusContratacao] Status atualizado com sucesso');
      onStatusChange();
    } catch (error) {
      console.error("[StatusContratacao] Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    const status = recomendacao.status as Recomendacao['status']; // Type assertion
    switch (status) {
      case 'pendente': return <span className="badge badge-warning">Pendente</span>;
      case 'em_processo': return <span className="badge badge-info">Em Processo</span>;
      case 'contratado': return <span className="badge badge-success">Contratado</span>;
      case 'rejeitado': return <span className="badge badge-error">Rejeitado</span>;
      default: return <span className="badge">{status}</span>;
    }
  };
  
  const renderAcoes = () => {
    if (loading) {
      return <div className="spinner-sm"></div>;
    }
    const status = recomendacao.status as Recomendacao['status']; // Type assertion
    switch (status) {
      case 'pendente':
        return (
          <>
            <button onClick={() => handleUpdateStatus('em_processo')} className="btn-sm btn-primary">Iniciar Processo</button>
            <button onClick={() => handleUpdateStatus('rejeitado')} className="btn-sm btn-secondary">Rejeitar</button>
          </>
        );
      case 'em_processo':
        return (
          <>
            <button onClick={() => handleUpdateStatus('contratado')} className="btn-sm btn-primary">Marcar Contratado</button>
            <button onClick={() => handleUpdateStatus('rejeitado')} className="btn-sm btn-secondary">Rejeitar</button>
          </>
        );
      case 'contratado':
      case 'rejeitado':
        return null; // Nenhuma ação disponível
      default:
        return null;
    }
  };

  return (
    <div className="bg-cursor-background-light p-3 rounded-lg flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-cursor-text-primary truncate">{recomendacao.oportunidade_titulo || 'Oportunidade'}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {renderStatusBadge()}
        {renderAcoes()}
      </div>
    </div>
  );
};

const DashboardInstituicaoContratante: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [stats, setStats] = useState<Stats>({
    jovensRecomendados: 0,
    oportunidadesAtivas: 0,
    contratacoesRealizadas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('todas');

  // Modal states
  const [showJovemModal, setShowJovemModal] = useState(false);
  const [selectedJovem, setSelectedJovem] = useState<Jovem | null>(null);

  useEffect(() => {
    console.log('[DashboardInstituicaoContratante] User role:', user?.papel);
    console.log('[DashboardInstituicaoContratante] User data:', user);
    fetchData();
  }, [user]);

  // Efeito para sincronizar o jovem selecionado no modal com a lista principal
  useEffect(() => {
    if (selectedJovem && jovens.length > 0) {
      const jovemAtualizado = jovens.find(j => j.id === selectedJovem.id);
      if (jovemAtualizado && JSON.stringify(jovemAtualizado) !== JSON.stringify(selectedJovem)) {
        setSelectedJovem(jovemAtualizado);
      }
    }
  }, [jovens, selectedJovem]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar jovens com pontuação já calculada pelo backend
      const jovensData = await jovemService.listarJovensRecomendados();
      setJovens(jovensData);

      // Buscar todas as recomendações para contar as contratações
      const recomendacoesResult = await recomendacaoService.listarRecomendacoes();
      const todasRecomendacoes = recomendacoesResult.data || [];
      const contratacoes = todasRecomendacoes.filter((rec: Recomendacao) => rec.status === 'contratado').length;

      // Buscar oportunidades
      const oportunidadesData = await oportunidadeService.listarOportunidades();
      setOportunidades(oportunidadesData);

      // Calcular estatísticas
      const oportunidadesAtivas = oportunidadesData.length;

      setStats({
        jovensRecomendados: jovensData.length,
        oportunidadesAtivas,
        contratacoesRealizadas: contratacoes,
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleJovemClick = (jovem: Jovem) => {
    setSelectedJovem(jovem);
    setShowJovemModal(true);
  };

  const filteredJovens = jovens.filter(jovem => {
    const matchesSearch = jovem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jovem.formacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'todas' || 
                       (jovem.habilidades && jovem.habilidades.some(h => h.toLowerCase().includes(selectedArea.toLowerCase())));
    return matchesSearch && matchesArea;
  });

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-blue-500/20 to-purple-500/20',
      'from-green-500/20 to-blue-500/20',
      'from-purple-500/20 to-pink-500/20',
      'from-orange-500/20 to-red-500/20',
      'from-teal-500/20 to-cyan-500/20'
    ];
    return gradients[index % gradients.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta': return 'bg-green-100 text-green-800';
      case 'Fechada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderJovemModal = () => {
    if (!selectedJovem) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 fade-in">
        <div className="bg-cursor-background-light rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-transition">
          <div className="p-6 border-b border-cursor-border">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-cursor-text-primary">Perfil do Jovem</h2>
              <button 
                onClick={() => setShowJovemModal(false)}
                className="text-cursor-text-tertiary hover:text-cursor-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Informações Básicas */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cursor-primary to-cursor-secondary flex items-center justify-center text-white font-bold text-2xl">
                {selectedJovem.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-cursor-text-primary">{selectedJovem.nome}</h3>
                <p className="text-cursor-text-secondary">{selectedJovem.email}</p>
                <p className="text-cursor-text-secondary">{formatarFormacao(selectedJovem.formacao)}</p>
              </div>
            </div>

            {/* Habilidades */}
            {selectedJovem.habilidades && selectedJovem.habilidades.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-cursor-text-primary mb-3">Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJovem.habilidades.map((habilidade, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {habilidade}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interesses */}
            {selectedJovem.interesses && selectedJovem.interesses.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-cursor-text-primary mb-3">Interesses</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJovem.interesses.map((interesse, idx) => (
                    <span key={idx} className="badge badge-secondary">
                      {interesse}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Planos Futuros */}
            {selectedJovem.planos_futuros && (
              <div>
                <h4 className="text-lg font-semibold text-cursor-text-primary mb-3">Planos Futuros</h4>
                <p className="text-cursor-text-secondary">{selectedJovem.planos_futuros}</p>
              </div>
            )}

            {/* Recomendações */}
            <h4 className="text-lg font-bold text-cursor-text-primary mt-8 mb-4">Recomendações Recebidas</h4>
            <div className="space-y-4">
              {selectedJovem.recomendacoes && selectedJovem.recomendacoes.length > 0 ? (
                selectedJovem.recomendacoes.map(rec => (
                  <StatusContratacao
                    key={rec.id}
                    recomendacao={{
                      id: rec.id,
                      status: rec.status,
                      oportunidade_titulo: rec.oportunidade_titulo
                    }}
                    onStatusChange={fetchData}
                  />
                ))
              ) : (
                <p className="text-cursor-text-tertiary text-sm">Nenhuma recomendação encontrada para este jovem.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cursor-background via-cursor-background-light to-cursor-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner rounded-full h-12 w-12 border-b-2 border-cursor-primary mx-auto mb-4"></div>
          <p className="text-cursor-text-secondary">Carregando talentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cursor-background via-cursor-background-light to-cursor-background page-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Moderno */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cursor-primary via-purple-500 to-cursor-secondary bg-clip-text text-transparent">
              Encontre Talentos Excepcionais
            </span>
          </h1>
          <p className="text-xl text-cursor-text-secondary max-w-3xl mx-auto">
            Conecte-se com jovens recomendados que combinam perfeitamente com suas oportunidades
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 text-center hover:border-cursor-primary transition-all duration-300 card-transition stagger-item group">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cursor-primary/20 to-purple-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-cursor-text-primary mb-2">{stats.jovensRecomendados}</div>
            <div className="text-cursor-text-secondary">Jovens Recomendados</div>
          </div>

          <div className="card p-6 text-center hover:border-cursor-secondary transition-all duration-300 card-transition stagger-item group">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cursor-secondary/20 to-blue-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-cursor-text-primary mb-2">{stats.oportunidadesAtivas}</div>
            <div className="text-cursor-text-secondary">Oportunidades Ativas</div>
          </div>

          <div className="card p-6 text-center hover:border-purple-500 transition-all duration-300 card-transition stagger-item group">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-cursor-text-primary mb-2">{stats.contratacoesRealizadas}</div>
            <div className="text-cursor-text-secondary">Contratações Realizadas</div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card p-6 mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
              <input
                type="text"
                  placeholder="Buscar por nome ou formação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-cursor-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
            <div className="md:w-48">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="input-field w-full"
              >
                <option value="todas">Todas as áreas</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="marketing">Marketing</option>
                <option value="administração">Administração</option>
                <option value="engenharia">Engenharia</option>
                <option value="rh">Recursos Humanos</option>
              </select>
            </div>
              </div>
              </div>

        {/* Seção de Jovens Recomendados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cursor-text-primary mb-6 fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
              Jovens em Destaque
            </span>
          </h2>

          {filteredJovens.length === 0 ? (
            <div className="text-center py-12 fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="h-24 w-24 mx-auto mb-4 text-cursor-text-tertiary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                Nenhum jovem encontrado
                </h3>
              <p className="text-cursor-text-secondary">
                Tente ajustar os filtros de busca
                </p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJovens.map((jovem, index) => (
                <div
                  key={jovem.id}
                  className={`card p-6 hover:border-cursor-primary transition-all duration-300 cursor-pointer card-transition stagger-item group bg-gradient-to-br ${getGradientClass(index)}`}
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  onClick={() => handleJovemClick(jovem)}
                >
                  {/* Avatar e Informações Básicas */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cursor-primary to-cursor-secondary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                      {jovem.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{jovem.nome}</h3>
                      <p className="text-sm text-gray-300">{formatarFormacao(jovem.formacao)}</p>
                    </div>
                  </div>

                  {/* Habilidades Principais */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-cursor-text-secondary mb-2 uppercase tracking-wider">
                      Habilidades Principais
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jovem.habilidades && jovem.habilidades.length > 0 && (
                        jovem.habilidades.slice(0, 3).map((habilidade, idx) => (
                          <span
                            key={idx}
                            className="badge badge-primary text-xs px-2 py-1"
                          >
                            {habilidade}
                          </span>
                        ))
                      )}
                      {jovem.habilidades && jovem.habilidades.length > 3 && (
                        <span className="text-cursor-text-tertiary text-xs">
                          +{jovem.habilidades.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recomendações */}
                  {jovem.recomendacoes && jovem.recomendacoes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-cursor-text-secondary mb-2 uppercase tracking-wider">
                        Recomendado para
                      </p>
                      <div className="space-y-1">
                        {jovem.recomendacoes.slice(0, 2).map((rec, idx) => (
                          <div key={idx} className="text-sm text-cursor-text-primary bg-cursor-background-light/50 p-2 rounded">
                            {rec.oportunidade_titulo || 'Vaga não especificada'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão de Contato */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJovemClick(jovem);
                    }}
                    className="w-full btn-primary mt-4 group-hover:bg-cursor-primary-dark transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                    Entrar em Contato
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Oportunidades */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-cursor-text-primary mb-6 fade-in" style={{ animationDelay: '0.5s' }}>
            <span className="bg-gradient-to-r from-cursor-secondary to-purple-500 bg-clip-text text-transparent">
              Oportunidades Disponíveis
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oportunidades.slice(0, 6).map((oportunidade, index) => (
              <div
                key={oportunidade.id}
                className="card p-6 hover:border-cursor-secondary transition-all duration-300 card-transition stagger-item group"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cursor-text-primary group-hover:text-cursor-secondary transition-colors">
                      {oportunidade.titulo}
                </h3>
                    <p className="text-sm text-cursor-text-secondary">{oportunidade.empresa_nome}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(oportunidade.status)}`}>
                    {oportunidade.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-cursor-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-cursor-text-secondary">{oportunidade.tipo}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-cursor-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-cursor-text-secondary">{oportunidade.area}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-cursor-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-cursor-text-secondary">
                      {oportunidade.total_recomendacoes || 0} recomendações
                    </span>
                  </div>
                </div>

                <button className="w-full btn-secondary mt-4 group-hover:bg-cursor-secondary-dark transition-colors">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Jovem */}
      {showJovemModal && selectedJovem && renderJovemModal()}
    </div>
  );
};

export default DashboardInstituicaoContratante; 