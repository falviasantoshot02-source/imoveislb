import React from 'react';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'hero';
  className?: string;
  logoSrc?: string; // Optional real logo file path when provided later
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  logoSrc,
}) => {
  // Official company logo for website header using existing public/57074-removebg-preview.png asset
  if (variant === 'header' || (logoSrc && variant !== 'footer')) {
    return (
      <div className={`flex items-center ${className}`} id="header-brand-logo-container">
        <img
          src="/57074-removebg-preview.png"
          alt="Logo LB Negócios Imobiliários"
          className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain"
          id="header-company-logo-img"
        />
      </div>
    );
  }

  const isFooter = variant === 'footer';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Monogram Badge */}
      <div className={`relative flex items-center justify-center rounded-sm transition-transform duration-200 ${
        isFooter 
          ? 'w-11 h-11 bg-slate-900 border border-amber-500/40 shadow-inner' 
          : 'w-10 h-10 md:w-11 md:h-11 bg-[#0d213f] border border-[#c59b27]/40 shadow-sm'
      }`}>
        <div className="absolute inset-0.5 border border-[#c59b27]/30 rounded-xs pointer-events-none" />
        <span className="font-serif text-lg md:text-xl font-bold tracking-wider text-[#dfb743]">
          LB
        </span>
      </div>

      {/* Brand Text Block */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif tracking-widest text-sm md:text-base font-bold uppercase leading-tight ${
            isFooter ? 'text-white' : 'text-[#0d213f]'
          }`}>
            LB Negócios
          </span>
          <span className="text-[10px] md:text-xs font-semibold px-1.5 py-0.2 rounded-xs border border-[#c59b27]/50 text-[#a9801a] bg-amber-50/80">
            IMOBILIÁRIOS
          </span>
        </div>
        <span className={`text-[10px] tracking-wider uppercase font-medium mt-0.5 ${
          isFooter ? 'text-slate-400' : 'text-slate-500'
        }`}>
          CRECI J 29910 J • Horizonte - CE
        </span>
      </div>
    </div>
  );
};
