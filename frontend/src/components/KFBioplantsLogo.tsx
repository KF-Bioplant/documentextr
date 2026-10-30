import React from 'react';
import kfBioPlantsLogo from '../image/logo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const KFBioplantsLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heightMap = {
    sm: 'h-8',
    md: 'h-10 sm:h-12',
    lg: 'h-16'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={kfBioPlantsLogo}
        alt="KF Bioplants"
        className={`${heightMap[size]} w-auto object-contain`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

