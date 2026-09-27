import React, { useState } from 'react';
import { MessageCircle, X, ShieldCheck } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col items-end print:hidden">
      {/* Tooltip on hover / initial prompt */}
      {showTooltip && (
        <div className="mb-2 max-w-xs bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-amber-400/40 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="absolute top-1.5 right-1.5 text-slate-400 hover:text-white"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Atendimento Direto
          </p>
          <p className="text-slate-300 text-[11px] leading-snug">
            Fale agora com a equipe da <strong>LB Negócios Imobiliários</strong> pelo WhatsApp.
          </p>
        </div>
      )}

      {/* Main floating button */}
      <a
        href={COMPANY_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-4 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-300/40"
        aria-label="Iniciar conversa no WhatsApp com LB Negócios Imobiliários"
        id="floating-whatsapp-btn"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 text-white" />
          {/* Subtle online pulse */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300" />
          </span>
        </div>

        <span className="text-xs font-bold tracking-wide hidden sm:inline-block">
          WhatsApp
        </span>
      </a>
    </div>
  );
};
