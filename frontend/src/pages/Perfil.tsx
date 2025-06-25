import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';
import { FaUserEdit, FaSave, FaTimes, FaKey, FaSpinner } from 'react-icons/fa';

const estados = [
  { id: 1, sigla: 'AC', nome: 'Acre' },
  { id: 2, sigla: 'AL', nome: 'Alagoas' },
  { id: 3, sigla: 'AP', nome: 'Amapá' },
  { id: 4, sigla: 'AM', nome: 'Amazonas' },
  { id: 5, sigla: 'BA', nome: 'Bahia' },
  { id: 6, sigla: 'CE', nome: 'Ceará' },
  { id: 7, sigla: 'DF', nome: 'Distrito Federal' },
  { id: 8, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 9, sigla: 'GO', nome: 'Goiás' },
  { id: 10, sigla: 'MA', nome: 'Maranhão' },
  { id: 11, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 12, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 13, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 14, sigla: 'PA', nome: 'Pará' },
  { id: 15, sigla: 'PB', nome: 'Paraíba' },
  { id: 16, sigla: 'PR', nome: 'Paraná' },
  { id: 17, sigla: 'PE', nome: 'Pernambuco' },
  { id: 18, sigla: 'PI', nome: 'Piauí' },
  { id: 19, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 20, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 21, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 22, sigla: 'RO', nome: 'Rondônia' },
  { id: 23, sigla: 'RR', nome: 'Roraima' },
  { id: 24, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 25, sigla: 'SP', nome: 'São Paulo' },
  { id: 26, sigla: 'SE', nome: 'Sergipe' },
  { id: 27, sigla: 'TO', nome: 'Tocantins' }
];

const tiposInstituicaoEnsinoPreSet = [
  'Universidade Pública',
  'Universidade Privada',
  'Instituto Técnico',
  'Escola Técnica',
  'Escola de Ensino Médio',
  'Outra'
];

const opcoesEnsino = [
  'Tecnologia da Informação',
  'Engenharia de Software',
  'Ciência da Computação',
  'Análise de Dados',
  'Engenharia Mecânica',
  'Engenharia Elétrica',
  'Engenharia Civil',
  'Administração',
  'Marketing Digital',
  'Design',
  'Medicina',
  'Enfermagem',
  'Psicologia',
  'Direito',
  'Contabilidade',
  'Recursos Humanos',
  'Comunicação',
  'Gestão de Projetos',
  'Economia',
  'Arquitetura'
];

