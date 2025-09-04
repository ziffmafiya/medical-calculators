import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 ${className}`}>
      {title && (
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-2">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}; 