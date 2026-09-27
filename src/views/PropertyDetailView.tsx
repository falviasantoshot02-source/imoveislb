import React, { useState } from 'react';
import { 
  ArrowLeft, MessageCircle, MapPin, Bed, Bath, Car, Maximize2, 
  Check, Share2, ShieldCheck, Phone, ChevronRight, AlertCircle 
} from 'lucide-react';
import { Property } from '../types';
import { PropertyImage } from '../components/PropertyImage';
import { COMPANY_INFO, buildWhatsAppPropertyUrl } from '../data/company';

interface PropertyDetailViewProps {
  property: Property;
  onBack: () => void;
  onNavigateHome: () => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
  onBack,
  onNavigateHome
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const whatsappUrl = buildWhatsAppPropertyUrl(property.title, property.code);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const activeImage = property.images[activeImageIndex] || property.images[0];

  const displayPrice = property.priceFormatted || (property.price ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: property.price % 1 === 0 ? 0 : 2
  }).format(property.price) + (property.transaction === 'aluguel' && !property.priceFormatted?.includes('/mês') ? '/mês' : '') : 'Consulte');

  return (
    <div className="bg-slate-50 min-h-screen py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 hover:text-[#0d213f] bg-white hover:bg-slate-100 py-2 px-3.5 rounded-md border border-slate-200 transition-colors shadow-xs"
            id="btn-back-to-properties"
          >
            <ArrowLeft className="w-4 h-4 text-[#c59b27]" />
            <span>Voltar para Imóveis</span>
          </button>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <button 
              type="button" 
              onClick={onNavigateHome}
              className="hover:text-slate-800 transition-colors"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              type="button" 
              onClick={onBack}
              className="hover:text-slate-800 transition-colors"
            >
              Imóveis
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate max-w-xs">
              Ref: {property.code}
            </span>
          </nav>
        </div>

        {/* Demonstration Notice Banner if applicable */}
        {property.isDemonstration && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300/80 flex items-start gap-3 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="font-bold uppercase tracking-wider block mb-0.5">
                Aviso: Imóvel Modelo Demonstrativo
              </strong>
              <span>
                Esta ficha é um modelo estrutural para demonstração da plataforma de homologação do catálogo. Todas as informações reais serão cadastradas conforme os laudos e contratos autorizados pela imobiliária. Para consultar disponibilidades atuais em Horizonte e região, entre em contato direto pelo WhatsApp.
              </span>
            </div>
          </div>
        )}

        {/* Top Header Block */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white bg-[#0d213f] rounded">
                  {property.transactionLabel}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded border border-slate-200">
                  {property.typeLabel}
                </span>
                <span className="text-xs font-mono font-bold text-[#a9801a] bg-amber-50 px-2 py-0.5 rounded border border-[#c59b27]/30">
                  Código: {property.code}
                </span>
                {property.isDemonstration && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Demonstração
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0d213f] leading-snug">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span>{property.addressSummary}</span>
              </div>
            </div>

            {/* Price & Action Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium block">
                  {property.transaction === 'aluguel' ? 'Valor do Aluguel' : 'Valor do Imóvel'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0d213f] tracking-tight">
                  {displayPrice}
                </span>
                {property.condoFee && (
                  <p className="text-xs text-slate-500 mt-0.5">Condomínio: {property.condoFee}</p>
                )}
                {property.iptu && (
                  <p className="text-xs text-slate-500 mt-0.5">IPTU: {property.iptu}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 px-3 rounded border border-slate-200 transition-colors"
                title="Compartilhar imóvel"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedLink ? 'Link copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Gallery & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Image Gallery + Description + Features */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Gallery Section */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Main Display Image */}
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 mb-3">
                <PropertyImage
                  src={activeImage?.url}
                  alt={activeImage?.alt || property.title}
                  propertyCode={property.code}
                  propertyType={property.type}
                  caption={activeImage?.caption}
                  aspectRatio="video"
                />
              </div>

              {/* Thumbnails Row */}
              {property.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 pt-2">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative rounded overflow-hidden border-2 transition-all aspect-[4/3] bg-slate-900 ${
                        activeImageIndex === idx
                          ? 'border-[#c59b27] ring-2 ring-[#dfb743]/40'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Visualizar imagem ${idx + 1}`}
                    >
                      <PropertyImage
                        src={img.url}
                        alt={img.alt}
                        propertyCode={property.code}
                        propertyType={property.type}
                        showPlaceholderNotice={false}
                        aspectRatio="card"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm text-center">
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Bed className="w-5 h-5 text-[#c59b27] mb-1" />
                <span className="text-lg font-bold text-slate-800">
                  {property.bedrooms > 0 ? property.bedrooms : 'N/A'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Quartos</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Bath className="w-5 h-5 text-[#c59b27] mb-1" />
                <span className="text-lg font-bold text-slate-800">
                  {property.bathrooms > 0 ? property.bathrooms : 'N/A'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Banheiros</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Car className="w-5 h-5 text-[#c59b27] mb-1" />
                <span className="text-lg font-bold text-slate-800">
                  {property.parkingSpaces > 0 ? property.parkingSpaces : 'N/A'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Vagas de Garagem</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Maximize2 className="w-5 h-5 text-[#c59b27] mb-1" />
                <span className="text-lg font-bold text-slate-800">
                  {property.areaM2} m²
                </span>
                <span className="text-xs text-slate-500 font-medium">Área Construída/Total</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[#0d213f] mb-4 pb-2 border-b border-slate-100">
                Descrição do Imóvel
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {property.fullDescription}
              </p>
            </div>

            {/* Property Features Card */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-[#0d213f] mb-4 pb-2 border-b border-slate-100">
                  Características e Diferenciais
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-amber-50 border border-[#c59b27]/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#a9801a]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Prominent WhatsApp CTA & Contact Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Lead Conversion Card */}
            <div className="sticky top-24 bg-white rounded-xl p-6 border-2 border-[#c59b27]/40 shadow-md">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#a9801a] bg-amber-50 px-2.5 py-1 rounded border border-[#c59b27]/30 mb-3">
                Interesse Imediato
              </span>

              <h3 className="font-serif text-xl font-bold text-[#0d213f] mb-2 leading-tight">
                Gostou deste imóvel?
              </h3>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Fale agora diretamente com nossa corretora responsável para tirar dúvidas, agendar uma visita ou solicitar opções similares em Horizonte.
              </p>

              {/* Primary Prominent CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-lg text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-center mb-4"
                id="btn-primary-interest-whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
                <span>TENHO INTERESSE NESTE IMÓVEL</span>
              </a>

              <p className="text-[11px] text-slate-500 text-center mb-6">
                Mensagem pré-formatada com o nome e a referência do imóvel para atendimento ágil.
              </p>

              {/* Agency & Agent Credential Block */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#0d213f]">
                  <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
                  <span>{COMPANY_INFO.name}</span>
                </div>
                <div className="text-slate-600 space-y-1">
                  <p>Registro: <strong className="text-slate-800">{COMPANY_INFO.creci}</strong></p>
                  <p>Corretora: <strong className="text-slate-800">{COMPANY_INFO.agentName}</strong> ({COMPANY_INFO.agentCreci})</p>
                  <p>Telefone: <strong className="text-slate-800">{COMPANY_INFO.phoneDisplay}</strong></p>
                </div>
              </div>

              {/* Verified Address */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">Sede da Imobiliária:</p>
                <p>{COMPANY_INFO.address.full}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
