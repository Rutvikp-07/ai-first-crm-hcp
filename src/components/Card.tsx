import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  premium?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  premium = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-xl transition-all duration-200 ${
        premium ? 'shadow-premium' : 'shadow-soft'
      } ${hoverable ? 'hover:shadow-md hover:border-slate-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
