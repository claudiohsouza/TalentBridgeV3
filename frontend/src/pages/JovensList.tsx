import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem } from '../types';
import { jovemService } from '../services/api';

const JovensList: React.FC = () => {
  const { user } = useAuth();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJovens = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[JovensList] Buscando lista de jovens');
        
        const data = await jovemService.listarJovens();
        console.log('[JovensList] Jovens carregados:', data.length);
        setJovens(data);
      } catch (error: any) {
        console.error('[JovensList] Erro ao carregar jovens:', error);
        setError(error.message || 'Erro ao carregar jovens. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchJovens();
  }, []);

  const handleNovoJovem = () => {
    navigate('/instituicao-ensino/jovens/novo');
  };

  const handleVerDetalhes = (jovemId: number) => {
    const papelParaUrl = {
      'instituicao_ensino': 'instituicao-ensino',
      'chefe_empresa': 'chefe-empresa',
      'instituicao_contratante': 'instituicao-contratante'
    };
    const urlPapel = user?.papel ? papelParaUrl[user.papel] : '';
    const path = `/${urlPapel}/jovens/${jovemId}`;
    console.log('[JovensList] Navegando para:', path);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Botão de Voltar */}
        <div className="mb-4">
          <button
            onClick={() => {
              const papelParaUrl = {
                'instituicao_ensino': 'instituicao-ensino',
                'chefe_empresa': 'chefe-empresa',
                'instituicao_contratante': 'instituicao-contratante'
              };
              const urlPapel = user?.papel ? papelParaUrl[user.papel] : '';
              navigate(`/${urlPapel}`);
            }}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Jovens</h1>
            <p className="text-cursor-text-secondary mt-1">
              Total de {jovens.length} jovens cadastrados
            </p>
          </div>
          {user?.papel === 'instituicao_ensino' && (
            <button 
              onClick={handleNovoJovem}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Jovem
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {jovens.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
              Nenhum jovem encontrado
            </h3>
            {user?.papel === 'instituicao_ensino' && (
              <>
                <p className="text-cursor-text-secondary mb-4">
                  Comece adicionando seu primeiro jovem ao sistema
                </p>
                <button 
                  onClick={handleNovoJovem}
                  className="btn-primary"
                >
                  Adicionar Jovem
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jovens.map(jovem => (
              <div 
                key={jovem.id} 
                className="card p-6 hover:border-cursor-primary transition-colors duration-300 cursor-pointer"
                onClick={() => handleVerDetalhes(jovem.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-cursor-text-primary">{jovem.nome}</h3>
                    <p className="text-sm text-cursor-text-secondary">{jovem.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    jovem.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                    jovem.status === 'Inativo' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {jovem.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-cursor-text-secondary">Formação</p>
                    <p className="text-cursor-text-primary">{jovem.formacao}</p>
                  </div>
                  
                  {jovem.habilidades && jovem.habilidades.length > 0 && (
                    <div>
                      <p className="text-sm text-cursor-text-secondary mb-2">Habilidades</p>
                      <div className="flex flex-wrap gap-2">
                        {jovem.habilidades.slice(0, 3).map((habilidade, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block bg-cursor-background-light text-cursor-text-primary px-2 py-1 rounded-full text-xs"
                          >
                            {habilidade}
                          </span>
                        ))}
                        {jovem.habilidades.length > 3 && (
                          <span className="text-cursor-text-tertiary text-xs">
                            +{jovem.habilidades.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JovensList; 