const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<{mensagem: string, tipo: 'success' | 'error'} | null>(null);
  
  const [originalData, setOriginalData] = useState<any>({});
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    localizacao: '',
    tipo: '',
    areas_ensino: [] as string[],
    qtd_alunos: '',
    empresa: '',
    setor: '',
    porte: '',
    areas_atuacao: [] as string[],
    areas_interesse: [] as string[],
    programas_sociais: [] as string[]
  });

  useEffect(() => {
    if (user) {
      const initialData = {
        nome: user.nome || '',
        email: user.email || '',
        localizacao: user.perfil?.localizacao || '',
        tipo: user.perfil?.tipo || '',
        areas_ensino: user.perfil?.areas_ensino || [],
        qtd_alunos: user.perfil?.qtd_alunos || '',
        empresa: user.perfil?.empresa || '',
        setor: user.perfil?.setor || '',
        porte: user.perfil?.porte || '',
        areas_atuacao: user.perfil?.areas_atuacao || [],
        areas_interesse: user.perfil?.areas_interesse || [],
        programas_sociais: user.perfil?.programas_sociais || []
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
    setFeedback(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(originalData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    
    try {
      await updateUser(formData);
      setFeedback({
        mensagem: 'Perfil atualizado com sucesso!',
        tipo: 'success'
      });
      setEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setFeedback({
        mensagem: 'Erro ao atualizar perfil. Tente novamente.',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const InfoField = ({ label, value }: { label: string, value: string | number | undefined | null }) => (
    <div>
      <p className="text-sm font-medium text-cursor-text-secondary">{label}</p>
      <p className="mt-1 text-cursor-text-primary">{value || 'Não informado'}</p>
    </div>
  );

  const InfoTags = ({ label, values }: { label: string, values: string[] | undefined }) => (
    <div className="md:col-span-2">
      <p className="text-sm font-medium text-cursor-text-secondary">{label}</p>
      {values && values.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((item: string, index: number) => (
            <span key={index} className="badge badge-primary">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-cursor-text-tertiary">Nenhuma área informada</p>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-cursor-background flex items-center justify-center">
        <FaSpinner className="animate-spin text-cursor-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cursor-background py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-cursor-text-primary">Meu Perfil</h1>
          <p className="text-cursor-text-secondary mt-1">Visualize e edite suas informações de perfil.</p>
        </header>

        {feedback && (
          <div className={`p-4 mb-6 rounded-lg ${feedback.tipo === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {feedback.mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* INFORMAÇÕES BÁSICAS */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-cursor-text-primary">Informações Básicas</h3>
                {!editing && (
                  <button type="button" onClick={handleEdit} className="btn-icon">
                    <FaUserEdit />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editing ? (
                  <>
                    <div>
                      <label className="label-form">Nome</label>
                      <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field" required />
                    </div>
                    <div>
                      <label className="label-form">Email</label>
                      <input type="email" value={formData.email} disabled className="input-field disabled" />
                    </div>
                    <div>
                      <label className="label-form">Localização</label>
                      <select name="localizacao" value={formData.localizacao} onChange={handleChange} className="input-field" required>
                        <option value="">Selecione um estado</option>
                        {estados.map(estado => (
                          <option key={estado.id} value={estado.sigla}>{estado.nome} ({estado.sigla})</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoField label="Nome" value={formData.nome} />
                    <InfoField label="Email" value={formData.email} />
                    <InfoField label="Localização" value={formData.localizacao} />
                  </>
                )}
              </div>
            </div>

            {/* INFORMAÇÕES ESPECÍFICAS */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">Informações Específicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.papel === 'instituicao_ensino' && (
                  editing ? (
                    <>
                      <div>
                        <label className="label-form">Tipo de Instituição</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field" required>
                          <option value="">Selecione o tipo</option>
                          {tiposInstituicaoEnsinoPreSet.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="label-form">Número de Alunos</label>
                        <input type="number" name="qtd_alunos" value={formData.qtd_alunos} onChange={handleChange} className="input-field" placeholder="Ex: 1000" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-form">Áreas de Ensino</label>
                        <div className="p-3 rounded-lg bg-cursor-background-light border border-cursor-border">
                          <CheckboxGroup colorScheme="indigo" value={formData.areas_ensino} onChange={(val) => setFormData(prev => ({ ...prev, areas_ensino: val as string[] }))}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {opcoesEnsino.map((opcao) => (
                                <Checkbox key={opcao} value={opcao} className="text-cursor-text-secondary">{opcao}</Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoField label="Tipo de Instituição" value={formData.tipo} />
                      <InfoField label="Número de Alunos" value={formData.qtd_alunos} />
                      <InfoTags label="Áreas de Ensino" values={formData.areas_ensino} />
                    </>
                  )
                )}

                {user.papel === 'chefe_empresa' && (
                  editing ? (
                    <>
                      <div>
                        <label className="label-form">Nome da Empresa</label>
                        <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} className="input-field" placeholder="Ex: TechCorp" />
                      </div>
                      <div>
                        <label className="label-form">Setor</label>
                        <input type="text" name="setor" value={formData.setor} onChange={handleChange} className="input-field" placeholder="Ex: Tecnologia" />
                      </div>
                      <div>
                        <label className="label-form">Porte da Empresa</label>
                        <input type="text" name="porte" value={formData.porte} onChange={handleChange} className="input-field" placeholder="Ex: Médio" />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoField label="Nome da Empresa" value={formData.empresa} />
                      <InfoField label="Setor" value={formData.setor} />
                      <InfoField label="Porte da Empresa" value={formData.porte} />
                    </>
                  )
                )}
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleCancel} className="btn-secondary" disabled={loading}>
                  <FaTimes className="mr-2" /> Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* ALTERAR SENHA */}
        {!editing && (
          <div className="mt-12">
            <div className="card p-6 border-red-500/20">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <h4 className="font-medium text-cursor-text-primary">Alterar Senha</h4>
                  <p className="text-cursor-text-secondary text-sm mt-1">
                    Após alterar sua senha, você será desconectado de todas as sessões.
                  </p>
                </div>
                <Link to="/alterar-senha" className="btn-danger mt-4 md:mt-0 flex-shrink-0">
                  <FaKey className="mr-2" /> Alterar Senha
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;