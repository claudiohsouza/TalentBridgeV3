import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Determinar o estilo da navbar baseado na página atual
  const getNavbarStyle = () => {
    if (isHomePage) {
      return `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-cursor-background/80 backdrop-blur-xl border-b border-cursor-border/20' 
          : 'bg-transparent'
      }`;
    } else if (isAuthPage) {
      return 'fixed top-0 left-0 right-0 z-50 bg-transparent';
    } else {
      return 'relative bg-cursor-background/80 backdrop-blur-xl border-b border-cursor-border/20 z-50';
    }
  };

  const getTextColor = () => {
    if (isHomePage && !isScrolled) return 'text-white';
    if (isAuthPage) return 'text-white';
    return 'text-cursor-text-primary';
  };

  const getHoverBg = () => {
    if (isHomePage && !isScrolled) return 'hover:bg-white/10';
    if (isAuthPage) return 'hover:bg-white/10';
    return 'hover:bg-cursor-background-light';
  };

  const navClass = getNavbarStyle();
  const textColor = getTextColor();
  const hoverBg = getHoverBg();

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
      location.pathname === path 
        ? 'text-cursor-primary font-medium bg-cursor-background-light/20' 
        : `${textColor} ${hoverBg}`
    }`;

  const navLinkClass = `flex items-center gap-2 transition-colors duration-200 ${textColor} ${hoverBg}`;
  
  const btnPrimaryClass = "btn-primary";
  const btnSecondaryClass = "btn-secondary";

  const getDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.papel) {
      case 'instituicao_ensino':
        return '/instituicao-ensino';
      case 'chefe_empresa':
        return '/chefe-empresa';
      case 'instituicao_contratante':
        return '/instituicao-contratante';
      default:
        return '/';
    }
  };

  return (
    <nav className={`${navClass} py-4 px-4 md:px-6 lg:px-8`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className={`font-bold text-2xl transition-colors ${textColor}`}>
            <span className="bg-gradient-to-r from-cursor-primary via-purple-500 to-cursor-secondary bg-clip-text text-transparent">
              TalentBridge
            </span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className={navLinkClass}>
                <FaTachometerAlt className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
                
              <Link to="/perfil" className={navLinkClass}>
                <FaUser className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
                
              <button onClick={handleLogout} className={`${navLinkClass} text-cursor-error`}>
                <FaSignOutAlt className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClass}>
                <FaSignInAlt className="h-5 w-5" />
                <span>Login</span>
              </Link>
                
              <Link to="/cadastro" className={btnPrimaryClass}>
                <FaUserPlus className="h-5 w-5 mr-2" />
                <span>Criar Conta</span>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleMenu}
            className={`inline-flex items-center justify-center p-2 rounded-lg focus:outline-none transition-colors duration-200 ${textColor} ${hoverBg}`}
          >
            <FaBars className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu (Drawer) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={closeMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-cursor-background/95 backdrop-blur-xl shadow-2xl border-l border-cursor-border/20 p-6 z-50" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link to={getDashboardPath()} className={linkClass(getDashboardPath())} onClick={closeMenu}>
                      <FaTachometerAlt /> Dashboard
                    </Link>
                    <Link to="/perfil" className={linkClass('/perfil')} onClick={closeMenu}>
                      <FaUser /> Perfil
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className={linkClass('/login')} onClick={closeMenu}>
                      <FaSignInAlt /> Login
                    </Link>
                    <Link to="/cadastro" className={linkClass('/cadastro')} onClick={closeMenu}>
                      <FaUserPlus /> Cadastro
                    </Link>
                  </div>
                )}
                
                <hr className="my-4 border-cursor-border/20" />
                
                <Link to="/" className={linkClass('/')} onClick={closeMenu}>
                  <FaHome /> Página Inicial
                </Link>
              </div>

              {isAuthenticated && (
                <div className="mt-auto">
                  <button onClick={handleLogout} className="btn-secondary w-full flex items-center gap-2 justify-center">
                    <FaSignOutAlt />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;