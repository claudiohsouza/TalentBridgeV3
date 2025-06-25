import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { statsService } from '../services/api';

interface FeaturedData {
  featured: {
    jovem: {
      nome: string;
      curso: string;
      habilidades: string[];
    };
    oportunidade: {
      id: number;
      titulo: string;
      empresa: string;
    };
  } | null;
  others: {
    id: number;
    titulo: string;
    empresa_nome: string;
  }[];
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    jovens: 0,
    oportunidades: 0,
    empresas: 0,
    contratacoes: 0
  });
  const [featuredData, setFeaturedData] = useState<FeaturedData | null>(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Animação de contadores
  useEffect(() => {
    const fetchAndAnimateStats = async () => {
      const targetStats = await statsService.getStats();

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setStats({
          jovens: Math.floor(targetStats.jovens * progress),
          oportunidades: Math.floor(targetStats.oportunidades * progress),
          empresas: Math.floor(targetStats.empresas * progress),
          contratacoes: Math.floor(targetStats.contratacoes * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setStats(targetStats); // Garante que os números finais sejam exatos
        }
      }, stepDuration);

      return () => clearInterval(timer);
    };

    const fetchFeaturedData = async () => {
      setLoadingFeatured(true);
      const data = await statsService.getFeatured();
      setFeaturedData(data);
      setLoadingFeatured(false);
    };

    fetchAndAnimateStats();
    fetchFeaturedData();
  }, []);

  const getUserDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.papel) {
      case 'instituicao_ensino':
        return '/instituicao-ensino';
      case 'chefe_empresa':
        return '/chefe-empresa';
      case 'instituicao_contratante':
        return '/instituicao-contratante';
      default:
        return '/';
    }
  };

  return (
    <div className="bg-cursor-background min-h-screen flex flex-col page-transition">
      {/* Hero Section Aprimorada */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-32 overflow-hidden">
        {/* Gradient Background Melhorado */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10%] opacity-40">
            <div className="absolute top-0 left-[10%] w-[60%] h-[60%] bg-cursor-primary rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-[20%] w-[50%] h-[50%] bg-cursor-secondary rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="fade-in">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 slide-transition">
              <span className="bg-gradient-to-r from-cursor-primary via-purple-500 to-cursor-secondary bg-clip-text text-transparent">
                TalentBridge
              </span>
            </h1>
            <p className="text-xl md:text-3xl text-cursor-text-secondary max-w-3xl mx-auto mb-6 slide-transition" style={{ animationDelay: '0.2s' }}>
              Conectando jovens talentosos com as melhores oportunidades no mercado de trabalho.
            </p>
            <p className="text-lg md:text-xl text-cursor-text-tertiary max-w-2xl mx-auto mb-10 slide-transition" style={{ animationDelay: '0.3s' }}>
              Uma plataforma inovadora que transforma vidas através da conexão entre talento e oportunidade.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 slide-transition" style={{ animationDelay: '0.4s' }}>
                <Link 
                  to="/cadastro" 
                  className="btn-primary px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Começar Agora
                </Link>
                <Link 
                  to="/login" 
                  className="btn-secondary px-10 py-4 text-lg font-semibold"
                >
                  Fazer Login
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 slide-transition" style={{ animationDelay: '0.4s' }}>
                <Link 
                  to={getUserDashboardPath()} 
                  className="btn-primary px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Acessar Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className="btn-secondary px-10 py-4 text-lg font-semibold"
                >
                  Meu Perfil
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Seção de Estatísticas */}
      <section className="relative py-16 md:py-20 bg-gradient-to-b from-cursor-background to-cursor-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
                Impacto Real
              </span>
            </h2>
            <p className="text-lg text-cursor-text-secondary max-w-2xl mx-auto">
              Números que demonstram o poder da conexão entre talento e oportunidade
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center card p-6 hover:border-cursor-primary transition-all duration-300 card-transition stagger-item">
              <div className="h-16 w-16 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-cursor-text-primary mb-2">
                {stats.jovens.toLocaleString()}+
              </div>
              <div className="text-cursor-text-secondary">Jovens Cadastrados</div>
            </div>
            
            <div className="text-center card p-6 hover:border-cursor-primary transition-all duration-300 card-transition stagger-item">
              <div className="h-16 w-16 rounded-full bg-cursor-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-cursor-text-primary mb-2">
                {stats.oportunidades.toLocaleString()}+
              </div>
              <div className="text-cursor-text-secondary">Oportunidades</div>
            </div>
            
            <div className="text-center card p-6 hover:border-cursor-primary transition-all duration-300 card-transition stagger-item">
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-cursor-text-primary mb-2">
                {stats.empresas.toLocaleString()}+
              </div>
              <div className="text-cursor-text-secondary">Empresas Parceiras</div>
            </div>
            
            <div className="text-center card p-6 hover:border-cursor-primary transition-all duration-300 card-transition stagger-item">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-cursor-text-primary mb-2">
                {stats.contratacoes.toLocaleString()}+
              </div>
              <div className="text-cursor-text-secondary">Contratações Realizadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Demonstração do Produto */}
      <section className="relative py-16 md:py-24 bg-cursor-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
                Conheça a Plataforma
              </span>
            </h2>
            <p className="text-lg text-cursor-text-secondary max-w-3xl mx-auto">
              Uma experiência intuitiva e completa para conectar talentos com oportunidades
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot da Plataforma */}
            <div className="relative fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-cursor-background border border-cursor-border">
                {/* Window Header */}
                <div className="p-4 border-b border-cursor-border flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-cursor-text-tertiary bg-cursor-background-light px-4 py-1 rounded-md">
                    Painel de Recomendações
                  </div>
                </div>

                {/* Conteúdo da Plataforma Simulado */}
                <div className="p-6 bg-cursor-background-light/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Coluna de Oportunidades */}
                  <div className="md:col-span-1 space-y-3">
                    <h3 className="text-sm font-semibold text-cursor-text-secondary px-2">Oportunidades</h3>
                    {loadingFeatured ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-cursor-background rounded-lg h-14 animate-pulse"></div>
                        <div className="p-3 bg-cursor-background rounded-lg h-14 animate-pulse"></div>
                        <div className="p-3 bg-cursor-background rounded-lg h-14 animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        {featuredData?.featured && (
                          <div className="p-3 bg-cursor-primary/20 rounded-lg border border-cursor-primary space-y-1">
                            <p className="font-bold text-cursor-primary text-sm">{featuredData.featured.oportunidade.titulo}</p>
                            <p className="text-xs text-cursor-primary/80">{featuredData.featured.oportunidade.empresa}</p>
                          </div>
                        )}
                        {featuredData?.others?.map(op => (
                          <div key={op.id} className="p-3 bg-cursor-background rounded-lg space-y-1">
                            <p className="font-bold text-cursor-text-primary text-sm">{op.titulo}</p>
                            <p className="text-xs text-cursor-text-tertiary">{op.empresa_nome}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Coluna do Perfil do Jovem */}
                  <div className="md:col-span-2 bg-cursor-background rounded-lg p-4 border border-cursor-border shadow-md">
                    {loadingFeatured || !featuredData?.featured ? (
                      <div className="animate-pulse">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-cursor-background-light"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-cursor-background-light rounded w-3/4"></div>
                            <div className="h-3 bg-cursor-background-light rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="h-3 bg-cursor-background-light rounded w-1/4 mb-2"></div>
                          <div className="flex flex-wrap gap-2">
                            <div className="h-5 w-12 bg-cursor-background-light rounded-full"></div>
                            <div className="h-5 w-16 bg-cursor-background-light rounded-full"></div>
                            <div className="h-5 w-10 bg-cursor-background-light rounded-full"></div>
                          </div>
                        </div>
                        <div className="h-10 bg-cursor-background-light rounded-lg"></div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cursor-secondary to-purple-500 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-bold text-lg text-cursor-text-primary">{featuredData.featured.jovem.nome}</h4>
                            <p className="text-sm text-cursor-text-secondary">{featuredData.featured.jovem.curso}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-cursor-text-secondary mb-2 uppercase tracking-wider">Habilidades Principais</p>
                          <div className="flex flex-wrap gap-2">
                            {(featuredData.featured.jovem.habilidades || []).slice(0, 4).map((habilidade, i) => (
                              <span key={i} className="badge badge-primary">{habilidade}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-green-500/10 text-green-400 text-sm font-semibold p-3 rounded-lg text-center flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                          Recomendada para vaga de {featuredData.featured.oportunidade.titulo}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-cursor-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Dashboard Interativo
              </div>
            </div>
            
            {/* Descrição dos Recursos */}
            <div className="space-y-8 fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-cursor-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cursor-text-primary mb-2">Análise Inteligente</h3>
                  <p className="text-cursor-text-secondary">
                    Sistema avançado de matching que conecta jovens com oportunidades baseado em habilidades, interesses e perfil profissional.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-cursor-secondary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cursor-text-primary mb-2">Processo Simplificado</h3>
                  <p className="text-cursor-text-secondary">
                    Interface intuitiva que facilita o cadastro de jovens, criação de oportunidades e gestão de recomendações.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cursor-text-primary mb-2">Resultados Comprovados</h3>
                  <p className="text-cursor-text-secondary">
                    Taxa de sucesso superior a 85% na colocação de jovens em posições adequadas ao seu perfil e aspirações.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Melhorada */}
      <section className="relative bg-cursor-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 fade-in">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
              Como Funciona
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card p-8 hover:border-cursor-primary transition-all duration-300 card-transition stagger-item group">
              <div className="h-16 w-16 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-6 group-hover:bg-cursor-primary/30 transition-colors">
                <svg className="w-8 h-8 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-cursor-text-primary">Instituições de Ensino</h3>
              <p className="text-cursor-text-secondary mb-4">
                Cadastre jovens e destaque seus talentos para instituições contratantes com ferramentas avançadas de gestão.
              </p>
              <ul className="space-y-2 text-sm text-cursor-text-secondary">
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gestão completa de perfis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Acompanhamento de desenvolvimento</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Relatórios detalhados</span>
                </li>
              </ul>
            </div>
            
            {/* Card 2 */}
            <div className="card p-8 hover:border-cursor-secondary transition-all duration-300 card-transition stagger-item group">
              <div className="h-16 w-16 rounded-full bg-cursor-secondary/20 flex items-center justify-center mb-6 group-hover:bg-cursor-secondary/30 transition-colors">
                <svg className="w-8 h-8 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-cursor-text-primary">Jovens Talentosos</h3>
              <p className="text-cursor-text-secondary mb-4">
                Tenha seu perfil destacado com habilidades, interesses e histórico profissional completo.
              </p>
              <ul className="space-y-2 text-sm text-cursor-text-secondary">
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Perfil profissional completo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Recomendações personalizadas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Oportunidades exclusivas</span>
                </li>
              </ul>
            </div>
            
            {/* Card 3 */}
            <div className="card p-8 hover:border-purple-500 transition-all duration-300 card-transition stagger-item group">
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-cursor-text-primary">Instituições Contratantes</h3>
              <p className="text-cursor-text-secondary mb-4">
                Encontre talentos recomendados que combinam perfeitamente com suas oportunidades e cultura organizacional.
              </p>
              <ul className="space-y-2 text-sm text-cursor-text-secondary">
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Jovens pré-selecionados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Perfis detalhados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Contato direto</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Conecte-se Conosco */}
      <section className="relative py-16 md:py-24 bg-cursor-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* QR Code */}
            <div className="flex justify-center lg:justify-end fade-in">
              <div className="relative p-6 bg-cursor-background-light border border-cursor-border rounded-lg shadow-cursor-lg w-full max-w-xs text-center">
                <img src="/QRTALENT.jpg" alt="QR Code para Linktree TalentBridge" className="rounded-md w-full" />
                <p className="text-cursor-text-tertiary mt-4 text-sm">
                  Escaneie para acessar todos os nossos links
                </p>
              </div>
            </div>
            
            {/* Texto e Links */}
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
                  Conecte-se Conosco
                </span>
              </h2>
              <p className="text-lg text-cursor-text-secondary mb-8 max-w-lg">
                Siga nossa jornada, fique por dentro das novidades e descubra como estamos transformando futuros.
              </p>
              <div className="space-y-4">
                <a href="https://www.instagram.com/talentbridge._/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group p-3 rounded-lg hover:bg-cursor-background-light transition-colors">
                  <div className="h-12 w-12 rounded-full bg-cursor-background-light border border-cursor-border flex items-center justify-center flex-shrink-0 group-hover:bg-cursor-primary/20 group-hover:border-cursor-primary transition-colors">
                    <svg className="w-6 h-6 text-cursor-text-secondary group-hover:text-cursor-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.11 0-3.467.012-4.695.068-2.61.12-3.832 1.325-3.951 3.951C3.3 8.356 3.289 8.713 3.289 12s.012 3.644.068 4.695c.12 2.625 1.34 3.832 3.951 3.951 1.228.056 1.585.068 4.695.068s3.467-.012 4.695-.068c2.61-.12 3.832-1.325 3.951-3.951.056-1.228.068-1.585.068-4.695s-.012-3.467-.068-4.695c-.12-2.625-1.34-3.832-3.951-3.951C15.467 3.977 15.11 3.965 12 3.965zM12 7.288c-2.61 0-4.712 2.102-4.712 4.712s2.102 4.712 4.712 4.712 4.712-2.102 4.712-4.712S14.61 7.288 12 7.288zm0 7.622c-1.606 0-2.91-1.304-2.91-2.91s1.304-2.91 2.91-2.91 2.91 1.304 2.91 2.91-1.304 2.91-2.91 2.91zm4.965-7.854c-.58 0-1.05.47-1.05 1.05s.47 1.05 1.05 1.05 1.05-.47 1.05-1.05-.47-1.05-1.05-1.05z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cursor-text-primary group-hover:text-cursor-primary transition-colors">Instagram</h4>
                    <p className="text-sm text-cursor-text-secondary">@talentbridge._</p>
                  </div>
                </a>
                
                <a href="https://www.youtube.com/watch?v=sIuOtgGtWBo" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group p-3 rounded-lg hover:bg-cursor-background-light transition-colors">
                  <div className="h-12 w-12 rounded-full bg-cursor-background-light border border-cursor-border flex items-center justify-center flex-shrink-0 group-hover:bg-cursor-secondary/20 group-hover:border-cursor-secondary transition-colors">
                    <svg className="w-6 h-6 text-cursor-text-secondary group-hover:text-cursor-secondary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cursor-text-primary group-hover:text-cursor-secondary transition-colors">YouTube</h4>
                    <p className="text-sm text-cursor-text-secondary">Assista nosso pitch completo</p>
                  </div>
                </a>

                <a href="mailto:staff.talentbridge@gmail.com" className="flex items-center space-x-4 group p-3 rounded-lg hover:bg-cursor-background-light transition-colors">
                  <div className="h-12 w-12 rounded-full bg-cursor-background-light border border-cursor-border flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 group-hover:border-purple-500 transition-colors">
                    <svg className="w-6 h-6 text-cursor-text-secondary group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cursor-text-primary group-hover:text-purple-500 transition-colors">Email</h4>
                    <p className="text-sm text-cursor-text-secondary">staff.talentbridge@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção CTA Final */}
      <section className="relative py-16 md:py-20 bg-gradient-to-r from-cursor-primary to-cursor-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 fade-in">
            Pronto para Transformar Vidas?
          </h2>
          <p className="text-xl text-white/90 mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
            Junte-se a centenas de instituições e empresas que já descobriram o poder da TalentBridge
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in" style={{ animationDelay: '0.4s' }}>
            <Link 
              to="/cadastro" 
              className="bg-white text-cursor-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Começar Agora
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-cursor-primary transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-cursor-background py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-cursor-text-tertiary text-sm">
            © {new Date().getFullYear()} TalentBridge. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}