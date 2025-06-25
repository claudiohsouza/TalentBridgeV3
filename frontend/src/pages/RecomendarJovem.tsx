import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Jovem, Oportunidade } from '../types';
import { jovemService, oportunidadeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { avaliacoesService } from '../services/avaliacoes';

interface MatchScore {
  jovem: Jovem;
  score: number;
  matchPercentage: number;
  reasons: string[];
  isOverqualified: boolean;
}

const RecomendarJovem: React.FC = () => {
  const { id: oportunidadeId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null);
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [selectedJovens, setSelectedJovens] = useState<number[]>([]);
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!oportunidadeId) {
          throw new Error('ID da oportunidade não fornecido');
        }

        // Buscar dados da oportunidade
        const oportunidadeData = await oportunidadeService.getOportunidade(parseInt(oportunidadeId));
        setOportunidade(oportunidadeData);

        // Buscar lista de jovens
        const jovensList = await jovemService.listarJovens();
        setJovens(jovensList);

        // Analisar matches
        await analyzeMatches(jovensList, oportunidadeData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [oportunidadeId]);

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim();
  };

  const analyzeMatches = async (jovensList: Jovem[], oportunidadeData: Oportunidade) => {
    console.log('[AnalyzeMatches] Iniciando análise de matches');
    console.log(`[AnalyzeMatches] Total de jovens: ${jovensList.length}`);
    
    const matches = await Promise.all(
      jovensList.map(jovem => calculateMatchScore(jovem, oportunidadeData))
    );

    // Filtrar apenas os jovens com match maior que 0%
    const validMatches = matches.filter(match => match.matchPercentage > 0);
    
    // Ordenar por porcentagem de match (maior para menor)
    const sortedMatches = validMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    console.log(`[AnalyzeMatches] Matches válidos encontrados: ${validMatches.length}`);
    setMatchScores(sortedMatches);
  };

  // Função auxiliar para verificar correspondência entre strings
  const checkStringMatch = (str1: string, str2: string): boolean => {
    const normalized1 = normalizeString(str1);
    const normalized2 = normalizeString(str2);
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  };

  // Função para analisar correspondência de requisitos
  const analyzeRequirements = (jovem: Jovem, requisitos: string[]): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];
    const matchedReqs = new Set<string>();

    // Normalizar habilidades e interesses do jovem
    const habilidades = Array.isArray(jovem.habilidades) ? jovem.habilidades : [];
    const interesses = Array.isArray(jovem.interesses) ? jovem.interesses : [];
    const formacao = jovem.formacao ? normalizeString(jovem.formacao) : '';
    const curso = jovem.curso ? normalizeString(jovem.curso) : '';

    // Analisar cada requisito
    requisitos.forEach(requisito => {
      const reqNormalizado = normalizeString(requisito);
      let matched = false;

      // Verificar correspondência com formação/curso
      if (formacao && checkStringMatch(formacao, reqNormalizado)) {
        score += 2; // Pontuação maior para correspondência com formação
        reasons.push(`Formação em ${formacao} atende ao requisito: ${requisito}`);
        matched = true;
      }
      if (curso && checkStringMatch(curso, reqNormalizado)) {
        score += 2;
        reasons.push(`Curso em ${curso} atende ao requisito: ${requisito}`);
        matched = true;
      }

      // Verificar correspondência com habilidades
      habilidades.forEach(habilidade => {
        if (checkStringMatch(habilidade, reqNormalizado)) {
          score += 1.5;
          reasons.push(`Habilidade em ${habilidade} atende ao requisito: ${requisito}`);
          matched = true;
        }
      });

      // Verificar correspondência com interesses
      interesses.forEach(interesse => {
        if (checkStringMatch(interesse, reqNormalizado)) {
          score += 1;
          reasons.push(`Interesse em ${interesse} relacionado ao requisito: ${requisito}`);
          matched = true;
        }
      });

      if (matched) {
        matchedReqs.add(requisito);
      }
    });

    // Bônus para requisitos não atendidos mas com habilidades relacionadas
    requisitos.forEach(requisito => {
      if (!matchedReqs.has(requisito)) {
        const reqNormalizado = normalizeString(requisito);
        
        // Verificar se alguma habilidade ou interesse está relacionado
        const hasRelatedSkill = habilidades.some(h => 
          checkStringMatch(h, reqNormalizado) || 
          h.toLowerCase().includes(reqNormalizado) || 
          reqNormalizado.includes(h.toLowerCase())
        );

        if (hasRelatedSkill) {
          score += 0.5;
          reasons.push(`Possui habilidades relacionadas ao requisito: ${requisito}`);
        }
      }
    });

    return { score, reasons };
  };

  const calculateMatchScore = async (jovem: Jovem, oportunidade: Oportunidade): Promise<MatchScore> => {
    let score = 0;
    const reasons: string[] = [];
    let isOverqualified = false;

    console.log(`[MatchScore] ====== Iniciando cálculo de score ======`);
    console.log(`[MatchScore] Jovem: ${jovem.nome} (ID: ${jovem.id})`);
    console.log(`[MatchScore] Oportunidade: ${oportunidade.titulo} (ID: ${oportunidade.id})`);

    // Garantir que requisitos seja um array e normalize
    const requisitos = Array.isArray(oportunidade.requisitos) 
      ? oportunidade.requisitos 
      : typeof oportunidade.requisitos === 'string' 
        ? [oportunidade.requisitos] 
        : [];

    // Analisar correspondência de requisitos
    const { score: reqScore, reasons: reqReasons } = analyzeRequirements(jovem, requisitos);
    score += reqScore;
    reasons.push(...reqReasons);

    // Calcular porcentagem de match
    const maxPossibleScore = requisitos.length * 2; // 2 pontos por requisito (formação/curso)
    const matchPercentage = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;

    console.log(`[MatchScore] Score final: ${score}`);
    console.log(`[MatchScore] Porcentagem de match: ${matchPercentage}%`);
    console.log(`[MatchScore] Razões:`, reasons);

    return {
      jovem,
      score,
      matchPercentage,
      reasons,
      isOverqualified
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oportunidadeId || selectedJovens.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Enviar as recomendações
      await Promise.all(selectedJovens.map(jovemId => 
        oportunidadeService.recomendarJovem({
          jovem_id: jovemId,
          oportunidade_id: parseInt(oportunidadeId),
          justificativa: justificativa || 'Recomendação baseada no sistema de matching'
        })
      ));

      setSuccess('Recomendações enviadas com sucesso!');
      
      // Atualizar a oportunidade atual para refletir o novo número de recomendações
      const oportunidadeAtualizada = await oportunidadeService.getOportunidade(parseInt(oportunidadeId));
      setOportunidade(oportunidadeAtualizada);
      
      // Atualizar a lista de jovens para refletir as novas recomendações
      const jovensAtualizados = await jovemService.listarJovens();
      setJovens(jovensAtualizados);
      
      // Aguardar um momento para mostrar a mensagem de sucesso antes de redirecionar
      setTimeout(() => navigate('/chefe-empresa/oportunidades'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar recomendações');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  if (!oportunidade) {
    return <div>Oportunidade não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-cursor-text-primary mb-6">Recomendação de Jovens para a Oportunidade</h1>
        {/* Card da Oportunidade */}
        <div className="card mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">{oportunidade.titulo}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-sm text-cursor-text-tertiary">Empresa</p>
              <p className="font-medium text-cursor-text-primary">{oportunidade.empresa_nome}</p>
            </div>
            <div>
              <p className="text-sm text-cursor-text-tertiary">Tipo</p>
              <p className="font-medium text-cursor-text-primary">{oportunidade.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-cursor-text-tertiary">Área</p>
              <p className="font-medium text-cursor-text-primary">{oportunidade.area}</p>
            </div>
            <div>
              <p className="text-sm text-cursor-text-tertiary">Status</p>
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
          <div className="mt-4">
            <p className="text-sm text-cursor-text-tertiary">Descrição</p>
            <p className="mt-1 text-cursor-text-primary whitespace-pre-line">{oportunidade.descricao}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-cursor-text-tertiary">Requisitos</p>
            <ul className="mt-1 list-disc list-inside text-cursor-text-primary">
              {Array.isArray(oportunidade.requisitos) 
                ? oportunidade.requisitos.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))
                : <li>{oportunidade.requisitos}</li>
              }
            </ul>
          </div>
        </div>

        {/* Lista de Jovens Recomendados */}
        <div className="card mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Jovens Recomendados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchScores.map((match) => (
              <div
                key={match.jovem.id}
                className="card bg-cursor-background-light shadow-cursor rounded-lg p-4 flex flex-col h-full border border-cursor-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-cursor-text-primary">{match.jovem.nome}</span>
                  <span className="badge badge-info">{Math.round(match.matchPercentage)}% match</span>
                </div>
                <div className="text-sm text-cursor-text-tertiary mb-1">{match.jovem.email}</div>
                <div className="text-xs text-cursor-text-secondary mb-2">
                  <span className="block">Formação: {match.jovem.formacao}</span>
                  <span className="block">Idade: {match.jovem.idade} anos</span>
                </div>
                <div className="mb-2">
                  <span className="text-xs font-medium text-cursor-text-primary">Razões do Match:</span>
                  <ul className="text-xs text-cursor-text-secondary mt-1 list-disc list-inside">
                    {match.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setSelectedJovens(prev =>
                      prev.includes(match.jovem.id)
                        ? prev.filter(id => id !== match.jovem.id)
                        : [...prev, match.jovem.id]
                    );
                  }}
                  className={`mt-auto btn-primary w-full ${
                    selectedJovens.includes(match.jovem.id)
                      ? 'bg-red-500 hover:bg-red-600 text-white' // Alternativa: btn-danger
                      : ''
                  }`}
                >
                  {selectedJovens.includes(match.jovem.id) ? 'Remover' : 'Selecionar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de Recomendação */}
        <form onSubmit={handleSubmit} className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Enviar Recomendações</h2>
          <p className="text-sm text-cursor-text-secondary mb-4">
            {selectedJovens.length} jovem(ns) selecionado(s)
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Justificativa (opcional)"
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={selectedJovens.length === 0 || loading}
              className="btn-primary px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Recomendações'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/chefe-empresa/oportunidades')}
              className="btn-secondary px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </form>

        {success && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg">
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecomendarJovem; 