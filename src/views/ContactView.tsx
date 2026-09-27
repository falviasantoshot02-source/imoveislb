import React, { useState } from 'react';
import { 
  MapPin, Phone, MessageCircle, Instagram, ShieldCheck, 
  Send, CheckCircle2, ArrowUpRight, Clock 
} from 'lucide-react';
import { COMPANY_INFO, buildWhatsAppGenericUrl } from '../data/company';

export const ContactView: React.FC = () => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [assunto, setAssunto] = useState('Dúvidas Gerais');
  const [mensagem, setMensagem] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare formatted text for WhatsApp
    const textLines = [
      `*Contato via Website - LB Negócios Imobiliários*`,
      `*Nome:* ${nome.trim() || 'Não informado'}`,
      `*Telefone/WhatsApp:* ${telefone.trim() || 'Não informado'}`,
      `*Assunto:* ${assunto}`,
      `*Mensagem:* ${mensagem.trim() || 'Gostaria de mais informações.'}`,
    ].join('\n');

    const whatsappDirectUrl = buildWhatsAppGenericUrl(textLines);
    window.open(whatsappDirectUrl, '_blank', 'noopener,noreferrer');

    setFormSubmitted(true);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Av. José Euclides Ferreira Gomes Junior, 154 - Centro, Horizonte - CE, Brasil'
  )}`;

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-[#c59b27]/40 text-[#a9801a] text-xs font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Atendimento Oficial</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d213f] tracking-tight mb-4">
            Canais de Atendimento
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Entre em contato com a equipe da <strong>LB NEGÓCIOS IMOBILIÁRIOS</strong>. Estamos à disposição para tirar dúvidas, agendar atendimentos e receber propostas.
          </p>
        </div>

        {/* Top Prominent WhatsApp Banner */}
        <div className="mb-10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold">
                Atendimento Prioritário pelo WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Converse diretamente com Lucilene Bezerra e receba atendimento ágil para compras, vendas ou locações.
              </p>
            </div>
          </div>

          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm sm:text-base font-bold text-emerald-950 bg-white hover:bg-emerald-50 active:bg-slate-100 shadow-md transition-all shrink-0 w-full md:w-auto"
            id="contact-top-whatsapp-btn"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>FALAR PELO WHATSAPP</span>
          </a>
        </div>

        {/* Main Grid: Details + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Official Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Address & Credentials Card */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0d213f] mb-1">
                  {COMPANY_INFO.name}
                </h3>
                <p className="text-xs font-semibold text-[#a9801a]">
                  {COMPANY_INFO.creci}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                {/* Agent */}
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-xs">Corretora Responsável:</span>
                    <strong className="text-slate-900 font-bold">{COMPANY_INFO.agentName}</strong>
                    <span className="text-slate-500 block text-xs mt-0.5">{COMPANY_INFO.agentCreci}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-xs">Endereço da Sede:</span>
                    <address className="not-italic text-slate-900 font-medium leading-snug">
                      {COMPANY_INFO.address.street}
                      <br />
                      {COMPANY_INFO.address.neighborhood}, {COMPANY_INFO.address.city} - {COMPANY_INFO.address.state}
                      <br />
                      <span className="text-slate-500 text-xs">{COMPANY_INFO.address.country}</span>
                    </address>
                    
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d4682] hover:text-[#0d213f] mt-2 group"
                    >
                      <span>Abrir no Google Maps</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-xs">Telefone / WhatsApp:</span>
                    <a
                      href={COMPANY_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 font-bold hover:text-emerald-600 transition-colors"
                    >
                      {COMPANY_INFO.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram official links */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-serif text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>Canais Oficiais no Instagram</span>
                </h4>
                
                <div className="space-y-2">
                  <a
                    href={COMPANY_INFO.social.instagram1.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-colors group"
                    id="contact-instagram-1"
                  >
                    <span>{COMPANY_INFO.social.instagram1.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800" />
                  </a>

                  <a
                    href={COMPANY_INFO.social.instagram2.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-colors group"
                    id="contact-instagram-2"
                  >
                    <span>{COMPANY_INFO.social.instagram2.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Direct Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <div className="mb-6">
                <h3 className="font-serif text-xl font-bold text-[#0d213f] mb-1">
                  Envie uma Mensagem
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Preencha os campos abaixo para iniciar um atendimento via WhatsApp ou deixar seu recado para nossa equipe:
                </p>
              </div>

              {formSubmitted && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-emerald-900 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Mensagem encaminhada!</strong>
                    <span>Uma conversa foi aberta no WhatsApp com as informações preenchidas. Nossa equipe responderá em breve.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
                {/* Nome */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome ou razão social"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all"
                  />
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(85) 90000-0000"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all"
                  />
                </div>

                {/* Assunto */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Assunto do Contato
                  </label>
                  <select
                    id="contact-subject"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all cursor-pointer"
                  >
                    <option value="Dúvidas Gerais">Dúvidas Gerais</option>
                    <option value="Interesse em Comprar Imóvel">Interesse em Comprar Imóvel</option>
                    <option value="Interesse em Alugar Imóvel">Interesse em Alugar Imóvel</option>
                    <option value="Quero Cadastrar Meu Imóvel">Quero Cadastrar / Vender Meu Imóvel</option>
                    <option value="Agendamento de Visita">Agendamento de Visita</option>
                  </select>
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mensagem
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Descreva detalhes como tipo de imóvel, bairro de preferência ou a referência que chamou sua atenção..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-md text-sm font-bold text-white bg-[#0d213f] hover:bg-[#14325e] border border-[#c59b27]/40 shadow-sm transition-colors cursor-pointer"
                  id="btn-submit-contact-form"
                >
                  <Send className="w-4 h-4 text-[#dfb743]" />
                  <span>Enviar Mensagem pelo WhatsApp</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Ao clicar, você será direcionado ao WhatsApp oficial da corretora com a mensagem pré-formatada.
                </p>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
