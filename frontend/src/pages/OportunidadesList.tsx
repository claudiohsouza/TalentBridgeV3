import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade } from '../types';
import { oportunidadeService, opcoesService } from '../services/api';

// Função utilitária para corrigir problemas de codificação
const corrigirTexto = (texto: string): string => {
  if (!texto) return '';
  
  return texto
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã\u0082/g, 'Â')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã§Ã£/g, 'ção');
};

// Função para formatar texto com capitalização e espaços
const formatarTexto = (texto: string): string => {
  if (!texto) return '';
  
  // Primeiro corrige problemas de codificação
  const textoCorrigido = corrigirTexto(texto);
  
  // Substitui underscores por espaços
  const textoComEspacos = textoCorrigido.replace(/_/g, ' ');
  
  // Lista de siglas que devem permanecer em maiúsculas
  const siglas = ['CLT', 'PJ', 'MEI', 'TI', 'RH', 'DP', 'TI'];
  
  // Capitaliza cada palavra, mantendo siglas em maiúsculas
  return textoComEspacos
    .split(' ')
    .map(palavra => {
      const palavraUpper = palavra.toUpperCase();
      if (siglas.includes(palavraUpper)) {
        return palavraUpper;
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    })
    .join(' ');
};

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
      return { text: formatarTexto(status), className: 'badge-default' };
  }
};

