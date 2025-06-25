import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, opcoesService } from '../services/api';
import { UserRole, RegisterRequest } from '../types';
import { useCheckbox, useCheckboxGroup } from '@chakra-ui/react';

// Lista de estados brasileiros
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

// Remover constantes hardcoded
// const AREAS_INTERESSE_OPCOES = [ ... ]
// const PROGRAMAS_SOCIAIS_OPCOES = [ ... ]

interface FormData {
  email: string;
  senha: string;
  confirmarSenha: string;
  nome: string;
  papel: UserRole;
  // Campos para instituição de ensino
  tipo?: string;
  areas_ensino?: string[];
  qtd_alunos?: number;
  // Campos para chefe de empresa
  empresa?: string;
  setor?: string;
  porte?: string;
  areas_atuacao?: string[];
  cargo?: string;
  // Campos comuns e de instituição contratante
  localizacao: string;
  areas_interesse?: string[];
  programas_sociais?: string[];
}

interface FormErrors {
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  nome?: string;
  papel?: string;
  tipo?: string;
  empresa?: string;
  setor?: string;
  porte?: string;
  cargo?: string;
  localizacao?: string;
  areas_ensino?: string;
  qtd_alunos?: string;
  areas_atuacao?: string;
  areas_interesse?: string;
  programas_sociais?: string;
  geral?: string;
}

const opcoesEnsino = [
  "Tecnologia da Informação",
  "Engenharia de Software",
  "Ciência da Computação",
  "Análise de Dados",
  "Engenharia Mecânica",
  "Engenharia Elétrica",
  "Engenharia Civil",
  "Administração",
  "Marketing Digital",
  "Design",
  "Medicina",
  "Enfermagem",
  "Psicologia",
  "Direito",
  "Contabilidade",
  "Recursos Humanos",
  "Comunicação",
  "Gestão de Projetos",
  "Economia",
  "Arquitetura"
];

const opcoesAtuacao = [
  "Tecnologia da Informação",
  "Desenvolvimento de Software",
  "Análise de Dados",
  "Marketing Digital",
  "Recursos Humanos",
  "Administração",
  "Finanças",
  "Contabilidade",
  "Design",
  "Vendas",
  "Atendimento ao Cliente",
  "Engenharia",
  "Produção",
  "Logística",
  "Saúde",
  "Educação",
  "Comunicação",
  "Gestão de Projetos",
  "Consultoria",
  "Pesquisa e Desenvolvimento"
];

const tiposInstituicaoPreSet = [
  "ONG",
  "Fundação",
  "Associação",
  "Instituto",
  "Órgão Público",
  "Outra"
];

const tiposInstituicaoEnsinoPreSet = [
  "Universidade Pública",
  "Universidade Privada",
  "Instituto Técnico",
  "Escola Técnica",
  "Escola de Ensino Médio",
  "Outra"
];

const setoresEmpresaPreSet = [
  "Tecnologia",
  "Manufatura",
  "Serviços",
  "Comércio",
  "Educação",
  "Saúde",
  "Outro"
];

const portesEmpresaPreSet = [
  "Micro",
  "Pequeno",
  "Médio",
  "Grande"
];

const cargosEmpresaPreSet = [
  "CEO",
  "Diretor",
  "Gerente",
  "Supervisor",
  "Coordenador",
  "Líder de Equipe",
  "Head de Departamento",
  "C-Level",
  "Vice-Presidente",
  "Proprietário"
];

const programasSociaisPreSet = [
  "Programa Jovem Aprendiz",
  "Programa de Estágio",
  "Programa de Trainee",
  "Primeiro Emprego",
  "Capacitação Profissional",
  "Mentoria",
  "Inclusão Digital",
  "Inclusão Social",
  "Diversidade e Inclusão",
  "Empreendedorismo Social",
  "Educação Profissional",
  "Desenvolvimento de Lideranças",
  "Formação Técnica",
  "Apoio Educacional",
  "Orientação Profissional"
];

