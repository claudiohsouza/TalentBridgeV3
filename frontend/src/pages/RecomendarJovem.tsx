import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Jovem } from '../types';
import { jovemService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { avaliacoesService } from '../services/avaliacoes';

const RecomendarJovem: React.FC = () => {
  const { id: oportunidadeId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [selectedJovem, setSelectedJovem] = useState<string>('');
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [detalhesJovem, setDetalhesJovem] = useState<Jovem | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [mediaGeral, setMediaGeral] = useState<number | null>(null);

  useEffect(() => {
    const fetchJovens = async () => {
      try {
        setLoading(true);
        const data = await jovemService.listarJovens();
        setJovens(data);
      } catch (error: any) {
        setError(error.message || 'Erro ao carregar jovens');
      } finally {
        setLoading(false);
      }
    };

    fetchJovens();
  }, []);

  // Buscar detalhes, histórico e avaliações ao selecionar jovem
  useEffect(() => {
    if (!selectedJovem) {
      setDetalhesJovem(null);
      setHistorico([]);
      setAvaliacoes([]);
      setMediaGeral(null);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const jovem = await jovemService.getJovem(Number(selectedJovem));
        setDetalhesJovem(jovem);
        const hist = await jovemService.obterHistoricoJovem(Number(selectedJovem));
        setHistorico(hist);
        const avs = await avaliacoesService.obterAvaliacoesJovem(Number(selectedJovem));
        setAvaliacoes(avs.avaliacoes);
        setMediaGeral(avs.media_geral);
      } catch (e) {
        // Trate erros se necessário
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedJovem]);

  // Filtrar jovens pelo termo de busca
  const jovensFiltrados = search
    ? jovens.filter(j =>
        j.nome.toLowerCase().includes(search.toLowerCase()) ||
        j.email.toLowerCase().includes(search.toLowerCase())
      )
    : jovens;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedJovem || !justificativa.trim()) {
      setError('Selecione um jovem e preencha a justificativa.');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/recomendacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jovem_id: selectedJovem,
          oportunidade_id: oportunidadeId,
          justificativa
        })
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || data.message || 'Erro ao recomendar jovem.');
        }
      });
      setSuccess('Recomendação enviada com sucesso!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title">Recomendar Jovem</h1>
          <p className="section-subtitle">
            Escolha um jovem, visualize seu histórico e avaliações, e envie sua recomendação para a oportunidade.
          </p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Selecione o Jovem *</label>
              <input
                type="text"
                className="input-field w-full mb-2"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <select
                className="input-field w-full"
                value={selectedJovem}
                onChange={e => setSelectedJovem(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {jovensFiltrados.map(jovem => (
                  <option key={jovem.id} value={jovem.id}>
                    {jovem.nome} ({jovem.email})
                    {typeof jovem.media_geral === 'number' ? ` - Média: ${jovem.media_geral.toFixed(1)}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Card resumo do jovem selecionado */}
            {detalhesJovem && (
              <div className="card bg-cursor-background-light border border-cursor-border rounded-lg p-4 mt-6">
                <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Resumo do Jovem</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-sm text-cursor-text-secondary">Nome</span>
                    <div className="text-cursor-text-primary font-medium">{detalhesJovem.nome}</div>
                  </div>
                  <div>
                    <span className="text-sm text-cursor-text-secondary">Email</span>
                    <div className="text-cursor-text-primary font-medium">{detalhesJovem.email}</div>
                  </div>
                  <div>
                    <span className="text-sm text-cursor-text-secondary">Formação</span>
                    <div className="text-cursor-text-primary">{detalhesJovem.formacao} {detalhesJovem.curso && `- ${detalhesJovem.curso}`}</div>
                  </div>
                  <div>
                    <span className="text-sm text-cursor-text-secondary">Média Geral</span>
                    <div className="text-cursor-text-primary">{mediaGeral !== null ? mediaGeral.toFixed(1) : '-'}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-cursor-text-secondary font-medium">Histórico</span>
                  <ul className="list-disc ml-5 text-cursor-text-primary mt-1">
                    {historico.slice(0, 3).map((h, i) => (
                      <li key={i}>{h.titulo} ({h.tipo})</li>
                    ))}
                    {historico.length === 0 && <li>Nenhum histórico cadastrado</li>}
                  </ul>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-cursor-text-secondary font-medium">Avaliações recentes</span>
                  <ul className="list-disc ml-5 text-cursor-text-primary mt-1">
                    {avaliacoes.slice(0, 3).map((a, i) => (
                      <li key={i}>
                        {a.categoria_nome}: <b>{a.nota}</b> {a.comentario && `- "${a.comentario}"`}
                      </li>
                    ))}
                    {avaliacoes.length === 0 && <li>Nenhuma avaliação cadastrada</li>}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Justificativa *</label>
              <textarea
                className="input-field w-full"
                value={justificativa}
                onChange={e => setJustificativa(e.target.value)}
                rows={4}
                placeholder="Explique por que este jovem é indicado para a vaga"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-2">{error}</div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-2">{success}</div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Enviando...' : 'Recomendar'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecomendarJovem; 