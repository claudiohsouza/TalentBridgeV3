import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem, Oportunidade } from '../types';
import { jovemService, oportunidadeService } from '../services/api';

const DashboardInstituicaoEnsino: React.FC = () => {
  const { user } = useAuth();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jovensData = await jovemService.listarJovens();
        const opData = await oportunidadeService.listarOportunidades();
        
        setJovens(jovensData);
        setOportunidades(opData);
        setLoading(false);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Estatísticas
  const totalJovens = jovens.length;
  
  // Debug: Log dos status dos jovens
  console.log('[Dashboard] Jovens carregados:', jovens.length);
  console.log('[Dashboard] Status dos jovens:', jovens.map(j => ({ nome: j.nome, status: j.status })));
  
  // Corrigido: usar toLowerCase() para tornar case-insensitive
  const jovensAtivos = jovens.filter(j => {
    const status = j.status?.toLowerCase();
    const isAtivo = status === 'aprovado' || status === 'ativo';
    console.log(`[Dashboard] ${j.nome}: status='${j.status}', normalizado='${status}', isAtivo=${isAtivo}`);
    return isAtivo;
  }).length;
  const jovensPendentes = jovens.filter(j => {
    const status = j.status?.toLowerCase();
    return status === 'pendente';
  }).length;
  const oportunidadesAbertas = oportunidades.filter(op => op.status === 'aprovado').length;
  
  console.log('[Dashboard] Estatísticas:', { totalJovens, jovensAtivos, jovensPendentes, oportunidadesAbertas });

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Dashboard da Instituição de Ensino</h1>
            <p className="text-cursor-text-secondary mt-1">
              Bem-vindo(a), <span className="font-medium text-cursor-text-primary">{user?.nome}</span>
            </p>
          </div>
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Total de Jovens</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : totalJovens}</p>
            <Link 
              to="/instituicao-ensino/jovens" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Ativos</h2>
            <p className="text-3xl font-bold text-cursor-success">{loading ? '-' : jovensAtivos}</p>
            <p className="text-sm text-cursor-text-secondary mt-1">
              {loading ? '-' : `${((jovensAtivos / totalJovens) * 100).toFixed(1)}% do total`}
            </p>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Pendentes</h2>
            <p className="text-3xl font-bold text-cursor-warning">{loading ? '-' : jovensPendentes}</p>
            <p className="text-sm text-cursor-text-secondary mt-1">
              Aguardando aprovação
            </p>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades Abertas</h2>
            <p className="text-3xl font-bold text-cursor-secondary">{loading ? '-' : oportunidadesAbertas}</p>
            <Link 
              to="/instituicao-ensino/oportunidades" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/instituicao-ensino/jovens/novo')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Adicionar Jovem</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/instituicao-ensino/jovens')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Gerenciar Jovens</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/instituicao-ensino/oportunidades')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Ver Oportunidades</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Editar Perfil</span>
              </div>
            </button>
          </div>
        </div>

        {/* Jovens Recentes */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Jovens Recentes</h2>
            <Link 
              to="/instituicao-ensino/jovens"
              className="text-cursor-primary text-sm hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
            </Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-cursor-background-light rounded"></div>
              <div className="h-20 bg-cursor-background-light rounded"></div>
              <div className="h-20 bg-cursor-background-light rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {jovens.slice(0, 3).map(jovem => (
                <div key={jovem.id} className="p-4 bg-cursor-background-light rounded-lg hover:bg-cursor-background-lighter transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-cursor-text-primary">{jovem.nome}</h3>
                      <p className="text-sm text-cursor-text-secondary">{jovem.curso}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-cursor-text-primary mr-2">
                            {jovem.media_geral ? jovem.media_geral.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-yellow-400">★</span>
                        </div>
                        <div className="ml-4">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                            jovem.status?.toLowerCase() === 'aprovado' || jovem.status?.toLowerCase() === 'ativo' ? 'bg-green-100 text-green-800' :
                            jovem.status?.toLowerCase() === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {jovem.status?.toLowerCase() === 'ativo' ? 'Ativo' : jovem.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Estatísticas Detalhadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cursor-background-light rounded-lg">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Média de Idade</h3>
              <p className="text-2xl font-bold text-cursor-primary">
                {loading ? '-' : jovens.length > 0 ? 
                  (jovens.reduce((acc, j) => acc + j.idade, 0) / jovens.length).toFixed(1) : '0'
                } anos
              </p>
            </div>
            <div className="p-4 bg-cursor-background-light rounded-lg">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Formação Mais Comum</h3>
              <p className="text-2xl font-bold text-cursor-primary">
                {loading ? '-' : jovens.length > 0 ? 
                  (() => {
                    const formacoes = jovens.map(j => j.formacao).filter(Boolean);
                    const counts = formacoes.reduce((acc, f) => {
                      acc[f] = (acc[f] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const max = Math.max(...Object.values(counts));
                    const maisComum = Object.keys(counts).find(k => counts[k] === max);
                    return maisComum || 'Não informado';
                  })() : 'N/A'
                }
              </p>
            </div>
            <div className="p-4 bg-cursor-background-light rounded-lg">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Taxa de Atividade</h3>
              <p className="text-2xl font-bold text-cursor-primary">
                {loading ? '-' : totalJovens > 0 ? 
                  `${((jovensAtivos / totalJovens) * 100).toFixed(1)}%` : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardInstituicaoEnsino; 