const areasInteressePreSet = [
  "Tecnologia da Informação",
  "Desenvolvimento de Software",
  "Engenharia",
  "Saúde",
  "Educação",
  "Administração e Negócios",
  "Marketing e Comunicação",
  "Design e Criatividade",
  "Finanças e Contabilidade",
  "Recursos Humanos",
  "Produção e Logística",
  "Pesquisa e Desenvolvimento",
  "Sustentabilidade",
  "Inovação Social",
  "Empreendedorismo"
];

const faixasAlunos = [
  { label: 'Até 100', value: '100' },
  { label: '101 a 500', value: '500' },
  { label: '501 a 1.000', value: '1000' },
  { label: '1.001 a 5.000', value: '5000' },
  { label: '5.001 a 10.000', value: '10000' },
  { label: 'Mais de 10.000', value: '10001' }
];

const areasInteresseCategorizadas = {
  'Tecnologia e Educação': [
    'Tecnologia e Inovação',
    'Educação e Capacitação',
    'Inclusão Digital',
    'Pesquisa e Desenvolvimento'
  ],
  'Desenvolvimento e Impacto Social': [
    'Desenvolvimento Social',
    'Cidadania e Direitos Humanos',
    'Responsabilidade Social',
    'Diversidade e Inclusão',
    'Inovação Social'
  ],
  'Carreira e Profissional': [
    'Empreendedorismo',
    'Liderança e Gestão',
    'Empregabilidade',
    'Desenvolvimento Profissional'
  ],
  'Cultura e Bem-estar': [
    'Cultura e Arte',
    'Esporte e Lazer',
    'Saúde e Bem-estar',
    'Economia Criativa'
  ],
  'Sustentabilidade': [
    'Sustentabilidade',
    'Meio Ambiente',
    'Voluntariado'
  ]
};

const programasSociaisCategorizados = {
  'Programas de Entrada': [
    'Programa Jovem Aprendiz',
    'Programa de Estágio',
    'Primeiro Emprego',
    'Programa de Trainee'
  ],
  'Desenvolvimento Profissional': [
    'Mentoria Profissional',
    'Capacitação Técnica',
    'Formação Profissional',
    'Desenvolvimento de Soft Skills'
  ],
  'Educação e Orientação': [
    'Educação Financeira',
    'Orientação Vocacional',
    'Apoio Educacional',
    'Programa de Bolsas'
  ],
  'Empreendedorismo e Liderança': [
    'Empreendedorismo Jovem',
    'Desenvolvimento de Lideranças',
    'Incubadora de Projetos',
    'Aceleração de Carreiras'
  ],
  'Inclusão e Diversidade': [
    'Inclusão Digital',
    'Inclusão Social',
    'Programa de Voluntariado',
    'Programa de Diversidade'
  ]
};

