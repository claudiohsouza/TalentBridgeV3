import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jovemService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JovensRecomendados: React.FC = () => {
  const { user } = useAuth();
  const [jovens, setJovens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[JovensRecomendados] Buscando jovens recomendados');
        const data = await jovemService.listarJovensRecomendados();
        console.log('[JovensRecomendados] Dados recebidos:', data);
        setJovens(data);
      } catch (err: any) {
        console.error('[JovensRecomendados] Erro:', err);
        setError(err.response?.data?.message || err.message || 'Erro ao buscar jovens recomendados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cursor-text-primary">Jovens Recomendados</h1>
          <button
            className="btn-secondary"
            onClick={() => navigate('/instituicao-contratante')}
          >
            Voltar ao Dashboard
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : jovens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-cursor-text-secondary">Nenhum jovem recomendado encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jovens.map((jovem) => (
              <div key={jovem.id} className="card bg-cursor-background-light shadow-cursor rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">{jovem.nome}</h3>
                <p className="text-sm text-cursor-text-secondary mb-1">{jovem.email}</p>
                <p className="text-sm text-cursor-text-secondary mb-2">
                  Formação: {jovem.formacao || 'Não informada'}
                </p>
                {jovem.recomendacoes && jovem.recomendacoes.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-cursor-text-primary mb-2">Recomendações:</h4>
                    <ul className="space-y-2">
                      {jovem.recomendacoes.map((rec: any) => (
                        <li key={rec.id} className="text-sm">
                          <div className="flex justify-between items-start">
                            <span className="text-cursor-text-secondary">{rec.oportunidade.titulo}</span>
                            <span className={`badge badge-${rec.status === 'aprovado' ? 'success' : 'warning'}`}>
                              {rec.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-cursor-text-tertiary mt-4">Sem recomendações</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JovensRecomendados; 