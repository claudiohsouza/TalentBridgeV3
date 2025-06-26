import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';
import { Link } from 'react-router-dom';

// Páginas
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import DashboardInstituicaoEnsino from './pages/DashboardInstituicaoEnsino';
import DashboardChefeEmpresa from './pages/DashboardChefeEmpresa';
import DashboardInstituicaoContratante from './pages/DashboardInstituicaoContratante';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import AlterarSenha from './pages/AlterarSenha';
import JovensList from './pages/JovensList';
import JovemDetails from './pages/JovemDetails';
import OportunidadesList from './pages/OportunidadesList';
import OportunidadeDetails from './pages/OportunidadeDetails';
import NovoJovem from './pages/NovoJovem';
import RecomendarJovem from './pages/RecomendarJovem';

// Componente para rotas protegidas
type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRole?: UserRole;
};

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Só mostra loading se realmente estiver carregando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cursor-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cursor-primary mx-auto mb-4"></div>
          <p className="text-cursor-text-secondary">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário E não há token no localStorage, redireciona para login
  const token = localStorage.getItem('token');
  if (!user && !token) {
    console.log('[ProtectedRoute] Usuário não autenticado e sem token, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Se não há usuário MAS há token, tenta usar dados do localStorage temporariamente
  if (!user && token) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verifica se o papel é adequado
        if (allowedRole && parsedUser.papel !== allowedRole) {
          console.log('[ProtectedRoute] Usuário sem permissão:', parsedUser.papel, 'vs', allowedRole);
          return <Navigate to="/" replace />;
        }
        // Se chegou até aqui, permite o acesso
        console.log('[ProtectedRoute] Usando dados salvos do usuário:', parsedUser.email);
        return children;
      } catch (e) {
        console.error('[ProtectedRoute] Erro ao parsear usuário salvo:', e);
        return <Navigate to="/login" replace />;
      }
    }
    return <Navigate to="/login" replace />;
  }

  // Se há usuário mas não tem permissão para o papel específico
  if (allowedRole && user && user.papel !== allowedRole) {
    console.log('[ProtectedRoute] Usuário sem permissão para acessar esta rota:', user.papel, 'vs', allowedRole);
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas comuns protegidas */}
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/alterar-senha" element={<ProtectedRoute><AlterarSenha /></ProtectedRoute>} />

          {/* Rotas para Instituição de Ensino */}
          <Route 
            path="/instituicao-ensino" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><DashboardInstituicaoEnsino /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/jovens" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><JovensList /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/jovens/novo" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><NovoJovem /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/jovens/:id" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><JovemDetails /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/oportunidades" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><OportunidadesList /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/oportunidades/:id" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><OportunidadeDetails /></ProtectedRoute>} 
          />

          {/* Rotas para Chefe de Empresa */}
          <Route 
            path="/chefe-empresa" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><DashboardChefeEmpresa /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/jovens" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><JovensList /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/jovens/:id" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><JovemDetails /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/oportunidades" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><OportunidadesList /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/oportunidades/:id" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><OportunidadeDetails /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/oportunidades/:id/recomendar" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><RecomendarJovem /></ProtectedRoute>} 
          />

          {/* Rotas para Instituição Contratante */}
          <Route 
            path="/instituicao-contratante" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><DashboardInstituicaoContratante /></ProtectedRoute>} 
          />

          {/* Rota 404 - Apenas para rotas que realmente não existem */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-cursor-background">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-cursor-text-primary mb-4">404</h1>
                <p className="text-cursor-text-secondary mb-6">Página não encontrada</p>
                <Link to="/" className="btn-primary">
                  Voltar para Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;