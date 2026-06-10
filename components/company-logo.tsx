'use client';

import { useState } from 'react';

interface CompanyLogoProps {
  logo?: string | null;
  name: string;
  className?: string; // size classes e.g., "w-12 h-12"
  textClassName?: string; // text size classes e.g., "text-lg"
}

export default function CompanyLogo({ 
  logo, 
  name, 
  className = 'w-12 h-12', 
  textClassName = 'text-lg' 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`relative ${className} rounded bg-grayBg border border-grayBorder flex items-center justify-center font-bold text-accent-teal overflow-hidden flex-shrink-0`}>
      <span className={`absolute inset-0 flex items-center justify-center bg-grayBg ${textClassName}`}>
        {initial}
      </span>
      {logo && !imageError && (
        <img 
          src={logo} 
          alt={`${name} logo`}
          className="absolute inset-0 w-full h-full object-cover bg-white z-10"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
