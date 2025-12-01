import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#F77F00] to-[#E06F00] hover:from-[#E06F00] hover:to-[#D05F00] text-white shadow-lg hover:shadow-xl focus:ring-[#F77F00] transform hover:scale-105',
    secondary: 'bg-white text-[#F77F00] border-2 border-[#F77F00] hover:bg-[#F77F00] hover:text-white shadow-md hover:shadow-lg focus:ring-[#F77F00]',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-[#F77F00] hover:text-[#F77F00] hover:bg-orange-50 focus:ring-[#F77F00]',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${iconSizeClasses[size]}`} />
          Chargement...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizeClasses[size]} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={iconSizeClasses[size]} />}
        </>
      )}
    </button>
  );
};
