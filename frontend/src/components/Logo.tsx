import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16', 
  lg: 'w-20 h-20',
  xl: 'w-24 h-24'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
};

export default function Logo({ 
  size = 'md', 
  className = '', 
  showText = false,
  textClassName = ''
}: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <img
          src="/logo.png"
          alt="Union Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            (
              e.currentTarget.nextElementSibling as HTMLElement
            ).style.display = "flex";
          }}
        />
        {/* SVG Fallback */}
        <div
          className={`w-full h-full bg-cyan-500/20 rounded-full items-center justify-center text-white font-bold ${textSizeClasses[size]} flex`}
          style={{ display: "none" }}
        >
          UU
        </div>
      </div>
      {showText && (
        <div className={`mt-2 text-center ${textClassName}`}>
          <div className="font-bold text-white">Universal Union</div>
          <div className="text-white/70 text-xs">KYC System</div>
        </div>
      )}
    </div>
  );
}
