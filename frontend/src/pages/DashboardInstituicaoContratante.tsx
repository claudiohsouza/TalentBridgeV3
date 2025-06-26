import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jovemService, oportunidadeService, recomendacaoService } from '../services/api';
import { Jovem, Oportunidade, Recomendacao } from '../types';
import { FaEye, FaUserCheck, FaUserTimes, FaClock, FaChartLine, FaUsers, FaBriefcase, FaHandshake, FaTimes, FaUser, FaGraduationCap, FaBrain, FaHeart, FaMapMarkerAlt, FaCalendar, FaCheck, FaTrophy, FaSpinner, FaStar, FaBookmark, FaAward, FaBuilding, FaRocket, FaLightbulb, FaGem, FaExclamationTriangle, FaSync, FaCode, FaBullseye } from 'react-icons/fa';

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

const StatusContratacao: React.FC<{ recomendacao: Partial<Recomendacao>, onStatusChange: () => void }> = ({ recomendacao, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  
  const handleUpdateStatus = async (novoStatus: 'em_processo' | 'contratado' | 'rejeitado') => {
    if (!recomendacao.id) return;
    
    setLoading(true);
    try {
      await recomendacaoService.atualizarStatusRecomendacao(recomendacao.id, novoStatus);
      onStatusChange();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    switch (recomendacao.status) {
      case 'pendente':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><FaClock className="w-3 h-3" />Pendente</span>;
      case 'em_processo':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><FaSpinner className="w-3 h-3 animate-spin" />Em Processo</span>;
      case 'contratado':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><FaCheck className="w-3 h-3" />Contratado</span>;
      case 'rejeitado':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><FaTimes className="w-3 h-3" />Rejeitado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Indefinido</span>;
    }
  };

  const renderAcoes = () => {
    if (recomendacao.status === 'contratado' || recomendacao.status === 'rejeitado') {
      return <div className="text-xs text-cursor-text-tertiary font-medium">Status final</div>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {recomendacao.status === 'pendente' && (
          <button
            onClick={() => handleUpdateStatus('em_processo')}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm hover:shadow-md"
          >
            <FaClock className="w-3 h-3" />
            Processar
          </button>
        )}
        
        {(recomendacao.status === 'pendente' || recomendacao.status === 'em_processo') && (
          <>
            <button
              onClick={() => handleUpdateStatus('contratado')}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm hover:shadow-md"
            >
              <FaUserCheck className="w-3 h-3" />
              Contratar
            </button>
            <button
              onClick={() => handleUpdateStatus('rejeitado')}
              disabled={loading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm hover:shadow-md"
            >
              <FaUserTimes className="w-3 h-3" />
              Rejeitar
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-cursor-text-secondary">Status:</span>
        {renderStatusBadge()}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-cursor-text-secondary">Ações:</span>
        {renderAcoes()}
      </div>
    </div>
  );
};

const DashboardInstituicaoContratante: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    jovensRecomendados: 0,
    oportunidadesAtivas: 0,
    contratacoesRealizadas: 0
  });
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [filteredJovens, setFilteredJovens] = useState<Jovem[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [selectedJovem, setSelectedJovem] = useState<Jovem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (user?.papel !== 'instituicao_contratante') {
      console.error('Usuário não autorizado para este dashboard');
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jovensData = await jovemService.listarJovensRecomendados();
      console.log('Dados dos jovens recomendados:', jovensData);
      
      // Ordenar por nome por padrão
      const sortedJovens = jovensData.sort((a, b) => a.nome.localeCompare(b.nome));
      
      setJovens(sortedJovens);
      setFilteredJovens(sortedJovens);
      
      // Calcular estatísticas
      const totalRecomendados = jovensData.length;
      const totalContratados = jovensData.filter(j => j.status === 'aprovado' || j.status === 'Aprovado').length;
      
      setStats({
        jovensRecomendados: totalRecomendados,
        oportunidadesAtivas: jovensData.reduce((acc, j) => {
          const oportunidadesUnicas = new Set(j.recomendacoes?.map((r: any) => r.oportunidade_id) || []);
          return acc + oportunidadesUnicas.size;
        }, 0),
        contratacoesRealizadas: totalContratados
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleJovemClick = (jovem: Jovem) => {
    setSelectedJovem(jovem);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'Ativo': return 'text-cursor-success';
      case 'pendente':
      case 'Pendente': return 'text-cursor-warning';
      case 'aprovado':
      case 'Aprovado': return 'text-cursor-primary';
      default: return 'text-cursor-text-secondary';
    }
  };

  const renderJovemModal = () => {
    if (!selectedJovem || !isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-cursor-background-card border border-cursor-border rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-cursor-text-primary">{selectedJovem.nome}</h2>
              <p className="text-cursor-text-secondary">{selectedJovem.email}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors p-2"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <div className="bg-cursor-background rounded-xl p-5 border border-cursor-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cursor-primary/20 rounded-lg">
                  <FaUser className="w-5 h-5 text-cursor-primary" />
                </div>
                <h3 className="text-lg font-semibold text-cursor-text-primary">Informações Pessoais</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-cursor-text-secondary">Idade:</span>
                  <span className="ml-2 text-cursor-text-primary">{selectedJovem.idade} anos</span>
                </div>
                <div>
                  <span className="text-sm text-cursor-text-secondary">Formação:</span>
                  <span className="ml-2 text-cursor-text-primary">{formatarFormacao(selectedJovem.formacao || '')}</span>
                </div>
                <div>
                  <span className="text-sm text-cursor-text-secondary">Curso:</span>
                  <span className="ml-2 text-cursor-text-primary">{selectedJovem.curso || 'Não especificado'}</span>
                </div>
                <div>
                  <span className="text-sm text-cursor-text-secondary">Status:</span>
                  <span className={`ml-2 capitalize font-medium ${getStatusColor(selectedJovem.status || 'disponivel')}`}>
                    {selectedJovem.status === 'ativo' || selectedJovem.status === 'Ativo' ? 'Disponível' : 
                     selectedJovem.status === 'pendente' || selectedJovem.status === 'Pendente' ? 'Em Processo' : 
                     selectedJovem.status === 'aprovado' || selectedJovem.status === 'Aprovado' ? 'Contratado' : 'Não especificado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Habilidades */}
            <div className="bg-cursor-background rounded-xl p-5 border border-cursor-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cursor-secondary/20 rounded-lg">
                  <FaCode className="w-5 h-5 text-cursor-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-cursor-text-primary">Habilidades</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedJovem.habilidades?.length ? selectedJovem.habilidades.map((habilidade, index) => (
                  <span key={index} className="px-3 py-1 bg-cursor-primary/20 text-cursor-primary text-sm rounded-full border border-cursor-primary/30">
                    {habilidade}
                  </span>
                )) : (
                  <span className="text-cursor-text-secondary text-sm">Nenhuma habilidade registrada</span>
                )}
              </div>
            </div>

            {/* Interesses */}
            <div className="bg-cursor-background rounded-xl p-5 border border-cursor-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FaHeart className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-cursor-text-primary">Interesses</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedJovem.interesses?.length ? selectedJovem.interesses.map((interesse, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30">
                    {interesse}
                  </span>
                )) : (
                  <span className="text-cursor-text-secondary text-sm">Nenhum interesse registrado</span>
                )}
              </div>
            </div>

            {/* Planos Futuros */}
            <div className="bg-cursor-background rounded-xl p-5 border border-cursor-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cursor-warning/20 rounded-lg">
                  <FaBullseye className="w-5 h-5 text-cursor-warning" />
                </div>
                <h3 className="text-lg font-semibold text-cursor-text-primary">Planos Futuros</h3>
              </div>
              <p className="text-cursor-text-secondary text-sm">
                {selectedJovem.planos_futuros || 'Nenhum plano futuro especificado'}
              </p>
            </div>
          </div>

          {/* Recomendações */}
          <div className="mt-6 bg-cursor-background rounded-xl p-5 border border-cursor-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cursor-success/20 rounded-lg">
                <FaStar className="w-5 h-5 text-cursor-success" />
              </div>
              <h3 className="text-lg font-semibold text-cursor-text-primary">Recomendações Ativas</h3>
            </div>
            
            {selectedJovem.recomendacoes && selectedJovem.recomendacoes.length > 0 ? (
              <div className="space-y-4">
                {selectedJovem.recomendacoes.map((recomendacao, index) => (
                  <div key={index} className="bg-cursor-background-light rounded-lg p-4 border border-cursor-border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-cursor-text-primary">{recomendacao.oportunidade_titulo}</h4>
                        <p className="text-sm text-cursor-text-secondary mt-1">ID da Oportunidade: {recomendacao.oportunidade_id}</p>
                      </div>
                      <StatusContratacao 
                        recomendacao={recomendacao} 
                        onStatusChange={forceRefresh}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-cursor-text-secondary text-sm">Nenhuma recomendação ativa para este jovem</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      {/* Hero Section */}
      <section className="relative mb-12 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cursor-primary/10 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cursor-secondary/10 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-cursor-primary via-purple-500 to-cursor-secondary bg-clip-text text-transparent">
                Centro de Talentos
              </span>
            </h1>
            <p className="text-xl text-cursor-text-secondary max-w-3xl mx-auto mb-8">
              Descubra jovens excepcionais recomendados por instituições parceiras
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-cursor-background-card/50 backdrop-blur-xl border border-cursor-border rounded-2xl p-6 hover:border-cursor-primary/50 transition-all duration-300 card-transition stagger-item">
                <div className="text-3xl font-bold text-cursor-text-primary mb-2">
                  {loading ? '...' : stats.jovensRecomendados}
                </div>
                <div className="text-cursor-text-secondary">Jovens Recomendados</div>
              </div>
              
              <div className="bg-cursor-background-card/50 backdrop-blur-xl border border-cursor-border rounded-2xl p-6 hover:border-cursor-secondary/50 transition-all duration-300 card-transition stagger-item">
                <div className="text-3xl font-bold text-cursor-text-primary mb-2">
                  {loading ? '...' : stats.oportunidadesAtivas}
                </div>
                <div className="text-cursor-text-secondary">Oportunidades Ativas</div>
              </div>
              
              <div className="bg-cursor-background-card/50 backdrop-blur-xl border border-cursor-border rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 card-transition stagger-item">
                <div className="text-3xl font-bold text-cursor-text-primary mb-2">
                  {loading ? '...' : stats.contratacoesRealizadas}
                </div>
                <div className="text-cursor-text-secondary">Contratações Realizadas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Jovens em Destaque */}
      <section className="relative mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-cursor-background-card border border-cursor-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-cursor-text-primary flex items-center gap-2">
                <FaTrophy className="w-6 h-6 text-amber-500" />
                Talentos em Destaque
              </h2>
              <span className="text-sm text-cursor-text-secondary">
                Jovens disponíveis com maiores pontuações
              </span>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-cursor-background rounded-xl p-6 border border-cursor-border animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-cursor-background-light rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-cursor-background-light rounded w-3/4"></div>
                        <div className="h-3 bg-cursor-background-light rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-cursor-background-light rounded w-full"></div>
                      <div className="h-3 bg-cursor-background-light rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJovens
                  .filter(jovem => jovem.status === 'ativo' || jovem.status === 'Ativo' || jovem.status === 'pendente' || jovem.status === 'Pendente')
                  .sort((a, b) => (b.pontuacao_desenvolvimento || 0) - (a.pontuacao_desenvolvimento || 0))
                  .slice(0, 3)
                  .map((jovem, index) => (
                    <div
                      key={jovem.id}
                      className="bg-gradient-to-br from-cursor-background via-cursor-background to-cursor-background-light border-2 border-amber-500/30 rounded-xl p-6 hover:border-amber-500/60 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                      onClick={() => handleJovemClick(jovem)}
                    >
                      {/* Badge de destaque */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <FaStar className="w-3 h-3" />
                          #{index + 1}
                        </div>
                      </div>
                      
                      {/* Header do jovem */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <FaUser className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-cursor-text-primary truncate">{jovem.nome}</h3>
                          <p className="text-sm text-cursor-text-secondary">{formatarFormacao(jovem.formacao || '')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <FaTrophy className="w-3 h-3 text-amber-500" />
                                                             <span className="text-sm font-semibold text-amber-500">
                                 {Number(jovem.pontuacao_desenvolvimento || 0).toFixed(1)}/5.0
                               </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Habilidades principais */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-cursor-text-secondary mb-2 uppercase tracking-wider">Principais Habilidades</p>
                        <div className="flex flex-wrap gap-2">
                          {jovem.habilidades?.slice(0, 4).map((habilidade, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30 font-medium">
                              {habilidade}
                            </span>
                          ))}
                          {jovem.habilidades && jovem.habilidades.length > 4 && (
                            <span className="px-2 py-1 bg-cursor-text-tertiary/20 text-cursor-text-tertiary text-xs rounded-full">
                              +{jovem.habilidades.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recomendações ativas */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-cursor-text-secondary mb-2 uppercase tracking-wider">Status</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium capitalize ${getStatusColor(jovem.status || 'ativo')}`}>
                            {jovem.status === 'ativo' || jovem.status === 'Ativo' ? 'Disponível' : 
                             jovem.status === 'pendente' || jovem.status === 'Pendente' ? 'Em Processo' : 
                             jovem.status === 'aprovado' || jovem.status === 'Aprovado' ? 'Contratado' : 'Disponível'}
                          </span>
                          <span className="text-xs text-cursor-text-tertiary">
                            {jovem.recomendacoes?.length || 0} recomendações
                          </span>
                        </div>
                      </div>

                      {/* Call to action */}
                      <div className="pt-3 border-t border-cursor-border">
                        <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                          <FaEye className="w-4 h-4" />
                          Ver Perfil Completo
                        </button>
                      </div>
                    </div>
                  ))}
                
                {/* Caso não haja jovens em destaque */}
                {filteredJovens.filter(jovem => jovem.status === 'ativo' || jovem.status === 'Ativo' || jovem.status === 'pendente' || jovem.status === 'Pendente').length === 0 && !loading && (
                  <div className="col-span-full text-center py-8">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaTrophy className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-medium text-cursor-text-primary mb-2">Nenhum talento disponível</h3>
                    <p className="text-cursor-text-secondary">
                      Jovens disponíveis com as melhores pontuações aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Lista de Jovens - Agora ocupa toda a largura */}
        <div>
            <div className="bg-cursor-background-card border border-cursor-border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-cursor-text-primary flex items-center gap-2">
                  <FaGem className="w-6 h-6 text-cursor-primary" />
                  Talentos Recomendados ({filteredJovens.length})
                </h2>
                <button
                  onClick={() => fetchData()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-cursor-primary hover:bg-cursor-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaSync className="w-4 h-4" />
                  )}
                  Atualizar
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-cursor-background rounded-xl p-6 border border-cursor-border animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-cursor-background-light rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-cursor-background-light rounded w-3/4"></div>
                          <div className="h-3 bg-cursor-background-light rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-cursor-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="w-8 h-8 text-cursor-error" />
                  </div>
                  <h3 className="text-lg font-medium text-cursor-text-primary mb-2">Erro ao Carregar</h3>
                  <p className="text-cursor-text-secondary mb-4">{error}</p>
                  <button
                    onClick={() => fetchData()}
                    className="px-6 py-2 bg-cursor-primary hover:bg-cursor-primary-dark text-white rounded-lg transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : filteredJovens.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-cursor-text-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="w-8 h-8 text-cursor-text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-cursor-text-primary mb-2">Nenhum talento encontrado</h3>
                  <p className="text-cursor-text-secondary">
                    Ainda não há jovens recomendados disponíveis
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredJovens.map((jovem, index) => (
                    <div
                      key={jovem.id}
                      className="bg-cursor-background border border-cursor-border rounded-xl p-6 hover:border-cursor-primary/50 transition-all duration-300 cursor-pointer group card-transition h-fit"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => handleJovemClick(jovem)}
                    >
                      {/* Header compacto */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cursor-primary to-cursor-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <FaUser className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-cursor-text-primary truncate">{jovem.nome}</h3>
                          <p className="text-sm text-cursor-text-secondary">{formatarFormacao(jovem.formacao || '')}</p>
                        </div>
                      </div>

                      {/* Habilidades (máximo 3 + contador) */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {jovem.habilidades?.slice(0, 3).map((habilidade, i) => (
                            <span key={i} className="px-2 py-1 bg-cursor-primary/20 text-cursor-primary text-xs rounded-full border border-cursor-primary/30">
                              {habilidade}
                            </span>
                          ))}
                          {jovem.habilidades && jovem.habilidades.length > 3 && (
                            <span className="px-2 py-1 bg-cursor-text-tertiary/20 text-cursor-text-tertiary text-xs rounded-full">
                              +{jovem.habilidades.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recomendações (somente 1 + contador) */}
                      <div className="mb-4">
                        <p className="text-xs text-cursor-text-secondary mb-2">RECOMENDAÇÕES</p>
                        {jovem.recomendacoes && jovem.recomendacoes.length > 0 ? (
                          <div className="space-y-2">
                            <div className="text-xs text-cursor-text-primary">
                              {jovem.recomendacoes[0].oportunidade_titulo}
                            </div>
                            {jovem.recomendacoes.length > 1 && (
                              <div className="text-xs text-cursor-text-tertiary">
                                +{jovem.recomendacoes.length - 1} outras oportunidades
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-cursor-text-tertiary">Nenhuma recomendação ativa</div>
                        )}
                      </div>

                      {/* Footer minimalista */}
                      <div className="flex justify-between items-center pt-3 border-t border-cursor-border">
                        <span className={`text-xs font-medium capitalize ${getStatusColor(jovem.status || 'disponivel')}`}>
                          {jovem.status === 'ativo' || jovem.status === 'Ativo' ? 'Disponível' : 
                           jovem.status === 'pendente' || jovem.status === 'Pendente' ? 'Em Processo' : 
                           jovem.status === 'aprovado' || jovem.status === 'Aprovado' ? 'Contratado' : 'N/A'}
                        </span>
                        <button className="text-xs text-cursor-primary hover:text-cursor-primary-dark transition-colors flex items-center gap-1">
                          Ver Perfil <FaEye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Modal */}
      {renderJovemModal()}
    </div>
  );
};

export default DashboardInstituicaoContratante; 