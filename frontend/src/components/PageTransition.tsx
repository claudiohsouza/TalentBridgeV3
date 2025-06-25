import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que a animação seja visível
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`page-transition ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition; 