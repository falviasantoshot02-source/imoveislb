import React from 'react';
import { MapPin, Phone, MessageCircle, Instagram, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { BrandLogo } from './BrandLogo';
import { ActivePage } from '../types';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#081528] text-slate-300 border-t-2 border-[#c59b27]/40">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Credibility */}
          <div className="flex flex-col gap-4">
            <BrandLogo variant="footer" />
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Intermediação imobiliária com transparência, segurança jurídica e atendimento exclusivo em Horizonte e toda a Região Metropolitana.
            </p>

            {/* CRECI Verification Badge */}
            <div className="p-3 bg-slate-900/90 rounded-md border border-[#c59b27]/30 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#dfb743] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white tracking-wide">
                  {COMPANY_INFO.creci}
                </p>
                <p className="text-slate-400 mt-0.5">
                  Responsável Técnica: <strong className="text-slate-200">{COMPANY_INFO.agentName}</strong> ({COMPANY_INFO.agentCreci})
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('inicio')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('imoveis')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Imóveis em Horizonte
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('sobre')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Sobre a Imobiliária
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contato')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details & Address */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
              Atendimento e Sede
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#dfb743] shrink-0 mt-0.5" />
                <address className="not-italic text-slate-300 leading-snug">
                  {COMPANY_INFO.address.street}
                  <br />
                  {COMPANY_INFO.address.neighborhood}, {COMPANY_INFO.address.city} - {COMPANY_INFO.address.state}
                  <br />
                  <span className="text-slate-400 text-xs">{COMPANY_INFO.address.country}</span>
                </address>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#dfb743] shrink-0" />
                <a
                  href={COMPANY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-200 hover:text-amber-300 transition-colors font-medium"
                >
                  {COMPANY_INFO.phoneDisplay}
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={COMPANY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 transition-colors border border-emerald-500/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conversar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Redes Sociais Verificadas */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
              Perfis no Instagram
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Acompanhe novidades, oportunidades e conteúdos do mercado imobiliário em nossos canais oficiais:
            </p>
            <div className="space-y-2">
              <a
                href={COMPANY_INFO.social.instagram1.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 hover:border-[#c59b27]/60 text-xs transition-all group"
                id="footer-instagram-1"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:text-amber-300 transition-colors" />
                  <span className="font-medium text-slate-200">{COMPANY_INFO.social.instagram1.handle}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
              </a>

              <a
                href={COMPANY_INFO.social.instagram2.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 hover:border-[#c59b27]/60 text-xs transition-all group"
                id="footer-instagram-2"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:text-amber-300 transition-colors" />
                  <span className="font-medium text-slate-200">{COMPANY_INFO.social.instagram2.handle}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Lower Copyright & Regulatory Strip */}
      <div className="border-t border-slate-800 bg-[#050e1b] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs text-slate-400">
          <div>
            <span>© {currentYear} {COMPANY_INFO.name}. Todos os direitos reservados.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400">
            <span>{COMPANY_INFO.creci}</span>
            <span>•</span>
            <span>{COMPANY_INFO.agentName} ({COMPANY_INFO.agentCreci})</span>
            <span>•</span>
            <span>Horizonte - Ceará</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Área Administrativa para gestão de imóveis"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Acesso do Corretor</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
