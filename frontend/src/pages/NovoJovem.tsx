import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jovemService, opcoesService } from '../services/api';
import { JovemInput } from '../types';

interface FormData {
  nome: string;
  email: string;
  idade: string;
  formacao: string;
  curso: string;
  habilidades: string[];
  interesses: string[];
  planos_futuros: string;
}

const NovoJovem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se não for instituição de ensino
  useEffect(() => {
    if (user?.papel !== 'instituicao_ensino') {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    idade: '',
    formacao: '',
    curso: '',
    habilidades: [],
    interesses: [],
    planos_futuros: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{mensagem: string, tipo: 'success' | 'error'} | null>(null);
  const [loadingOpcoes, setLoadingOpcoes] = useState(true);
  const [opcoes, setOpcoes] = useState<{
    formacoes: string[];
    cursos: string[];
    habilidades: string[];
    interesses: string[];
  }>({
    formacoes: [],
    cursos: [],
    habilidades: [],
    interesses: []
  });

  // Carregar opções do sistema
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        setLoadingOpcoes(true);
        console.log('[NovoJovem] Carregando opções do sistema...');
        
        const [formacoes, habilidades, interesses] = await Promise.all([
          opcoesService.obterOpcoesPorCategoria('formacoes'),
          opcoesService.obterOpcoesPorCategoria('habilidades'),
          opcoesService.obterOpcoesPorCategoria('areas_interesse')
        ]);

        console.log('[NovoJovem] Dados recebidos:', { formacoes, habilidades, interesses });

        // Verificar se os dados são arrays e extrair valores
        const formacoesArray = Array.isArray(formacoes) ? formacoes : [];
        const habilidadesArray = Array.isArray(habilidades) ? habilidades : [];
        const interessesArray = Array.isArray(interesses) ? interesses : [];

        setOpcoes({
          formacoes: formacoesArray.map((f: any) => f.valor || f),
          cursos: [], // Será preenchido baseado na formação
          habilidades: habilidadesArray.map((h: any) => h.valor || h),
          interesses: interessesArray.map((i: any) => i.valor || i)
        });

        console.log('[NovoJovem] Opções configuradas com sucesso');
      } catch (error) {
        console.error('[NovoJovem] Erro ao carregar opções:', error);
        setFeedback({
          mensagem: 'Erro ao carregar opções do sistema',
          tipo: 'error'
        });
        
        // Definir opções padrão em caso de erro
        setOpcoes({
          formacoes: [],
          cursos: [],
          habilidades: [],
          interesses: []
        });
      } finally {
        setLoadingOpcoes(false);
      }
    };

    carregarOpcoes();
  }, []);

  // Atualizar cursos disponíveis quando a formação mudar
  useEffect(() => {
    const carregarCursos = async () => {
      if (!formData.formacao) return;

      try {
        console.log('[NovoJovem] Carregando cursos para formação:', formData.formacao);
        const cursos = await opcoesService.obterOpcoesPorCategoria('area_ensino');
        
        // Verificar se os dados são um array
        const cursosArray = Array.isArray(cursos) ? cursos : [];
        
        setOpcoes(prev => ({
          ...prev,
          cursos: cursosArray.map((c: any) => c.valor || c)
        }));
        
        console.log('[NovoJovem] Cursos carregados:', cursosArray.length);
      } catch (error) {
        console.error('[NovoJovem] Erro ao carregar cursos:', error);
        setOpcoes(prev => ({
          ...prev,
          cursos: []
        }));
      }
    };

    carregarCursos();
  }, [formData.formacao]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (name: string, value: string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.idade) {
      newErrors.idade = 'Idade é obrigatória';
    } else if (parseInt(formData.idade) < 14 || parseInt(formData.idade) > 29) {
      newErrors.idade = 'Idade deve estar entre 14 e 29 anos';
    }

    if (!formData.formacao) {
      newErrors.formacao = 'Formação é obrigatória';
    }

    if (['superior', 'pos_graduacao'].includes(formData.formacao) && !formData.curso) {
      newErrors.curso = 'Curso é obrigatório para formação superior';
    }

    if (!formData.habilidades.length) {
      newErrors.habilidades = 'Pelo menos uma habilidade é obrigatória';
    }

    if (!formData.interesses.length) {
      newErrors.interesses = 'Pelo menos um interesse é obrigatório';
    }

    if (!formData.planos_futuros.trim()) {
      newErrors.planos_futuros = 'Planos futuros são obrigatórios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFeedback({
        mensagem: 'Por favor, corrija os erros no formulário',
        tipo: 'error'
      });
      return;
    }

    setLoading(true);
    setFeedback(null);
    
    try {
      await jovemService.adicionarJovem({
        ...formData,
        idade: parseInt(formData.idade)
      });
      
      setFeedback({
        mensagem: 'Jovem adicionado com sucesso!',
        tipo: 'success'
      });
      
      setTimeout(() => {
        navigate('/instituicao-ensino');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao adicionar jovem:', error);
      
      setFeedback({
        mensagem: error.response?.data?.message || error.message || 'Erro ao adicionar jovem',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.papel !== 'instituicao_ensino') {
    return null;
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Botão de Voltar */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/instituicao-ensino')}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Novo Jovem</h1>
            <p className="text-cursor-text-secondary mt-1">Adicione um novo jovem ao sistema</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-8 p-4 rounded-lg ${
            feedback.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback.mensagem}
          </div>
        )}

        <div className="card p-6 fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.nome && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fade-in">
                <strong className="font-bold">Erro! </strong>
                <span className="block sm:inline">{errors.nome}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                  Idade *
                </label>
                <input
                  type="number"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  required
                  min="14"
                  max="29"
                  className="input-field w-full"
                  placeholder="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                  Formação *
                </label>
                <select
                  name="formacao"
                  value={formData.formacao}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.formacao ? 'border-cursor-error' : ''}`}
                  required
                >
                  <option value="">Selecione uma formação</option>
                  {opcoes.formacoes.map((formacao) => (
                    <option key={formacao} value={formacao}>
                      {formacao.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
                {errors.formacao && (
                  <p className="mt-1 text-sm text-cursor-error">{errors.formacao}</p>
                )}
              </div>

              {formData.formacao && ['superior', 'pos_graduacao'].includes(formData.formacao) && (
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                    Curso *
                  </label>
                  <select
                    name="curso"
                    value={formData.curso}
                    onChange={handleChange}
                    className={`input-field w-full ${errors.curso ? 'border-cursor-error' : ''}`}
                    required
                  >
                    <option value="">Selecione um curso</option>
                    {opcoes.cursos.map((curso) => (
                      <option key={curso} value={curso}>
                        {curso.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                  {errors.curso && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.curso}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                Habilidades *
              </label>
              <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                {loadingOpcoes ? (
                  <p className="text-cursor-text-secondary">Carregando opções...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opcoes.habilidades.map((habilidade) => {
                      const selected = formData.habilidades.includes(habilidade);
                      return (
                        <button
                          type="button"
                          key={habilidade}
                          onClick={() => {
                            const newValue = selected
                              ? formData.habilidades.filter(h => h !== habilidade)
                              : [...formData.habilidades, habilidade];
                            handleArrayChange('habilidades', newValue);
                          }}
                          className={`flex items-center w-full text-left px-3 py-2 rounded transition border border-transparent hover:border-cursor-primary focus:outline-none ${selected ? 'bg-cursor-background-light font-semibold text-cursor-primary' : 'bg-transparent text-white'}`}
                        >
                          <span className={`mr-2 text-lg ${selected ? 'visible' : 'invisible'}`}>✓</span>
                          {habilidade.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {errors.habilidades && (
                <p className="mt-1 text-sm text-cursor-error">{errors.habilidades}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                Interesses *
              </label>
              <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                {loadingOpcoes ? (
                  <p className="text-cursor-text-secondary">Carregando opções...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opcoes.interesses.map((interesse) => {
                      const selected = formData.interesses.includes(interesse);
                      return (
                        <button
                          type="button"
                          key={interesse}
                          onClick={() => {
                            const newValue = selected
                              ? formData.interesses.filter(i => i !== interesse)
                              : [...formData.interesses, interesse];
                            handleArrayChange('interesses', newValue);
                          }}
                          className={`flex items-center w-full text-left px-3 py-2 rounded transition border border-transparent hover:border-cursor-primary focus:outline-none ${selected ? 'bg-cursor-background-light font-semibold text-cursor-primary' : 'bg-transparent text-white'}`}
                        >
                          <span className={`mr-2 text-lg ${selected ? 'visible' : 'invisible'}`}>✓</span>
                          {interesse.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {errors.interesses && (
                <p className="mt-1 text-sm text-cursor-error">{errors.interesses}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-primary mb-2">
                Planos Futuros *
              </label>
              <textarea
                name="planos_futuros"
                value={formData.planos_futuros}
                onChange={handleChange}
                rows={4}
                className={`input-field w-full ${errors.planos_futuros ? 'border-cursor-error' : ''}`}
                required
                placeholder="Descreva os planos futuros do jovem..."
              />
              {errors.planos_futuros && (
                <p className="mt-1 text-sm text-cursor-error">{errors.planos_futuros}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/instituicao-ensino')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Jovem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NovoJovem; 