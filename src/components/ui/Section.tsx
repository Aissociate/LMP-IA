import React from 'react';

export interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Section: React.FC<SectionProps> = ({
  children,
  id,
  className = '',
  maxWidth = 'xl',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-6',
    md: 'px-4 sm:px-6 lg:px-8 py-12',
    lg: 'px-6 sm:px-8 lg:px-12 py-16'
  };

  return (
    <section id={id} className={`w-full ${className}`}>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>
        {children}
      </div>
    </section>
  );
};
