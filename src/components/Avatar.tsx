import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    // Check if first part is a title (like Dr. or Mr.)
    let first = parts[0];
    let second = parts[1];
    if ((first.toLowerCase().startsWith('dr') || first.toLowerCase().startsWith('mr') || first.toLowerCase().startsWith('ms')) && parts.length > 2) {
      first = parts[1];
      second = parts[2];
    }
    return (first[0] + (second ? second[0] : '')).toUpperCase();
  };

  const getGradient = (fullName: string) => {
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-blue-400 to-indigo-500 text-white',
      'from-emerald-400 to-teal-500 text-white',
      'from-violet-400 to-purple-500 text-white',
      'from-amber-400 to-orange-500 text-white',
      'from-rose-400 to-pink-500 text-white',
      'from-sky-400 to-blue-500 text-white',
    ];
    return gradients[hash % gradients.length];
  };

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-medium',
    lg: 'h-12 w-12 text-base font-semibold',
    xl: 'h-16 w-16 text-xl font-bold',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden select-none shrink-0 bg-gradient-to-br ${getGradient(
        name
      )} ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
