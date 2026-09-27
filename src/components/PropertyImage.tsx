import React from 'react';
import { Home, Building2, Trees, Store } from 'lucide-react';
import { PropertyType } from '../types';

interface PropertyImageProps {
  src?: string;
  alt: string;
  propertyCode: string;
  propertyType?: PropertyType;
  caption?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'card';
  showPlaceholderNotice?: boolean;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({
  src,
  alt,
  propertyCode,
  propertyType = 'casa',
  caption,
  className = '',
  aspectRatio = 'card',
  showPlaceholderNotice = true
}) => {
  const ratioClasses = {
    card: 'aspect-[4/3]',
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]'
  }[aspectRatio];

  // If a real photograph URL is available, render it cleanly
  if (src && src.trim().length > 0) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${ratioClasses} ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
            {caption}
          </div>
        )}
      </div>
    );
  }

  // Elegant architectural placeholder
  const getTypeIcon = () => {
    switch (propertyType) {
      case 'apartamento':
        return <Building2 className="w-8 h-8 text-[#c59b27]/80" />;
      case 'terreno':
        return <Trees className="w-8 h-8 text-[#c59b27]/80" />;
      case 'comercial':
        return <Store className="w-8 h-8 text-[#c59b27]/80" />;
      case 'casa':
      default:
        return <Home className="w-8 h-8 text-[#c59b27]/80" />;
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-[#0d213f] text-slate-300 overflow-hidden border border-slate-800 ${ratioClasses} ${className}`}
      role="img"
      aria-label={`Espaço reservado para foto oficial do imóvel ${propertyCode}`}
    >
      {/* Subtle blueprint grid pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#dfb743 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }}
      />

      {/* Decorative frame corners */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#c59b27]/50" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#c59b27]/50" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#c59b27]/50" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#c59b27]/50" />

      {/* Center Icon and Info */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xs">
        <div className="w-12 h-12 rounded-full bg-[#14325e]/80 border border-[#c59b27]/40 flex items-center justify-center mb-2.5 shadow-sm">
          {getTypeIcon()}
        </div>

        <span className="font-mono text-[11px] font-semibold tracking-wider text-[#dfb743] bg-black/40 px-2 py-0.5 rounded border border-[#c59b27]/30 mb-1.5">
          REF: {propertyCode}
        </span>

        {showPlaceholderNotice && (
          <p className="text-[11px] text-slate-300 font-medium leading-tight">
            Espaço para fotografia oficial
          </p>
        )}

        {caption && (
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
            {caption}
          </p>
        )}
      </div>

      {/* Bottom status badge */}
      <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs text-[9px] uppercase tracking-wider text-amber-300/80 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
        LB Imóveis • Horizonte/CE
      </div>
    </div>
  );
};
