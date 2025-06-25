import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest, UserRole } from '../types';

// Componente para um item de feature
const FeatureItem: React.FC<{ icon: JSX.Element, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-4 rounded-lg transition-colors duration-300 hover:bg-white/5">
    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-cursor-primary/10 flex items-center justify-center border border-cursor-primary/20">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-cursor-text-primary">{title}</h3>
      <p className="text-sm text-cursor-text-secondary">{description}</p>
    </div>
  </div>
);

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar mensagem de erro ao editar
    setErro(null);
    
    // Validar email quando o campo de email for alterado
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('Por favor, insira um email válido (exemplo@dominio.com)');
      } else {
        setEmailError(null);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar email antes de tentar login
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Por favor, insira um email válido (exemplo@dominio.com)');
      return;
    }
    
    setErro(null);
    setLoading(true);
    
    try {
      console.log("Tentando login com:", formData.email);
      
      await login(formData);
      
      // Obter papel do localStorage (definido pela função login do AuthContext)
      const papelUsuario = localStorage.getItem('papel') as UserRole;
      console.log("Login bem-sucedido, papel:", papelUsuario);
      
      // Redirecionar com base no papel
      if (papelUsuario === 'instituicao_ensino') {
        navigate('/instituicao-ensino');
      } else if (papelUsuario === 'chefe_empresa') {
        navigate('/chefe-empresa');
      } else if (papelUsuario === 'instituicao_contratante') {
        navigate('/instituicao-contratante');
      } else {
        // Caso padrão, redireciona para a home
        navigate('/');
      }
      
      // Mostrar mensagem de sucesso
      setErro('');
    } catch (error: any) {
      console.error('Erro detalhado no login:', error);
      
      // Mostrando detalhes do erro para debug
      console.log("Status:", error.response?.status);
      console.log("Dados:", error.response?.data);
      
      let mensagemErro = 'Erro ao fazer login. Tente novamente.';
      
      if (error.response) {
        // Erros com resposta do servidor
        if (error.response.status === 401) {
          mensagemErro = 'Email ou senha incorretos';
        } else if (error.response.data?.erro) {
          mensagemErro = error.response.data.erro;
        } else if (error.response.data?.message) {
          mensagemErro = error.response.data.message;
        }
      } else if (error.request) {
        // Erros sem resposta (problemas de rede)
        mensagemErro = 'Erro de conexão com o servidor. Verifique sua internet.';
      }
      
      setErro(mensagemErro);
    } finally {
      setLoading(false);
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
        <div className="bg-cursor-background/60 border border-cursor-border rounded-xl shadow-2xl backdrop-blur-xl grid lg:grid-cols-2 overflow-hidden">
          
          {/* Coluna Esquerda: Formulário de Login */}
          <div className="p-8 md:p-12 border-r border-cursor-border/50">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <Link to="/" className="inline-block">
                  <h1 className="text-4xl font-extrabold">
                    <span className="bg-gradient-to-r from-cursor-primary via-purple-500 to-cursor-secondary bg-clip-text text-transparent">
                      TalentBridge
                    </span>
                  </h1>
                </Link>
                <p className="text-cursor-text-secondary mt-2">Bem-vindo(a) de volta!</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-cursor-text-secondary text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cursor-text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      className={`input-field pl-10 ${emailError ? 'border-cursor-error' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-cursor-error text-sm mt-1">{emailError}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-cursor-text-secondary text-sm font-medium mb-2">Senha</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cursor-text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      name="senha"
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                {erro && (
                  <div className="p-3 bg-cursor-error/10 border border-cursor-error/30 rounded-lg text-center">
                    <p className="text-cursor-error text-sm">{erro}</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-cursor-text-secondary">
                  Não tem uma conta?{' '}
                  <Link to="/cadastro" className="font-semibold text-cursor-primary hover:text-cursor-primary-dark transition-colors">
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          {/* Coluna Direita: Features */}
          <div className="hidden lg:flex flex-col justify-center p-8 md:p-12 bg-white/5">
            <h2 className="text-2xl font-bold mb-2">Conecte-se a um Ecossistema de Oportunidades</h2>
            <p className="text-cursor-text-secondary mb-8">
              Nossa plataforma une instituições, empresas e jovens talentos, criando um futuro promissor para todos.
            </p>
            
            <div className="space-y-4">
              <FeatureItem 
                icon={<svg className="w-6 h-6 text-cursor-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
                title="Para Instituições de Ensino"
                description="Cadastre e gerencie seus alunos, acompanhe seu desenvolvimento e recomende-os para as melhores vagas."
              />
              <FeatureItem 
                icon={<svg className="w-6 h-6 text-cursor-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                title="Para Empresas"
                description="Publique suas oportunidades e encontre jovens talentos recomendados e qualificados para sua equipe."
              />
              <FeatureItem 
                icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                title="Para Contratantes"
                description="Acesse um banco de talentos diversificado e encontre o perfil ideal para seus programas e iniciativas."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}