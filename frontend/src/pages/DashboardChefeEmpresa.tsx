import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem, Oportunidade } from '../types';
import { jovemService, oportunidadeService } from '../services/api';

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

const DashboardChefeEmpresa: React.FC = () => {
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

  // Filtrar oportunidades por status
  const oportunidadesAbertas = oportunidades.filter(op => op.status === 'Aberta');
  const oportunidadesFechadas = oportunidades.filter(op => op.status === 'Fechada');
  const jovensContratados = jovens.filter(jovem => 
    jovem.empresas?.some(empresa => empresa.status === 'Contratado')
  );
  const taxaAproveitamento = oportunidades.length > 0 
    ? ((jovensContratados.length / oportunidades.length) * 100).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Dashboard do Chefe de Empresa</h1>
            <p className="text-cursor-text-secondary mt-1">
              Bem-vindo(a), <span className="font-medium text-cursor-text-primary">{user?.nome}</span>
            </p>
          </div>
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Vinculados</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : jovens.length}</p>
            <Link 
              to="/chefe-empresa/jovens" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades Abertas</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : oportunidadesAbertas.length}</p>
            <Link 
              to="/chefe-empresa/oportunidades" 
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
              onClick={() => navigate('/chefe-empresa/oportunidades/nova')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Nova Vaga</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/chefe-empresa/jovens')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Ver Jovens</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/chefe-empresa/oportunidades')}
              className="flex items-center justify-center p-4 bg-cursor-background-light hover:bg-cursor-background-lighter rounded-lg transition-colors"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-cursor-text-primary">Gerenciar Vagas</span>
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

        {/* Oportunidades em Destaque */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Oportunidades em Destaque</h2>
            <Link 
              to="/chefe-empresa/oportunidades"
              className="text-cursor-primary text-sm hover:text-cursor-primary-dark transition-colors"
            >
              Ver todas
            </Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-cursor-background-light rounded"></div>
              <div className="h-20 bg-cursor-background-light rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {oportunidades.slice(0, 3).map(op => (
                <div key={op.id} className="p-4 bg-cursor-background-light rounded-lg hover:bg-cursor-background-lighter transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-cursor-text-primary">{op.titulo}</h3>
                      <p className="text-sm text-cursor-text-secondary mt-1">{op.descricao?.substring(0, 100)}...</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-cursor-primary/10 text-cursor-primary rounded-full">
                          {op.tipo}
                        </span>
                        <span className="text-xs px-2 py-1 bg-cursor-primary/10 text-cursor-primary rounded-full">
                          {op.local}
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/chefe-empresa/oportunidades/${op.id}`}
                      className="text-cursor-primary hover:text-cursor-primary-dark"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Estatísticas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cursor-background-light rounded-lg">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Total de Candidaturas</h3>
              <p className="text-2xl font-bold text-cursor-primary">
                {loading ? '-' : oportunidades.reduce((acc, op) => acc + (op.vagas_preenchidas || 0), 0)}
              </p>
            </div>
            <div className="p-4 bg-cursor-background-light rounded-lg">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Vagas em Processo</h3>
              <p className="text-2xl font-bold text-cursor-primary">
                {loading ? '-' : oportunidadesFechadas.length}
              </p>
            </div>
            <div className="p-4 bg-cursor-background-light rounded-lg">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Taxa de Conversão</h3>
              <p className="text-2xl font-bold text-cursor-primary">
                {loading ? '-' : `${taxaAproveitamento}%`}
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

export default DashboardChefeEmpresa; 