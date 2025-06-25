import React from 'react';

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  icon
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-cursor-primary text-white hover:bg-cursor-primary-dark focus:ring-cursor-primary',
    secondary: 'bg-cursor-background-light text-cursor-text-primary hover:bg-cursor-background-lighter focus:ring-cursor-primary border border-cursor-border',
    danger: 'bg-cursor-error text-white hover:bg-cursor-error/90 focus:ring-cursor-error'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const loadingClasses = loading ? 'btn-loading' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loadingClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {!loading && icon && (
        <span className="mr-2">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default LoadingButton; 