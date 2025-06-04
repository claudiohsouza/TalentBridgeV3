import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { opcoesService, oportunidadeService } from '../services/api';

const etapas = [
  'Informações Básicas',
  'Descrição e Requisitos',
  'Detalhes Finais'
];

// Função utilitária para formatar nomes (primeira letra maiúscula e espaços)
function formatarNome(valor: string): string {
  if (!valor) return '';
  // Substitui underscores/traços por espaço, separa camelCase, e capitaliza cada palavra
  return valor
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase para espaço
    .replace(/[_-]/g, ' ') // snake_case/kebab-case para espaço
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

const NovaOportunidade: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [tiposVaga, setTiposVaga] = useState<string[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    requisitos: [] as string[],
    requisitoInput: '',
    tipo: '',
    area: '',
    salario: '',
    beneficios: [] as string[],
    beneficioInput: '',
    horario: '',
    local: '',
    data_inicio: '',
    data_fim: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Carregar opções do banco de dados
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        setLoadingOpcoes(true);
        const todasOpcoes = await opcoesService.obterTodasOpcoes();
        setTiposVaga(todasOpcoes.tipos_vaga || []);
        setAreasAtuacao(todasOpcoes.areas_atuacao || todasOpcoes.areas_interesse || []);
        if (todasOpcoes.tipos_vaga && todasOpcoes.tipos_vaga.length > 0) {
          setFormData(prev => ({ ...prev, tipo: todasOpcoes.tipos_vaga[0] }));
        }
      } catch (error) {
        setTiposVaga(['Estágio', 'CLT', 'PJ', 'Temporário']);
        setAreasAtuacao(['Tecnologia', 'Marketing', 'RH', 'Administração', 'Engenharia']);
        setFormData(prev => ({ ...prev, tipo: 'Estágio' }));
      } finally {
        setLoadingOpcoes(false);
      }
    };
    carregarOpcoes();
  }, []);

  // Validação dos campos
  const validate = () => {
    const errors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.titulo.trim()) errors.titulo = 'Título é obrigatório';
      if (!formData.tipo) errors.tipo = 'Tipo é obrigatório';
      if (!formData.area) errors.area = 'Área é obrigatória';
    }
    if (step === 1) {
      if (!formData.descricao.trim()) errors.descricao = 'Descrição é obrigatória';
      if (formData.requisitos.length === 0) errors.requisitos = 'Adicione pelo menos um requisito';
    }
    if (step === 2) {
      if (!formData.salario.trim()) errors.salario = 'Salário é obrigatório';
      if (!formData.horario.trim()) errors.horario = 'Horário é obrigatório';
      if (!formData.local.trim()) errors.local = 'Local é obrigatório';
    }
    return errors;
  };
  const errors = validate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Adicionar/remover requisitos e benefícios
  const handleAddRequisito = () => {
    if (formData.requisitoInput.trim() && !formData.requisitos.includes(formData.requisitoInput.trim())) {
      setFormData(prev => ({ ...prev, requisitos: [...prev.requisitos, prev.requisitoInput.trim()], requisitoInput: '' }));
    }
  };
  const handleRemoveRequisito = (index: number) => {
    setFormData(prev => ({ ...prev, requisitos: prev.requisitos.filter((_, i) => i !== index) }));
  };
  const handleAddBeneficio = () => {
    if (formData.beneficioInput.trim() && !formData.beneficios.includes(formData.beneficioInput.trim())) {
      setFormData(prev => ({ ...prev, beneficios: [...prev.beneficios, prev.beneficioInput.trim()], beneficioInput: '' }));
    }
  };
  const handleRemoveBeneficio = (index: number) => {
    setFormData(prev => ({ ...prev, beneficios: prev.beneficios.filter((_, i) => i !== index) }));
  };

  const handleNext = () => {
    setTouched({});
    if (Object.keys(errors).length === 0) setStep(step + 1);
  };
  const handleBack = () => {
    setTouched({});
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({});
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError(null);
    try {
      await oportunidadeService.adicionarOportunidade({
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: formData.tipo,
        area: formData.area,
        requisitos: formData.requisitos,
        beneficios: formData.beneficios,
        data_inicio: formData.data_inicio || undefined,
        data_fim: formData.data_fim || undefined
      });
      navigate('/chefe-empresa/oportunidades');
    } catch (error) {
      setError('Erro ao criar oportunidade. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cursor-text-primary">Nova Oportunidade</h1>
          <p className="text-cursor-text-secondary mt-1">Preencha os dados da nova oportunidade</p>
          <div className="flex gap-2 mt-6">
            {etapas.map((etapa, idx) => (
              <div key={etapa} className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= idx ? 'bg-cursor-primary' : 'bg-cursor-background-light'}`}></div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="card divide-y divide-cursor-border shadow-cursor-md">
          {/* Etapa 1: Informações Básicas */}
          {step === 0 && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Título da Oportunidade *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, titulo: true }))}
                  className={`input-field w-full ${touched.titulo && errors.titulo ? 'border-cursor-error' : ''}`}
                  placeholder="Ex: Desenvolvedor Web Júnior"
                  required
                />
                {touched.titulo && errors.titulo && <p className="text-cursor-error text-xs mt-1">{errors.titulo}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Tipo de Vaga *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, tipo: true }))}
                    className={`input-field w-full ${touched.tipo && errors.tipo ? 'border-cursor-error' : ''}`}
                    required
                    disabled={loadingOpcoes}
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposVaga.map(tipo => (
                      <option key={tipo} value={tipo}>{formatarNome(tipo)}</option>
                    ))}
                  </select>
                  {touched.tipo && errors.tipo && <p className="text-cursor-error text-xs mt-1">{errors.tipo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Área *</label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, area: true }))}
                    className={`input-field w-full ${touched.area && errors.area ? 'border-cursor-error' : ''}`}
                    required
                    disabled={loadingOpcoes}
                  >
                    <option value="">Selecione uma área</option>
                    {areasAtuacao.map(area => (
                      <option key={area} value={area}>{formatarNome(area)}</option>
                    ))}
                  </select>
                  {touched.area && errors.area && <p className="text-cursor-error text-xs mt-1">{errors.area}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-8">
                <button type="button" className="btn-primary" onClick={handleNext} disabled={Object.keys(errors).length > 0}>Próximo</button>
              </div>
            </div>
          )}
          {/* Etapa 2: Descrição e Requisitos */}
          {step === 1 && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Descrição *</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, descricao: true }))}
                  className={`input-field w-full ${touched.descricao && errors.descricao ? 'border-cursor-error' : ''}`}
                  rows={4}
                  placeholder="Descreva as principais atividades e responsabilidades"
                  required
                />
                {touched.descricao && errors.descricao && <p className="text-cursor-error text-xs mt-1">{errors.descricao}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Requisitos *</label>
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
                  <button type="button" className="btn-primary" onClick={handleAddRequisito}>Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requisitos.map((req, idx) => (
                    <span key={idx} className="badge badge-primary cursor-pointer" onClick={() => handleRemoveRequisito(idx)}>{req} ×</span>
                  ))}
                </div>
                {touched.requisitos && errors.requisitos && <p className="text-cursor-error text-xs mt-1">{errors.requisitos}</p>}
              </div>
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
                  <button type="button" className="btn-primary" onClick={handleAddBeneficio}>Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.beneficios.map((ben, idx) => (
                    <span key={idx} className="badge badge-secondary cursor-pointer" onClick={() => handleRemoveBeneficio(idx)}>{ben} ×</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-8">
                <button type="button" className="btn-secondary" onClick={handleBack}>Voltar</button>
                <button type="button" className="btn-primary" onClick={handleNext} disabled={Object.keys(errors).length > 0}>Próximo</button>
              </div>
            </div>
          )}
          {/* Etapa 3: Detalhes Finais */}
          {step === 2 && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Salário/Bolsa *</label>
                  <input
                    type="text"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, salario: true }))}
                    className={`input-field w-full ${touched.salario && errors.salario ? 'border-cursor-error' : ''}`}
                    placeholder="Ex: R$ 2.000,00 ou A combinar"
                    required
                  />
                  {touched.salario && errors.salario && <p className="text-cursor-error text-xs mt-1">{errors.salario}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-primary mb-1">Horário *</label>
                  <input
                    type="text"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, horario: true }))}
                    className={`input-field w-full ${touched.horario && errors.horario ? 'border-cursor-error' : ''}`}
                    placeholder="Ex: Segunda a Sexta, 09h às 16h"
                    required
                  />
                  {touched.horario && errors.horario && <p className="text-cursor-error text-xs mt-1">{errors.horario}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-cursor-text-primary mb-1">Local de Trabalho *</label>
                <input
                  type="text"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, local: true }))}
                  className={`input-field w-full ${touched.local && errors.local ? 'border-cursor-error' : ''}`}
                  placeholder="Ex: Remoto, Híbrido ou Presencial (Endereço)"
                  required
                />
                {touched.local && errors.local && <p className="text-cursor-error text-xs mt-1">{errors.local}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex justify-between gap-2 mt-8">
                <button type="button" className="btn-secondary" onClick={handleBack}>Voltar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Criar Oportunidade'}</button>
              </div>
              {error && (
                <div className="p-4 bg-cursor-error/10 border-t border-cursor-error/20 mt-4 rounded">
                  <p className="text-xs text-cursor-error">{error}</p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NovaOportunidade; 