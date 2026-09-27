import React from 'react';
import { ShieldCheck, UserCheck, MapPin, Phone, MessageCircle, Instagram, CheckCircle2, ArrowRight } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { BrandLogo } from '../components/BrandLogo';

interface AboutViewProps {
  onViewProperties: () => void;
  onContactClick: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onViewProperties,
  onContactClick
}) => {
  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-[#c59b27]/40 text-[#a9801a] text-xs font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Informações Institucionais Verificadas</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d213f] tracking-tight mb-4">
            Sobre a LB Negócios Imobiliários
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Intermediação imobiliária regularizada e dedicada a conectar compradores, vendedores e locatários em Horizonte e municípios vizinhos no Ceará.
          </p>
        </div>

        {/* Credential Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          
          {/* Card 1: Empresa */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <BrandLogo variant="header" />
                <span className="text-xs font-mono font-bold text-[#dfb743] bg-[#0d213f] px-3 py-1 rounded">
                  Pessoa Jurídica
                </span>
              </div>

              <h2 className="font-serif text-xl font-bold text-[#0d213f] mb-3">
                {COMPANY_INFO.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Empresa imobiliária devidamente registrada junto ao Conselho Regional de Corretores de Imóveis (CRECI-CE), atuando na intermediação segura de imóveis urbanos, residenciais e comerciais no município de Horizonte, Ceará.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Registro Profissional:</span>
                    <strong className="text-slate-900 font-bold">{COMPANY_INFO.creci}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Sede e Atendimento:</span>
                    <strong className="text-slate-900 font-medium">{COMPANY_INFO.address.full}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-md text-xs sm:text-sm font-bold text-white bg-[#0d213f] hover:bg-[#14325e] transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Conversar pelo WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 2: Corretora Responsável */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-[#c59b27]/40 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-[#a9801a]" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
                  Corretora Habilitada
                </span>
              </div>

              <h2 className="font-serif text-xl font-bold text-[#0d213f] mb-3">
                {COMPANY_INFO.agentName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Corretora de imóveis responsável pelo atendimento, avaliação e condução das negociações, com credenciamento ativo no CRECI-CE para garantir a conformidade legal de contratos de compra, venda e locação.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">CRECI Individual:</span>
                    <strong className="text-slate-900 font-bold">{COMPANY_INFO.agentCreci}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Telefone e WhatsApp:</span>
                    <strong className="text-slate-900 font-medium">{COMPANY_INFO.phoneDisplay}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={COMPANY_INFO.social.instagram1.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between py-2.5 px-3 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>{COMPANY_INFO.social.instagram1.label}</span>
                </span>
                <span className="text-[#a9801a] font-semibold">{COMPANY_INFO.social.instagram1.handle}</span>
              </a>

              <a
                href={COMPANY_INFO.social.instagram2.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between py-2.5 px-3 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>{COMPANY_INFO.social.instagram2.label}</span>
                </span>
                <span className="text-[#a9801a] font-semibold">{COMPANY_INFO.social.instagram2.handle}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Commitment to Transparency Section */}
        <div className="bg-[#081528] text-white rounded-xl p-8 md:p-10 border border-[#c59b27]/40 shadow-md">
          <div className="max-w-3xl">
            <h3 className="font-serif text-2xl font-bold text-white mb-4">
              Compromisso com a Segurança Jurídica
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              A atuação da LB Negócios Imobiliários é pautada na ética profissional estabelecida pelo Código de Ética dos Corretores de Imóveis. Cada intermediação busca garantir que as partes envolvidas tenham clareza sobre certidões, titularidade, localização e condições contratuais.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-200 mb-8">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Intermediação regularizada perante o CRECI-CE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Atendimento presencial em Horizonte - CE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Acompanhamento direto em visitas e propostas</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#dfb743] shrink-0" />
                <span>Orientação para financiamento e contratos</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onViewProperties}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-xs sm:text-sm font-bold text-[#081528] bg-[#dfb743] hover:bg-[#e5c05b] transition-colors cursor-pointer"
              >
                <span>Consultar Imóveis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContactClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-xs sm:text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <span>Ver Endereço e Contato</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
