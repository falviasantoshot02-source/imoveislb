import React from 'react';
import { ArrowRight, MessageCircle, Shield, Award, MapPin, CheckCircle2 } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface HeroSectionProps {
  onViewProperties: () => void;
  heroImageSrc?: string; // Optional real image path when uploaded later
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onViewProperties,
  heroImageSrc
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#081528] via-[#0d213f] to-[#102a4c] text-white py-14 sm:py-20 lg:py-24 border-b border-[#c59b27]/30">
      {/* Subtle geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#dfb743 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Top Credibility Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-[#c59b27]/40 text-[#dfb743] text-xs font-semibold tracking-wide mb-6 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-[#dfb743]" />
              <span>{COMPANY_INFO.creci} • {COMPANY_INFO.agentName} ({COMPANY_INFO.agentCreci})</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight md:leading-none mb-6">
              Encontre seu <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
                próximo imóvel
              </span>
            </h1>

            {/* Supporting Text in pt-BR */}
            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mb-8">
              A <strong>LB NEGÓCIOS IMOBILIÁRIOS</strong> auxilia você a encontrar as melhores oportunidades para compra, venda e locação em Horizonte e em toda a região metropolitana, com atendimento seguro, transparente e regulamentado pelo CRECI-CE.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-10">
              <button
                type="button"
                onClick={onViewProperties}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md text-sm md:text-base font-bold text-[#081528] bg-gradient-to-r from-[#dfb743] via-[#c59b27] to-[#a9801a] hover:from-[#e5c05b] hover:to-[#b8860b] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                id="hero-btn-view-properties"
              >
                <span>VER IMÓVEIS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-md text-sm md:text-base font-bold text-white bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-emerald-500/60 transition-all shadow-xs"
                id="hero-btn-whatsapp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>FALAR PELO WHATSAPP</span>
              </a>
            </div>

            {/* Verified Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-6 border-t border-slate-700/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Atendimento Personalizado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Segurança Jurídica</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Horizonte e Região</span>
              </div>
            </div>

          </div>

          {/* Right Dedicated Image Area (Ready for Company Photograph) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame */}
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-[#c59b27]/40 via-amber-500/10 to-[#1d4682]/40 blur-xs" />

              <div className="relative rounded-lg overflow-hidden border border-[#c59b27]/40 bg-slate-950 shadow-2xl">
                {heroImageSrc ? (
                  <img
                    src={heroImageSrc}
                    alt="Sede e atendimento LB Negócios Imobiliários em Horizonte - CE"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                ) : (
                  <div className="relative h-80 sm:h-96 w-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-[#0d213f] via-[#081528] to-[#040a14]">
                    {/* Architectural Blueprint Lines */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: 'linear-gradient(to right, #dfb743 1px, transparent 1px), linear-gradient(to bottom, #dfb743 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                      }}
                    />

                    {/* Top status */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#dfb743] px-2 py-0.5 rounded bg-black/50 border border-[#c59b27]/30">
                        Horizonte • Ceará
                      </span>
                      <span className="text-xs font-serif font-bold text-slate-300">
                        CRECI J 29910 J
                      </span>
                    </div>

                    {/* Center Brand Identity Composition */}
                    <div className="relative z-10 text-center my-auto py-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-[#081528] border-2 border-[#dfb743] flex items-center justify-center shadow-lg">
                        <span className="font-serif text-2xl font-black text-[#dfb743]">
                          LB
                        </span>
                      </div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wider uppercase mb-1">
                        LB Negócios Imobiliários
                      </h2>
                      <p className="text-xs text-amber-200/80 font-medium">
                        Espaço reservado para imagem institucional da imobiliária
                      </p>
                    </div>

                    {/* Bottom Location Address Bar */}
                    <div className="relative z-10 p-3 bg-black/60 backdrop-blur-sm rounded border border-slate-800 text-left">
                      <p className="text-[11px] text-slate-400">Endereço:</p>
                      <p className="text-xs text-white font-medium truncate">
                        {COMPANY_INFO.address.street} - {COMPANY_INFO.address.neighborhood}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
