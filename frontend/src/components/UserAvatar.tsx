import React from 'react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  badge?: React.ReactNode;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-xs rounded-lg',
  sm: 'w-8 h-8 text-xs rounded-xl',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-12 h-12 text-base rounded-2xl',
  xl: 'w-16 h-16 text-xl rounded-2xl',
  '2xl': 'w-24 h-24 text-3xl rounded-3xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  email,
  size = 'md',
  className = '',
  badge
}) => {
  const [imageError, setImageError] = React.useState(false);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  const getInitial = () => {
    if (name && name.trim()) {
      return name.trim()[0].toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim()[0].toUpperCase();
    }
    return 'U';
  };

  const isEmoji = (str?: string | null) => {
    if (!str) return false;
    const trimmed = str.trim();
    return trimmed.length <= 4 && !trimmed.startsWith('http') && !trimmed.startsWith('data:');
  };

  const renderContent = () => {
    if (avatarUrl && !imageError) {
      if (isEmoji(avatarUrl)) {
        return (
          <span className="flex items-center justify-center select-none">
            {avatarUrl}
          </span>
        );
      }
      return (
        <img
          src={avatarUrl}
          alt={name || email || 'Avatar'}
          className="w-full h-full object-cover rounded-[inherit]"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <span className="font-bold text-white tracking-wider select-none">
        {getInitial()}
      </span>
    );
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      <div 
        className={`${sizeClasses} bg-gradient-to-tr from-primary via-indigo-600 to-purple-600 p-[1.5px] shadow-sm flex-shrink-0 ${className}`}
      >
        <div className="w-full h-full bg-black/70 rounded-[inherit] flex items-center justify-center overflow-hidden border border-white/10">
          {renderContent()}
        </div>
      </div>
      {badge && (
        <div className="absolute -bottom-1 -right-1 z-10">
          {badge}
        </div>
      )}
    </div>
  );
};