const OportunidadesList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [tiposVaga, setTiposVaga] = useState<string[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    area: '',
    status: 'aprovado' as Oportunidade['status'],
    requisitos: [] as string[],
    requisitoInput: '',
    beneficios: [] as string[],
    beneficioInput: '',
    salario: '',
    horario: '',
    local: '',
    data_inicio: '',
    data_fim: ''
  });

  // Mapear o papel para a URL correta
  const papelParaUrl = {
    'instituicao_ensino': 'instituicao-ensino',
    'chefe_empresa': 'chefe-empresa',
    'instituicao_contratante': 'instituicao-contratante'
  };
  const urlBase = user?.papel ? `/${papelParaUrl[user.papel]}/oportunidades` : '';

  useEffect(() => {
    fetchOportunidades();
  }, []);

  // Verificar se deve abrir o modal automaticamente
  useEffect(() => {
    const shouldOpenModal = searchParams.get('nova');
    if (shouldOpenModal === 'true' && user?.papel === 'chefe_empresa') {
      abrirModal();
      // Limpar o parâmetro da URL
      navigate(window.location.pathname, { replace: true });
    }
  }, [searchParams, user?.papel]);

  const fetchOportunidades = async () => {
    try {
      setLoading(true);
      const data = await oportunidadeService.listarOportunidades();
      setOportunidades(data);
    } catch (error) {
      setError('Erro ao carregar oportunidades');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarOpcoes = async () => {
    try {
      setLoadingOpcoes(true);
      const todasOpcoes = await opcoesService.obterTodasOpcoes();
      setTiposVaga(todasOpcoes.tipos_vaga || []);
      setAreasAtuacao(todasOpcoes.areas_atuacao || todasOpcoes.areas_interesse || []);
    } catch (error) {
      setTiposVaga(['Estágio', 'CLT', 'PJ', 'Temporário']);
      setAreasAtuacao(['Tecnologia', 'Marketing', 'RH', 'Administração', 'Engenharia']);
    } finally {
      setLoadingOpcoes(false);
    }
  };

  const abrirModal = () => {
    setShowModal(true);
    setModalError(null);
    setFormData({
      titulo: '',
      descricao: '',
      tipo: '',
      area: '',
      status: 'aprovado' as Oportunidade['status'],
      requisitos: [],
      requisitoInput: '',
      beneficios: [],
      beneficioInput: '',
      salario: '',
      horario: '',
      local: '',
      data_inicio: '',
      data_fim: ''
    });
    carregarOpcoes();
  };

  const fecharModal = () => {
    setShowModal(false);
    setModalError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRequisito = () => {
    if (formData.requisitoInput.trim() && !formData.requisitos.includes(formData.requisitoInput.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        requisitos: [...prev.requisitos, prev.requisitoInput.trim()], 
        requisitoInput: '' 
      }));
    }
  };

  const handleRemoveRequisito = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      requisitos: prev.requisitos.filter((_, i) => i !== index) 
    }));
  };

  const handleAddBeneficio = () => {
    if (formData.beneficioInput.trim() && !formData.beneficios.includes(formData.beneficioInput.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        beneficios: [...prev.beneficios, prev.beneficioInput.trim()], 
        beneficioInput: '' 
      }));
    }
  };

  const handleRemoveBeneficio = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      beneficios: prev.beneficios.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    
    try {
      await oportunidadeService.adicionarOportunidade({
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: formData.tipo,
        area: formData.area,
        status: formData.status,
        requisitos: formData.requisitos,
        beneficios: formData.beneficios,
        data_inicio: formData.data_inicio || undefined,
        data_fim: formData.data_fim || undefined
      });
      
      fecharModal();
      fetchOportunidades(); // Recarregar lista
    } catch (error: any) {
      setModalError(error.message || 'Erro ao criar oportunidade');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOportunidades = oportunidades.filter(oportunidade =>
    oportunidade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oportunidade.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oportunidade.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = user?.papel === 'chefe_empresa' ? {
    abertas: oportunidades.filter(op => op.status === 'aprovado').length,
    encerradas: oportunidades.filter(op => op.status === 'cancelado' || op.status === 'rejeitado').length,
    totalRecomendacoes: oportunidades.reduce((acc, op) => acc + (op.total_recomendacoes || 0), 0)
  } : null;

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Oportunidades</h1>
            <p className="text-cursor-text-secondary mt-1">
              Gerencie as oportunidades disponíveis
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const role = user?.papel;
                if (role) {
                  const dashboardPath = {
                    'instituicao_ensino': '/instituicao-ensino',
                    'chefe_empresa': '/chefe-empresa',
                    'instituicao_contratante': '/instituicao-contratante'
                  }[role];
                  if (dashboardPath) {
                    navigate(dashboardPath);
                  }
                }
              }}
              className="btn-secondary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </button>

            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Buscar oportunidades..."
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

            {user?.papel === 'chefe_empresa' && (
              <button
                onClick={abrirModal}
                className="btn-primary inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Oportunidade
              </button>
            )}
          </div>
        </div>

        {/* Stats for Chefe de Empresa */}
        {user?.papel === 'chefe_empresa' && stats && !loading && oportunidades.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="card p-5">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Vagas Abertas</h3>
              <p className="text-2xl font-bold text-cursor-success">{stats.abertas}</p>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Total de Recomendações</h3>
              <p className="text-2xl font-bold text-cursor-primary">{stats.totalRecomendacoes}</p>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-medium text-cursor-text-secondary mb-1">Vagas Encerradas</h3>
              <p className="text-2xl font-bold text-cursor-text-tertiary">{stats.encerradas}</p>
            </div>
          </div>
        )}

        <div className="card overflow-hidden fade-in" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="spinner rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-cursor-error mb-2">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredOportunidades.length === 0 ? (
            <div className="text-center py-8 fade-in" style={{ animationDelay: '0.3s' }}>
              {searchTerm ? (
                <>
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
                </>
              ) : (
                <>
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
                    {user?.papel === 'chefe_empresa' 
                      ? 'Comece criando sua primeira oportunidade'
                      : 'Aguarde até que empresas cadastrem oportunidades'}
                  </p>
                  {user?.papel === 'chefe_empresa' && (
                    <button 
                      onClick={abrirModal}
                      className="btn-primary"
                    >
                      Nova Oportunidade
                    </button>
                  )}
                </>
              )}
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
                      Área
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
                  {filteredOportunidades.map((oportunidade, index) => (
                    <tr 
                      key={oportunidade.id} 
                      className="hover:bg-cursor-background-light transition-colors stagger-item"
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                        {corrigirTexto(oportunidade.titulo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {formatarTexto(oportunidade.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {formatarTexto(oportunidade.area)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`badge ${getStatusInfo(oportunidade.status).className}`}>
                          {getStatusInfo(oportunidade.status).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {oportunidade.total_recomendacoes || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`${urlBase}/${oportunidade.id}`}
                          className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                        >
                          Ver detalhes
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

      {/* Modal de Nova Oportunidade */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cursor-background border border-cursor-border rounded-lg shadow-cursor-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cursor-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-cursor-text-primary">Nova Oportunidade</h2>
                <button
                  onClick={fecharModal}
                  className="text-cursor-text-tertiary hover:text-cursor-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Ex: Desenvolvedor Web Júnior"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="input-field w-full"
                    required
                    disabled={loadingOpcoes}
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposVaga.map(tipo => (
                      <option key={tipo} value={tipo}>{formatarTexto(tipo)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Área *</label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="input-field w-full"
                    required
                    disabled={loadingOpcoes}
                  >
                    <option value="">Selecione uma área</option>
                    {areasAtuacao.map(area => (
                      <option key={area} value={area}>{formatarTexto(area)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Salário/Bolsa</label>
                  <input
                    type="text"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Ex: R$ 2.000,00"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="select-field" required>
                  <option value="aprovado">Publicar Vaga (Aprovado)</option>
                  <option value="pendente">Salvar como Rascunho (Pendente)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Descrição *</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Descreva as principais atividades e responsabilidades"
                  required
                />
              </div>

              {/* Requisitos */}
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Requisitos</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="requisitoInput"
                    value={formData.requisitoInput}
                    onChange={handleChange}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequisito(); }}}
                    className="input-field flex-1"
                    placeholder="Ex: Conhecimento em React"
                  />
                  <button type="button" className="btn-secondary" onClick={handleAddRequisito}>+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requisitos.map((req, idx) => (
                    <span key={idx} className="badge badge-primary cursor-pointer" onClick={() => handleRemoveRequisito(idx)}>
                      {req} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefícios */}
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Benefícios</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="beneficioInput"
                    value={formData.beneficioInput}
                    onChange={handleChange}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBeneficio(); }}}
                    className="input-field flex-1"
                    placeholder="Ex: Vale Transporte"
                  />
                  <button type="button" className="btn-secondary" onClick={handleAddBeneficio}>+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.beneficios.map((ben, idx) => (
                    <span key={idx} className="badge badge-secondary cursor-pointer" onClick={() => handleRemoveBeneficio(idx)}>
                      {ben} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Data de Início</label>
                  <input
                    type="date"
                    name="data_inicio"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Data de Término</label>
                  <input
                    type="date"
                    name="data_fim"
                    value={formData.data_fim}
                    onChange={handleChange}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Erro */}
              {modalError && (
                <div className="p-4 bg-cursor-error/10 border border-cursor-error/20 rounded">
                  <p className="text-sm text-cursor-error">{modalError}</p>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-cursor-border">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="btn-secondary"
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Criando...' : 'Criar Oportunidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OportunidadesList; 