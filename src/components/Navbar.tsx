import React, { useState } from 'react';
import { Menu, X, Phone, MessageCircle, Building2, ChevronRight, Lock } from 'lucide-react';
import { ActivePage } from '../types';
import { COMPANY_INFO } from '../data/company';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { key: ActivePage; label: string }[] = [
    { key: 'inicio', label: 'INÍCIO' },
    { key: 'imoveis', label: 'IMÓVEIS' },
    { key: 'sobre', label: 'SOBRE' },
    { key: 'contato', label: 'CONTATO' },
  ];

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top verified bar */}
      <div className="bg-[#081528] text-slate-300 text-[11px] py-1.5 px-4 border-b border-[#c59b27]/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <span className="text-amber-400 font-semibold tracking-wider">
              {COMPANY_INFO.creci}
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300">
              Corretora: <strong className="text-white font-medium">{COMPANY_INFO.agentName}</strong> ({COMPANY_INFO.agentCreci})
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 hidden md:inline">
              Horizonte - CE
            </span>
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-medium"
              id="topbar-whatsapp-link"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{COMPANY_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav('inicio')}
            className="focus:outline-none focus:ring-2 focus:ring-[#c59b27]/40 rounded-sm py-1"
            aria-label="LB Negócios Imobiliários - Ir para página inicial"
            id="nav-brand-logo"
          >
            <BrandLogo variant="header" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNav(item.key)}
                  className={`relative px-4 py-2 text-xs lg:text-sm font-bold tracking-wider transition-colors uppercase ${
                    isActive
                      ? 'text-[#0d213f]'
                      : 'text-slate-600 hover:text-[#0d213f]'
                  }`}
                  id={`nav-link-${item.key}`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3 h-0.75 bg-[#c59b27] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activePage === 'admin'
                  ? 'bg-[#0d213f] text-[#dfb743] border border-[#c59b27]'
                  : 'text-slate-700 hover:text-[#0d213f] bg-slate-100 hover:bg-slate-200 border border-slate-300'
              }`}
              id="nav-admin-btn"
              title="Acessar Painel Administrativo"
            >
              <Lock className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Adm</span>
            </button>

            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs lg:text-sm font-bold tracking-wide text-white bg-[#0d213f] hover:bg-[#14325e] border border-[#c59b27]/60 shadow-xs hover:shadow-sm transition-all"
              id="nav-whatsapp-cta"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 flex items-center gap-1 cursor-pointer"
              aria-label="Acessar painel administrativo"
              id="mobile-header-admin-btn"
              title="Painel Adm"
            >
              <Lock className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Adm</span>
            </button>

            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200"
              aria-label="Chamar no WhatsApp"
              id="mobile-quick-whatsapp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-[#0d213f] hover:bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegação"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNav(item.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-[#0d213f] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  id={`mobile-nav-${item.key}`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#dfb743]' : 'text-slate-400'}`} />
                </button>
              );
            })}

            {/* Admin link in mobile drawer */}
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-colors border ${
                activePage === 'admin'
                  ? 'bg-[#0d213f] text-[#dfb743] border-[#c59b27]'
                  : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200'
              }`}
              id="mobile-nav-admin"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#c59b27]" />
                <span>Painel Adm (Corretor)</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${activePage === 'admin' ? 'text-[#dfb743]' : 'text-slate-400'}`} />
            </button>

            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                id="mobile-menu-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>

              <div className="text-center py-2 text-xs text-slate-500">
                <span>{COMPANY_INFO.creci} • {COMPANY_INFO.agentName} ({COMPANY_INFO.agentCreci})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
