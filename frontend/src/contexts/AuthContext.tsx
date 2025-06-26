import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LoginRequest, ApiResponse } from '../types';
import { authService } from '../services/api';
import { usuarioService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Tentar recuperar dados do usuário do localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('[AuthContext] Usuário recuperado do localStorage:', parsedUser.email);
        return parsedUser;
      } catch (e) {
        console.error('Erro ao parsear usuário salvo:', e);
        // Limpar dados corrompidos
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false); // Mudança: começa como false
  const [error, setError] = useState<string | null>(null);

  // Função para verificar e atualizar o token (chamada apenas quando necessário)
  const verifyToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('[AuthContext] Não há token, fazendo logout');
      setUser(null);
      return false;
    }

    setLoading(true);
    try {
      const response = await usuarioService.getPerfil();
      console.log('[AuthContext] Token válido, atualizando dados do usuário');
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
      return true;
    } catch (error: any) {
      console.error('[AuthContext] Erro ao verificar token:', error);
      
      // Só remove o token se for erro 401 (não autorizado)
      if (error.response?.status === 401) {
        console.log('[AuthContext] Token inválido (401), fazendo logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return false;
      } else {
        // Para outros erros (rede, servidor, etc.), mantém o usuário logado
        console.warn('[AuthContext] Erro de rede/servidor, mantendo usuário logado');
        return true; // Considera como sucesso para manter o usuário logado
      }
    } finally {
      setLoading(false);
    }
  };

  // NÃO verificar token automaticamente no mount
  useEffect(() => {
    console.log('[AuthContext] Componente montado. Usuário atual:', user?.email || 'não logado');
    // Não fazer verificação automática para evitar problemas de refresh
  }, []);

  // Limpar mensagens de erro
  const clearError = () => {
    setError(null);
  };

  // Função de login
  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      const { token, usuario } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      setUser(usuario);
      console.log('[AuthContext] Login realizado com sucesso:', usuario.email);
    } catch (error: any) {
      console.error('[Auth] Erro no login:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao fazer login";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização do usuário
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const response = await usuarioService.atualizarPerfil(userData);
      
      if (response.usuario) {
        setUser(response.usuario);
        localStorage.setItem('user', JSON.stringify(response.usuario));
      }
      
      console.log("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error('[Auth] Erro na atualização do usuário:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao atualizar usuário";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log("Logout realizado com sucesso!");
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    verifyToken,
    updateUser,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 