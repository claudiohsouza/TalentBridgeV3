import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

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
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    localizacao: user?.perfil?.localizacao || '',
    // Campos específicos por papel de usuário
    tipo: user?.perfil?.tipo || '',
    areas_ensino: user?.perfil?.areas_ensino || [],
    qtd_alunos: user?.perfil?.qtd_alunos || '',
    empresa: user?.perfil?.empresa || '',
    setor: user?.perfil?.setor || '',
    porte: user?.perfil?.porte || '',
    areas_atuacao: user?.perfil?.areas_atuacao || [],
    areas_interesse: user?.perfil?.areas_interesse || [],
    programas_sociais: user?.perfil?.programas_sociais || []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        localizacao: user.perfil?.localizacao || '',
        // Campos específicos por papel de usuário
        tipo: user.perfil?.tipo || '',
        areas_ensino: user.perfil?.areas_ensino || [],
        qtd_alunos: user.perfil?.qtd_alunos || '',
        empresa: user.perfil?.empresa || '',
        setor: user.perfil?.setor || '',
        porte: user.perfil?.porte || '',
        areas_atuacao: user.perfil?.areas_atuacao || [],
        areas_interesse: user.perfil?.areas_interesse || [],
        programas_sociais: user.perfil?.programas_sociais || []
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Converter string em array (cada linha é um item)
    const arrayValue = value.split('\n').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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

  if (!user) {
    return <div className="text-center py-12">Usuário não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-cursor-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title">Meu Perfil</h1>
            <p className="section-subtitle">
              Visualize e edite suas informações
            </p>
          </div>
          <div className="flex space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary"
              >
                Editar Perfil
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            <Link
              to="/alterar-senha"
              className="btn-primary"
            >
              Alterar Senha
            </Link>
          </div>
        </div>

        <div className="card p-6">
          {feedback && (
            <div className={`p-4 mb-4 rounded-lg ${feedback.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {feedback.mensagem}
            </div>
          )}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações básicas */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-field bg-cursor-background-card opacity-75"
                    />
                    <p className="text-xs text-cursor-text-tertiary mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                      Localização
                    </label>
                    <select
                      name="localizacao"
                      value={formData.localizacao}
                      onChange={handleSelectChange}
                      className="input-field select-field"
                      required
                    >
                      <option value="">Selecione um estado</option>
                      {estados.map(estado => (
                        <option key={estado.id} value={estado.sigla}>
                          {estado.nome} ({estado.sigla})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Campos específicos baseados no papel */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Específicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.papel === 'instituicao_ensino' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Tipo de Instituição
                        </label>
                        <select
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleSelectChange}
                          className="input-field select-field"
                          required
                        >
                          <option value="">Selecione o tipo</option>
                          {tiposInstituicaoEnsinoPreSet.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Número de Alunos
                        </label>
                        <input
                          type="number"
                          name="qtd_alunos"
                          value={formData.qtd_alunos}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: 1000"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Áreas de Ensino
                        </label>
                        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                          <CheckboxGroup
                            colorScheme="blue"
                            value={formData.areas_ensino}
                            onChange={(val) => setFormData(prev => ({ ...prev, areas_ensino: val as string[] }))}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {opcoesEnsino.map((opcao) => (
                                <Checkbox
                                  key={opcao}
                                  value={opcao}
                                  className="text-white"
                                >
                                  {opcao}
                                </Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {user.papel === 'chefe_empresa' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: TechCorp"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Setor
                        </label>
                        <input
                          type="text"
                          name="setor"
                          value={formData.setor}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: Tecnologia"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Porte da Empresa
                        </label>
                        <input
                          type="text"
                          name="porte"
                          value={formData.porte}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: Médio"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-cursor-border">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Visualização das informações básicas */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-cursor-text-secondary">Nome</p>
                    <p className="mt-1 text-cursor-text-primary">{formData.nome}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-cursor-text-secondary">Email</p>
                    <p className="mt-1 text-cursor-text-primary">{formData.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-cursor-text-secondary">Localização</p>
                    <p className="mt-1 text-cursor-text-primary">{formData.localizacao || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              {/* Visualização das informações específicas */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Específicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.papel === 'instituicao_ensino' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Tipo de Instituição</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.tipo || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Número de Alunos</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.qtd_alunos || 'Não informado'}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-cursor-text-secondary">Áreas de Ensino</p>
                        {formData.areas_ensino && formData.areas_ensino.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.areas_ensino.map((area: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cursor-background-light text-cursor-text-primary border border-cursor-border"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-cursor-text-tertiary">Nenhuma área informada</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {user.papel === 'chefe_empresa' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Nome da Empresa</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.empresa || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Setor</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.setor || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Porte da Empresa</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.porte || 'Não informado'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;