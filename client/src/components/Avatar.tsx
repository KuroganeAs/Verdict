import React from 'react';

interface AvatarProps {
  emoji: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDisconnected?: boolean;
  isHost?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  emoji,
  color,
  size = 'md',
  isDisconnected = false,
  isHost = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10 text-xl border-2',
    md: 'h-16 w-16 text-3xl border-2',
    lg: 'h-24 w-24 text-5xl border-[3px]',
    xl: 'h-32 w-32 text-6xl border-4'
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`rounded-full flex items-center justify-center select-none shadow-md ${sizeClasses[size]} ${isDisconnected ? 'grayscale opacity-40 border-gray-600 bg-[#1a1a24]' : 'bg-[#121217]'}`}
        style={{
          borderColor: isDisconnected ? '#4b5563' : color,
          boxShadow: isDisconnected ? 'none' : `0 0 15px ${color}30`
        }}
      >
        <span className={isDisconnected ? 'opacity-30' : ''}>{emoji}</span>
      </div>
      
      {isHost && (
        <span className={`absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full flex items-center justify-center shadow-md select-none font-bold border border-[#030303]
          ${size === 'sm' ? 'h-4 w-4 text-[9px]' : size === 'md' ? 'h-6 w-6 text-xs' : size === 'lg' ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base'}`}
          title="Room Host"
        >
          👑
        </span>
      )}

      {isDisconnected && (
        <span className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-[8px] px-1 border border-[#030303]">
          OFF
        </span>
      )}
    </div>
  );
};

export const AVATAR_EMOJIS = ['🐱', '🐶', '🦊', '🦁', '🐸', '🐵', '🦄', '🐼', '🐨', '🐙', '🦖', '🐥', '🦥', '🦉', '🦈', '🦙'];
export const AVATAR_COLORS = [
  '#9f7aea', // Purple
  '#ed64a6', // Pink
  '#319795', // Cyan
  '#4299e1', // Blue
  '#48bb78', // Green
  '#ecc94b', // Yellow
  '#ed8936', // Orange
  '#f56565', // Red
];
