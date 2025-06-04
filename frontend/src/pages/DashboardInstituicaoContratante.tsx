import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade, Jovem } from '../types';
import { jovemService, oportunidadeService } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// @ts-ignore
import Papa from 'papaparse';

const COLORS = ['#6366F1', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#A3A3A3'];

function getDistribuicaoFormacao(jovens: Jovem[]) {
  const dist: Record<string, number> = {};
  jovens.forEach(j => {
    const key = normalizarFormacao(j.formacao);
    dist[key] = (dist[key] || 0) + 1;
  });
  return Object.entries(dist).map(([formacao, count]) => ({ name: formacao, value: count }));
}

function getTodasHabilidades(jovens: Jovem[]) {
  const set = new Set<string>();
  jovens.forEach(j => {
    let habilidades: string[] = [];
    if (Array.isArray(j.habilidades)) {
      habilidades = j.habilidades.flatMap((h: any) =>
        typeof h === 'string' ? String(h).split(',').map((x: string) => x.trim()) : []
      );
    } else if (typeof j.habilidades === 'string') {
      habilidades = String(j.habilidades).split(',').map((x: string) => x.trim());
    }
    habilidades.forEach(h => {
      if (h) set.add(h);
    });
  });
  return Array.from(set).sort();
}

function normalizarHabilidades(h: any): string[] {
  if (!h) return [];
  if (Array.isArray(h)) return h.filter(Boolean).map((x: any) => String(x).trim());
  if (typeof h === 'string') return h.split(',').map((x: string) => x.trim()).filter(Boolean);
  return [];
}

function normalizarFormacao(f: any): string {
  if (!f) return 'Não informada';
  return String(f).trim();
}

function exportarCSV(jovens: Jovem[]) {
  const data = jovens.map(j => ({
    Nome: j.nome,
    Email: j.email,
    Idade: j.idade,
    Formação: j.formacao,
    Habilidades: (j.habilidades || []).join(', '),
    Interesses: (j.interesses || []).join(', '),
    Status: j.status
  }));
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'jovens.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getFavoritosLS() {
  try {
    return JSON.parse(localStorage.getItem('favoritos_jovens') || '[]');
  } catch {
    return [];
  }
}
function setFavoritosLS(ids: number[]) {
  localStorage.setItem('favoritos_jovens', JSON.stringify(ids));
}

const DashboardInstituicaoContratante: React.FC = () => {
  const { user } = useAuth();
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJovens, setLoadingJovens] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorJovens, setErrorJovens] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFormacao, setFiltroFormacao] = useState('');
  const [filtroHabilidade, setFiltroHabilidade] = useState('');
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [favoritos, setFavoritos] = useState<number[]>(getFavoritosLS());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOportunidades = async () => {
      try {
        setLoading(true);
        const oportunidadesData = await oportunidadeService.listarOportunidades();
        setOportunidades(oportunidadesData);
        setLoading(false);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    const fetchJovens = async () => {
      try {
        setLoadingJovens(true);
        const jovensData = await jovemService.listarJovens();
        setJovens(jovensData);
      } catch (error) {
        console.error('Erro ao carregar jovens:', error);
        setErrorJovens('Erro ao carregar jovens. Por favor, tente novamente.');
      } finally {
        setLoadingJovens(false);
      }
    };

    fetchOportunidades();
    fetchJovens();
  }, []);

  useEffect(() => {
    setFavoritos(getFavoritosLS());
  }, [jovens]);

  const todasFormacoes = Array.from(new Set(jovens.map(j => normalizarFormacao(j.formacao)).filter(Boolean))).sort();
  const todasHabilidades = getTodasHabilidades(jovens);

  const jovensFiltrados = jovens.filter(jovem => {
    if (mostrarFavoritos && !favoritos.includes(jovem.id)) return false;
    if (filtroFormacao && normalizarFormacao(jovem.formacao) !== filtroFormacao) return false;
    if (filtroHabilidade) {
      const habilidades = normalizarHabilidades(jovem.habilidades);
      if (!habilidades.includes(filtroHabilidade)) return false;
    }
    if (searchTerm && !(
      jovem.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jovem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (jovem.formacao && normalizarFormacao(jovem.formacao).toLowerCase().includes(searchTerm.toLowerCase()))
    )) return false;
    return true;
  });

  function toggleFavorito(id: number) {
    let novos: number[];
    if (favoritos.includes(id)) {
      novos = favoritos.filter(f => f !== id);
    } else {
      novos = [...favoritos, id];
    }
    setFavoritos(novos);
    setFavoritosLS(novos);
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Dashboard da Instituição Contratante</h1>
            <p className="text-cursor-text-secondary mt-1">
              Bem-vindo(a), <span className="font-medium text-cursor-text-primary">{user?.nome}</span>
            </p>
          </div>
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades Ativas</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {oportunidades.filter(o => o.status === 'Aberta').length}
            </p>
            <Link 
              to="/instituicao-contratante/oportunidades" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Total de Recomendações</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {oportunidades.reduce((acc, o) => acc + (o.total_recomendacoes || 0), 0)}
            </p>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Cadastrados</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {loadingJovens ? '-' : jovens.length}
            </p>
            <Link 
              to="/instituicao-contratante/jovens-recomendados" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/instituicao-contratante/oportunidades')}
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
              onClick={() => navigate('/instituicao-contratante/jovens-recomendados')}
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

        <div className="card overflow-hidden mb-8">
          <div className="p-6 border-b border-cursor-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Oportunidades Recentes</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-cursor-error mb-2">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Tentar novamente
                </button>
              </div>
            ) : oportunidades.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                  Nenhuma oportunidade cadastrada
                </h3>
                <p className="text-cursor-text-secondary mb-4">
                  Comece criando sua primeira oportunidade
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-cursor-background-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Recomendações
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cursor-border">
                    {oportunidades.slice(0, 5).map(oportunidade => (
                      <tr key={oportunidade.id} className="hover:bg-cursor-background-light transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                          {oportunidade.titulo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {oportunidade.tipo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`badge ${
                            oportunidade.status === 'Aberta' ? 'badge-success' : 
                            oportunidade.status === 'Fechada' ? 'badge-warning' : 
                            oportunidade.status === 'Encerrada' ? 'badge-default' :
                            'badge-error'
                          }`}>
                            {oportunidade.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {oportunidade.total_recomendacoes || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/instituicao-contratante/oportunidades/${oportunidade.id}`}
                            className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                          >
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {oportunidades.length > 5 && (
                  <div className="p-4 border-t border-cursor-border">
                    <Link 
                      to="/instituicao-contratante/oportunidades" 
                      className="text-cursor-primary hover:text-cursor-primary-dark transition-colors inline-flex items-center"
                    >
                      Ver todas as {oportunidades.length} oportunidades
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seção de Jovens Cadastrados */}
        <div id="jovens-section" className="card overflow-hidden">
          <div className="p-6 border-b border-cursor-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Jovens Cadastrados</h2>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar jovens..."
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
          
          <div className="p-6">
            {loadingJovens ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
              </div>
            ) : errorJovens ? (
              <div className="text-center py-8">
                <div className="text-cursor-error mb-2">{errorJovens}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Tentar novamente
                </button>
              </div>
            ) : jovens.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                  Nenhum jovem cadastrado no sistema
                </h3>
                <p className="text-cursor-text-secondary mb-4">
                  Aguarde até que instituições de ensino cadastrem jovens
                </p>
              </div>
            ) : jovensFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-cursor-text-secondary mb-4">
                  Tente buscar com outros termos
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-cursor-background-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Idade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Formação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Habilidades
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Favorito
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cursor-border">
                    {jovensFiltrados.map(jovem => (
                      <tr key={jovem.id} className="hover:bg-cursor-background-light transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                          {jovem.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {jovem.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {jovem.idade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {normalizarFormacao(jovem.formacao) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {normalizarHabilidades(jovem.habilidades).slice(0, 2).join(', ') + (normalizarHabilidades(jovem.habilidades).length > 2 ? '...' : '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          <button onClick={() => toggleFavorito(jovem.id)} title={favoritos.includes(jovem.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                            <span className={favoritos.includes(jovem.id) ? 'text-yellow-400 text-xl' : 'text-cursor-text-tertiary text-xl'}>
                              {favoritos.includes(jovem.id) ? '★' : '☆'}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/instituicao-contratante/jovens/${jovem.id}`}
                            className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                          >
                            Ver perfil
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de distribuição de formação */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Distribuição por Formação</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getDistribuicaoFormacao(jovens.map(j => ({ ...j, formacao: normalizarFormacao(j.formacao) })))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {getDistribuicaoFormacao(jovens.map(j => ({ ...j, formacao: normalizarFormacao(j.formacao) }))).map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Filtros e exportação */}
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block text-xs text-cursor-text-secondary mb-1">Formação</label>
            <select value={filtroFormacao} onChange={e => setFiltroFormacao(e.target.value)} className="input-field">
              <option value="">Todas</option>
              {todasFormacoes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-cursor-text-secondary mb-1">Habilidade</label>
            <select value={filtroHabilidade} onChange={e => setFiltroHabilidade(e.target.value)} className="input-field">
              <option value="">Todas</option>
              {todasHabilidades.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <button onClick={() => setMostrarFavoritos(fav => !fav)} className="btn-secondary">
            {mostrarFavoritos ? 'Mostrar Todos' : 'Mostrar Favoritos'}
          </button>
          <button onClick={() => exportarCSV(jovensFiltrados)} className="btn-primary">
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardInstituicaoContratante; 