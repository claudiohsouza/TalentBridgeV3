import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade, Recomendacao } from '../types';
import { oportunidadeService } from '../services/api';

const getStatusInfo = (status: Oportunidade['status']) => {
  switch (status) {
    case 'aprovado':
      return { text: 'Aberta', className: 'badge-success' };
    case 'pendente':
      return { text: 'Pendente', className: 'badge-warning' };
    case 'rejeitado':
      return { text: 'Rejeitada', className: 'badge-error' };
    case 'cancelado':
      return { text: 'Cancelada', className: 'badge-default' };
    default:
      const defaultStatus: string = status;
      return { text: defaultStatus.charAt(0).toUpperCase() + defaultStatus.slice(1), className: 'badge-default' };
  }
};

const OportunidadeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOportunidadeDetails = async () => {
      try {
        setLoading(true);
        const data = await oportunidadeService.getOportunidade(Number(id));
        setOportunidade(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    if (id) {
      fetchOportunidadeDetails();
    }
  }, [id]);

  const getBasePath = () => {
    if (user?.papel === 'instituicao_ensino') {
      return '/instituicao-ensino';
    } else if (user?.papel === 'chefe_empresa') {
      return '/chefe-empresa';
    } else if (user?.papel === 'instituicao_contratante') {
      return '/instituicao-contratante';
    }
    return '';
  };

  const handleVoltar = () => {
    navigate(`${getBasePath()}/oportunidades`);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-cursor-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-cursor-text-secondary">Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !oportunidade) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
              <p>{error || 'Oportunidade não encontrada'}</p>
              <button
                onClick={handleVoltar}
                className="mt-4 btn-primary"
              >
                Voltar para lista
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = oportunidade.is_owner || user?.papel === 'instituicao_contratante';
  const canRecommend = !isOwner && (user?.papel === 'instituicao_ensino' || user?.papel === 'chefe_empresa');

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleVoltar}
            className="mr-4 inline-flex items-center text-cursor-text-secondary hover:text-cursor-primary transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-cursor-text-primary">{oportunidade.titulo}</h1>
        </div>

        <div className="card shadow-cursor overflow-hidden mb-8">
          {/* Cabeçalho */}
          <div className="p-6 border-b border-cursor-border bg-cursor-background-light">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-baseline">
                  <h2 className="text-xl font-semibold text-cursor-text-primary mr-3">{oportunidade.titulo}</h2>
                  <span className={`badge ${getStatusInfo(oportunidade.status).className}`}>
                    {getStatusInfo(oportunidade.status).text}
                  </span>
                </div>
                <p className="text-cursor-text-secondary mt-1">
                  Oferecida por: {oportunidade.empresa_nome || `Empresa #${oportunidade.empresa_id}`}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                {isOwner && (
                  <button
                    className="btn-secondary inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                  </button>
                )}
                {user?.papel === 'chefe_empresa' && (
                  <button
                    onClick={() => navigate(`/chefe-empresa/oportunidades/${id}/recomendar`)}
                    className="btn-primary"
                  >
                    Recomendar Jovem
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Corpo do cartão */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna da esquerda: Informações básicas */}
            <div>
              <h3 className="text-lg font-medium text-cursor-text-primary mb-4">Detalhes da Oportunidade</h3>
              <div className="space-y-4">
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Tipo</div>
                  <div className="mt-1 text-cursor-text-primary font-medium">{oportunidade.tipo}</div>
                </div>
                
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Descrição</div>
                  <div className="mt-1 text-cursor-text-primary whitespace-pre-line">
                    {oportunidade.descricao ? (
                      oportunidade.descricao
                        .replace(/Ã§/g, 'ç')
                        .replace(/Ã£/g, 'ã')
                        .replace(/Ã¡/g, 'á')
                        .replace(/Ã©/g, 'é')
                        .replace(/Ã­/g, 'í')
                        .replace(/Ã³/g, 'ó')
                        .replace(/Ãº/g, 'ú')
                        .replace(/Ã\u0082/g, 'Â')
                    ) : "Nenhuma descrição fornecida"}
                  </div>
                </div>
                
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Requisitos</div>
                  <div className="mt-1">
                    {oportunidade.requisitos ? (
                      Array.isArray(oportunidade.requisitos) ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {oportunidade.requisitos.map((requisito: string, index: number) => (
                            <li key={index} className="text-cursor-text-primary">
                              {requisito
                                .replace(/Ã§/g, 'ç')
                                .replace(/Ã£/g, 'ã')
                                .replace(/Ã¡/g, 'á')
                                .replace(/Ã©/g, 'é')
                                .replace(/Ã­/g, 'í')
                                .replace(/Ã³/g, 'ó')
                                .replace(/Ãº/g, 'ú')
                                .replace(/Ã\u0082/g, 'Â')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-cursor-text-primary whitespace-pre-line">
                          {String(oportunidade.requisitos)
                            .replace(/Ã§/g, 'ç')
                            .replace(/Ã£/g, 'ã')
                            .replace(/Ã¡/g, 'á')
                            .replace(/Ã©/g, 'é')
                            .replace(/Ã­/g, 'í')
                            .replace(/Ã³/g, 'ó')
                            .replace(/Ãº/g, 'ú')
                            .replace(/Ã\u0082/g, 'Â')}
                        </div>
                      )
                    ) : (
                      <div className="text-cursor-text-secondary">Nenhum requisito específico</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Benefícios</div>
                  <div className="mt-1">
                    {oportunidade.beneficios ? (
                      Array.isArray(oportunidade.beneficios) ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {oportunidade.beneficios.map((beneficio: string, index: number) => (
                            <li key={index} className="text-cursor-text-primary">
                              {beneficio
                                .replace(/Ã§/g, 'ç')
                                .replace(/Ã£/g, 'ã')
                                .replace(/Ã¡/g, 'á')
                                .replace(/Ã©/g, 'é')
                                .replace(/Ã­/g, 'í')
                                .replace(/Ã³/g, 'ó')
                                .replace(/Ãº/g, 'ú')
                                .replace(/Ã\u0082/g, 'Â')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-cursor-text-primary whitespace-pre-line">
                          {String(oportunidade.beneficios)
                            .replace(/Ã§/g, 'ç')
                            .replace(/Ã£/g, 'ã')
                            .replace(/Ã¡/g, 'á')
                            .replace(/Ã©/g, 'é')
                            .replace(/Ã­/g, 'í')
                            .replace(/Ã³/g, 'ó')
                            .replace(/Ãº/g, 'ú')
                            .replace(/Ã\u0082/g, 'Â')}
                        </div>
                      )
                    ) : (
                      <div className="text-cursor-text-secondary">Nenhum benefício listado</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna da direita: Datas e recomendações */}
            <div>
              <h3 className="text-lg font-medium text-cursor-text-primary mb-4">Período e Recomendações</h3>
              <div className="space-y-4">
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Data de Início</div>
                  <div className="mt-1 text-cursor-text-primary font-medium">{formatDate(oportunidade.data_inicio)}</div>
                </div>
                
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Data de Término</div>
                  <div className="mt-1 text-cursor-text-primary font-medium">{formatDate(oportunidade.data_fim)}</div>
                </div>
                
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Total de Recomendações</div>
                  <div className="mt-1 text-cursor-text-primary font-medium">
                    {oportunidade.total_recomendacoes || 0} {(oportunidade.total_recomendacoes || 0) === 1 ? 'jovem recomendado' : 'jovens recomendados'}
                  </div>
                </div>
                
                <div className="bg-cursor-background-light p-4 rounded-lg border border-cursor-border">
                  <div className="text-sm font-medium text-cursor-text-tertiary">Área</div>
                  <div className="mt-1 text-cursor-text-primary font-medium">{oportunidade.area}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de recomendações - apenas visível para instituições contratantes ou se for o dono */}
        {isOwner && oportunidade.recomendacoes && oportunidade.recomendacoes.length > 0 && (
          <div className="card shadow-cursor overflow-hidden">
            <div className="p-6 border-b border-cursor-border bg-cursor-background-light">
              <h3 className="text-lg font-medium text-cursor-text-primary">Recomendações Recebidas</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-cursor-border">
                  <thead className="bg-cursor-background-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider">Jovem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider">Recomendado por</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-cursor-border">
                    {oportunidade.recomendacoes.map((recomendacao: Recomendacao) => (
                      <tr key={recomendacao.id} className="hover:bg-cursor-background-light transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-cursor-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-cursor-primary text-sm font-medium">
                                {recomendacao.jovem_nome?.slice(0, 2).toUpperCase() || 'JV'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-cursor-text-primary">{recomendacao.jovem_nome}</div>
                              <div className="text-sm text-cursor-text-tertiary">{recomendacao.jovem_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-cursor-text-primary">{recomendacao.recomendador_nome}</div>
                          <div className="text-sm text-cursor-text-tertiary">{recomendacao.recomendador_tipo === 'instituicao_ensino' ? 'Instituição de Ensino' : 'Empresa'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            recomendacao.status === 'aprovado' ? 'badge-success' : 
                            recomendacao.status === 'rejeitado' ? 'badge-error' : 
                            'badge-warning'
                          }`}>
                            {recomendacao.status === 'aprovado' ? 'Aprovada' : 
                             recomendacao.status === 'rejeitado' ? 'Rejeitada' : 
                             recomendacao.status === 'pendente' ? 'Pendente' : 
                             recomendacao.status === 'cancelado' ? 'Cancelada' : 
                             recomendacao.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link to={`/${getBasePath()}/jovens/${recomendacao.jovem_id}`} className="text-cursor-primary hover:text-cursor-primary-dark mr-2">
                            Ver perfil
                          </Link>
                          {recomendacao.status === 'pendente' && (
                            <>
                              <button className="text-cursor-success hover:text-cursor-success/80 transition-colors mr-2">
                                Aprovar
                              </button>
                              <button className="text-cursor-error hover:text-cursor-error/80 transition-colors">
                                Rejeitar
                              </button>
                            </>
                          )}
                          {recomendacao.status === 'aprovado' && (
                            <span className="text-sm font-semibold text-cursor-success">
                              Aprovado
                            </span>
                          )}
                          {recomendacao.status === 'rejeitado' && (
                            <span className="text-sm font-semibold text-cursor-error">
                              Rejeitado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OportunidadeDetails; 