// Custom Checkbox for Tag-like appearance
const CustomCheckbox = (props: any) => {
  const { state, getCheckboxProps, getInputProps, getLabelProps, htmlProps } =
    useCheckbox(props);

  return (
    <label
      {...htmlProps}
      className={`
        flex items-center justify-center
        px-3 py-2 rounded-lg cursor-pointer
        border-2 
        transition-all duration-200
        text-sm font-medium
        ${state.isChecked 
          ? 'bg-cursor-primary/20 border-cursor-primary text-cursor-text-primary' 
          : 'bg-cursor-background-light border-cursor-border hover:border-cursor-primary/50 text-cursor-text-secondary'}
      `}
    >
      <input {...getInputProps()} hidden />
      <span {...getLabelProps()}>{props.children}</span>
    </label>
  );
};

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    senha: '',
    confirmarSenha: '',
    nome: '',
    papel: 'instituicao_ensino',
    localizacao: '',
    tipo: '',
    areas_ensino: [],
    qtd_alunos: undefined,
    empresa: '',
    setor: '',
    porte: '',
    cargo: '',
    areas_atuacao: [],
    areas_interesse: [],
    programas_sociais: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  // Estados para opções carregadas do backend
  const [tiposInstituicao, setTiposInstituicao] = useState<string[]>(tiposInstituicaoPreSet);
  const [tiposInstituicaoEnsino, setTiposInstituicaoEnsino] = useState<string[]>(tiposInstituicaoEnsinoPreSet);
  const [setoresEmpresa, setSetoresEmpresa] = useState<string[]>(setoresEmpresaPreSet);
  const [portesEmpresa, setPortesEmpresa] = useState<string[]>(portesEmpresaPreSet);
  const [areasInteresse, setAreasInteresse] = useState<string[]>(areasInteressePreSet);
  const [programasSociais, setProgramasSociais] = useState<string[]>(programasSociaisPreSet);
  const [areasEnsino, setAreasEnsino] = useState<string[]>(opcoesEnsino);
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>(opcoesAtuacao);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  // Dentro do componente, atualize o estado para incluir as categorias expandidas
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  // Dentro do componente, adicione o estado para cargos
  const [cargosEmpresa, setCargosEmpresa] = useState<string[]>(cargosEmpresaPreSet);

  // Função para alternar a expansão de uma categoria
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Não é mais necessário carregar opções do backend pois estamos usando valores pre-set

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Função para controlar a seleção de checkboxes
  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof FormData] as string[] || [];
      
      if (checked) {
        // Adicionar à array se não estiver presente
        return {
          ...prev,
          [name]: [...currentArray, value]
        };
      } else {
        // Remover da array se estiver desmarcado
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        };
      }
    });
    
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Função especial para lidar com arrays (habilidades, interesses, etc)
  const handleArrayChange = (name: string, value: string | string[]) => {
    let items: string[] = [];
    if (Array.isArray(value)) {
      // Se for áreas de interesse, limitar a 4 opções
      if (name === 'areas_interesse' && value.length > 4) {
        return; // Não permite mais que 4 seleções
      }
      items = value;
    } else {
      items = value
        .split(/,|\n/)
        .map(item => item.trim())
        .filter(item => item !== '');
    }
    setFormData(prev => ({ ...prev, [name]: items }));
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarFormulario = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validações básicas
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
      isValid = false;
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
      isValid = false;
    }
    
    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }
    
    if (!formData.localizacao) {
      newErrors.localizacao = 'Localização é obrigatória';
      isValid = false;
    }

    // Validações específicas por papel
    if (formData.papel === 'instituicao_ensino') {
      if (!formData.tipo) {
        newErrors.tipo = 'Tipo da instituição é obrigatório';
        isValid = false;
      }
      
      if (!formData.areas_ensino || formData.areas_ensino.length === 0) {
        newErrors.areas_ensino = 'Indique pelo menos uma área de ensino';
        isValid = false;
      }
      
      if (!formData.qtd_alunos) {
        newErrors.qtd_alunos = 'Quantidade de alunos é obrigatória';
        isValid = false;
      }
    }
    
    if (formData.papel === 'chefe_empresa') {
      if (!formData.empresa) {
        newErrors.empresa = 'Nome da empresa é obrigatório';
        isValid = false;
      }
      
      if (!formData.setor) {
        newErrors.setor = 'Setor da empresa é obrigatório';
        isValid = false;
      }
      
      if (!formData.porte) {
        newErrors.porte = 'Porte da empresa é obrigatório';
        isValid = false;
      }
      
      if (!formData.cargo) {
        newErrors.cargo = 'Cargo é obrigatório';
        isValid = false;
      }
      
      if (!formData.areas_atuacao || formData.areas_atuacao.length === 0) {
        newErrors.areas_atuacao = 'Indique pelo menos uma área de atuação';
        isValid = false;
      }
    }
    
    if (formData.papel === 'instituicao_contratante') {
      if (!formData.tipo) {
        newErrors.tipo = 'Tipo da instituição é obrigatório';
        isValid = false;
      }
      
      if (!formData.areas_interesse || formData.areas_interesse.length === 0) {
        newErrors.areas_interesse = 'Indique pelo menos uma área de interesse';
        isValid = false;
      }
      
      if (!formData.programas_sociais || formData.programas_sociais.length === 0) {
        newErrors.programas_sociais = 'Indique pelo menos um programa social';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      console.log('[Cadastro] Validação do formulário falhou:', errors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Construir payload base
      const payload: RegisterRequest = {
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        papel: formData.papel as UserRole,
        localizacao: formData.localizacao,
        dadosPerfil: {} // Adicionar objeto dadosPerfil
      };
      
      // Adicionar campos específicos por papel dentro de dadosPerfil
      if (formData.papel === 'instituicao_ensino') {
        payload.dadosPerfil = {
          tipo: formData.tipo,
          areas_ensino: formData.areas_ensino,
          qtd_alunos: Number(formData.qtd_alunos)
        };
      } else if (formData.papel === 'chefe_empresa') {
        console.log('[Cadastro] Dados do chefe de empresa antes do envio:', {
          cargo: formData.cargo,
          empresa: formData.empresa,
          setor: formData.setor,
          porte: formData.porte,
          localizacao: formData.localizacao,
          areas_atuacao: formData.areas_atuacao
        });

        if (!formData.cargo) {
          setErrors(prev => ({ ...prev, cargo: 'Cargo é obrigatório' }));
          setLoading(false);
          return;
        }

        payload.dadosPerfil = {
          empresa: formData.empresa || '',
          setor: formData.setor || '',
          porte: formData.porte || '',
          areas_atuacao: formData.areas_atuacao || [],
          cargo: formData.cargo
        };
      } else if (formData.papel === 'instituicao_contratante') {
        payload.dadosPerfil = {
          tipo: formData.tipo,
          areas_interesse: formData.areas_interesse,
          programas_sociais: formData.programas_sociais
        };
      }
      
      console.log('[Cadastro] Payload final:', JSON.stringify(payload, null, 2));
      
      const response = await authService.registro(payload);
      console.log('[Cadastro] Resposta do servidor:', response);
      
      setSucesso(true);
      
      // Redirecionamento automático após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('[Cadastro] Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.erro) {
        setErrors({ geral: error.response.data.erro });
      } else if (error.response?.data?.details) {
        // Tratar erros de validação detalhados
        const validationErrors = error.response.data.details.reduce((acc: any, err: any) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        setErrors(validationErrors);
      } else {
        setErrors({ geral: 'Erro ao conectar com o servidor' });
      }
    } finally {
      setLoading(false);
    }
  };

  const { getCheckboxProps } = useCheckboxGroup({
    value: formData.areas_ensino,
    onChange: (val) => handleArrayChange('areas_ensino', val as string[]),
  });
  
  const { getCheckboxProps: getAtuacaoProps } = useCheckboxGroup({
    value: formData.areas_atuacao,
    onChange: (val) => handleArrayChange('areas_atuacao', val as string[]),
  });

  const { getCheckboxProps: getInteresseProps } = useCheckboxGroup({
    value: formData.areas_interesse,
    onChange: (val) => handleArrayChange('areas_interesse', val as string[]),
  });

  const { getCheckboxProps: getProgramasProps } = useCheckboxGroup({
    value: formData.programas_sociais,
    onChange: (val) => handleArrayChange('programas_sociais', val as string[]),
  });

  // Renderização condicional dos campos baseado no papel selecionado
  const renderCamposEspecificos = () => {
    switch (formData.papel) {
      case 'instituicao_ensino':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Tipo de Instituição*</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field select-field w-full" required>
                <option value="">Selecione o tipo</option>
                  {tiposInstituicaoEnsino.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
              </select>
                {errors.tipo && <p className="mt-1 text-sm text-cursor-error">{errors.tipo}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Faixa de Alunos*</label>
                <select name="qtd_alunos" value={formData.qtd_alunos || ''} onChange={handleChange} className="input-field select-field w-full" required>
                <option value="">Selecione a faixa</option>
                   {faixasAlunos.map(faixa => (<option key={faixa.value} value={faixa.value}>{faixa.label}</option>))}
              </select>
                {errors.qtd_alunos && <p className="mt-1 text-sm text-cursor-error">{errors.qtd_alunos}</p>}
            </div>
                    </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Áreas de Ensino*</label>
              <div className="p-4 rounded-lg bg-cursor-background-light border border-cursor-border">
                {loadingOpcoes ? <p className="text-cursor-text-secondary">Carregando...</p> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {areasEnsino.map((opcao) => (
                      <CustomCheckbox key={opcao} {...getCheckboxProps({ value: opcao })}>{opcao}</CustomCheckbox>
                    ))}
                  </div>
                )}
              </div>
              {errors.areas_ensino && <p className="mt-1 text-sm text-cursor-error">{errors.areas_ensino}</p>}
            </div>
          </>
        );
      case 'chefe_empresa':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Nome da Empresa*</label>
                <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} className="input-field w-full" required />
                {errors.empresa && <p className="mt-1 text-sm text-cursor-error">{errors.empresa}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Cargo*</label>
                <select name="cargo" value={formData.cargo} onChange={handleChange} className="input-field select-field w-full" required>
                <option value="">Selecione o cargo</option>
                  {cargosEmpresa.map(cargo => (<option key={cargo} value={cargo}>{cargo}</option>))}
              </select>
                {errors.cargo && <p className="mt-1 text-sm text-cursor-error">{errors.cargo}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Setor*</label>
                <select name="setor" value={formData.setor} onChange={handleChange} className="input-field select-field w-full" required>
                <option value="">Selecione o setor</option>
                  {setoresEmpresa.map(setor => (<option key={setor} value={setor}>{setor}</option>))}
              </select>
                {errors.setor && <p className="mt-1 text-sm text-cursor-error">{errors.setor}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Porte*</label>
                <select name="porte" value={formData.porte} onChange={handleChange} className="input-field select-field w-full" required>
                <option value="">Selecione o porte</option>
                  {portesEmpresa.map(porte => (<option key={porte} value={porte}>{porte}</option>))}
              </select>
                {errors.porte && <p className="mt-1 text-sm text-cursor-error">{errors.porte}</p>}
            </div>
                    </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Áreas de Atuação*</label>
              <div className="p-4 rounded-lg bg-cursor-background-light border border-cursor-border">
                {loadingOpcoes ? <p className="text-cursor-text-secondary">Carregando...</p> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {areasAtuacao.map((opcao) => (
                      <CustomCheckbox key={opcao} {...getAtuacaoProps({ value: opcao })}>{opcao}</CustomCheckbox>
                    ))}
                  </div>
                )}
              </div>
              {errors.areas_atuacao && <p className="mt-1 text-sm text-cursor-error">{errors.areas_atuacao}</p>}
            </div>
          </>
        );
      case 'instituicao_contratante':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Tipo da Instituição*</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field select-field w-full" required>
                <option value="">Selecione um tipo</option>
                  {tiposInstituicao.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
              </select>
                {errors.tipo && <p className="mt-1 text-sm text-cursor-error">{errors.tipo}</p>}
            </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Áreas de Interesse*</label>
              <div className="p-4 rounded-lg bg-cursor-background-light border border-cursor-border">
                {loadingOpcoes ? <p className="text-cursor-text-secondary">Carregando...</p> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {areasInteresse.map((area) => (
                      <CustomCheckbox key={area} {...getInteresseProps({ value: area })}>{area}</CustomCheckbox>
                    ))}
                  </div>
              )}
            </div>
              {errors.areas_interesse && <p className="mt-1 text-sm text-cursor-error">{errors.areas_interesse}</p>}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Programas Sociais*</label>
              <div className="p-4 rounded-lg bg-cursor-background-light border border-cursor-border">
                {loadingOpcoes ? <p className="text-cursor-text-secondary">Carregando...</p> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {programasSociais.map((programa) => (
                      <CustomCheckbox key={programa} {...getProgramasProps({ value: programa })}>{programa}</CustomCheckbox>
                    ))}
                  </div>
                )}
              </div>
              {errors.programas_sociais && <p className="mt-1 text-sm text-cursor-error">{errors.programas_sociais}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cursor-background text-white flex items-center justify-center p-4 lg:p-8 overflow-hidden relative">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -inset-[10%] opacity-40">
          <div className="absolute top-0 left-[10%] w-[60%] h-[60%] bg-cursor-primary rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-[20%] w-[50%] h-[50%] bg-cursor-secondary rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="bg-cursor-background/60 border border-cursor-border rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-5xl mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
                    TalentBridge
                  </span>
                </h1>
                <p className="mt-2 text-cursor-text-secondary">
                  Crie sua conta para começar
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  {/* Card 1: Informações Básicas */}
                  <div className="bg-cursor-background-light/30 p-8 rounded-xl border border-cursor-border space-y-6">
                    <h3 className="text-lg font-semibold text-cursor-text-primary border-b border-cursor-border pb-3">
                      1. Informações Básicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Nome Completo*</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field w-full" required />
                        {errors.nome && <p className="mt-1 text-sm text-cursor-error">{errors.nome}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Email*</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field w-full" required />
                        {errors.email && <p className="mt-1 text-sm text-cursor-error">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Senha*</label>
                        <input type="password" name="senha" value={formData.senha} onChange={handleChange} className="input-field w-full" required minLength={6} />
                        {errors.senha && <p className="mt-1 text-sm text-cursor-error">{errors.senha}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Confirmar Senha*</label>
                        <input type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} className="input-field w-full" required />
                        {errors.confirmarSenha && <p className="mt-1 text-sm text-cursor-error">{errors.confirmarSenha}</p>}
                      </div>
                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Tipo de Usuário*</label>
                         <select name="papel" value={formData.papel} onChange={handleChange} className="input-field select-field w-full" required>
                           <option value="instituicao_ensino">Instituição de Ensino</option>
                           <option value="chefe_empresa">Chefe de Empresa</option>
                           <option value="instituicao_contratante">Instituição Contratante</option>
                         </select>
                         {errors.papel && <p className="mt-1 text-sm text-cursor-error">{errors.papel}</p>}
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">Estado*</label>
                        <select name="localizacao" value={formData.localizacao} onChange={handleChange} className="input-field select-field w-full" required>
                          <option value="">Selecione um estado</option>
                          {estados.map(estado => (
                            <option key={estado.id} value={estado.sigla}>{estado.nome}</option>
                          ))}
                        </select>
                        {errors.localizacao && <p className="mt-1 text-sm text-cursor-error">{errors.localizacao}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Informações Específicas */}
                  <div className="bg-cursor-background-light/30 p-8 rounded-xl border border-cursor-border space-y-6">
                    <h3 className="text-lg font-semibold text-cursor-text-primary border-b border-cursor-border pb-3">
                      2. Detalhes do Perfil
                    </h3>
                    <div className="space-y-6">
                      {formData.papel ? (
                        renderCamposEspecificos()
                      ) : (
                        <div className="text-center text-cursor-text-secondary py-16 flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                          <p>Selecione um "Tipo de Usuário" para ver os campos específicos.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  {errors.geral && (
                    <div className="p-3 mb-6 bg-cursor-error/10 border border-cursor-error/30 rounded-lg">
                      <p className="text-cursor-error text-sm text-center">{errors.geral}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-cursor-border gap-4">
                    <div className="text-sm space-y-2 text-center sm:text-left">
                      <Link to="/login" className="text-cursor-text-secondary hover:text-cursor-primary transition-colors">
                        Já tem conta? Faça login
                      </Link>
                      <Link to="/" className="flex items-center justify-center sm:justify-start gap-1 text-cursor-text-secondary hover:text-cursor-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para o início
                      </Link>
                    </div>
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
                      {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}