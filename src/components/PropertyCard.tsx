import React from 'react';
import { Bed, Bath, Car, Maximize2, MapPin, MessageCircle, ArrowRight, Star } from 'lucide-react';
import { Property } from '../types';
import { PropertyImage } from './PropertyImage';
import { buildWhatsAppPropertyUrl } from '../data/company';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect
}) => {
  const whatsappUrl = buildWhatsAppPropertyUrl(property.title, property.code);

  const handleCardClick = () => {
    onSelect(property);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const displayPrice = property.priceFormatted || (property.price ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: property.price % 1 === 0 ? 0 : 2
  }).format(property.price) + (property.transaction === 'aluguel' && !property.priceFormatted?.includes('/mês') ? '/mês' : '') : 'Consulte');

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col bg-white rounded-lg border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#c59b27]/50 transition-all duration-300 overflow-hidden cursor-pointer"
      id={`property-card-${property.code}`}
    >
      {/* Media Header */}
      <div className="relative">
        <PropertyImage
          src={property.images[0]?.url}
          alt={property.title}
          propertyCode={property.code}
          propertyType={property.type}
          aspectRatio="card"
        />

        {/* Status badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {property.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0d213f] bg-amber-400 rounded shadow-sm border border-amber-300">
              <Star className="w-3 h-3 fill-[#0d213f]" />
              Destaque
            </span>
          )}
          <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white bg-[#0d213f] rounded shadow-sm border border-white/10">
            {property.transactionLabel}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white/95 rounded shadow-sm border border-slate-200">
            {property.typeLabel}
          </span>
        </div>

        {/* Explicit DEMONSTRAÇÃO Badge */}
        {property.isDemonstration && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/95 border border-amber-400/80 rounded shadow-xs">
              Demonstração
            </span>
          </div>
        )}

        {/* Price Tag Overlay on image bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 pt-6 flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium block">
              Valor
            </span>
            <span className="text-lg md:text-xl font-bold text-white tracking-tight">
              {displayPrice}
            </span>
          </div>
          <span className="text-xs text-[#dfb743] font-medium">
            Ref: {property.code}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-4 md:p-5">
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#c59b27] shrink-0" />
          <span className="truncate">{property.addressSummary}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#0d213f] leading-snug line-clamp-2 group-hover:text-[#1d4682] transition-colors mb-2">
          {property.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {property.shortDescription}
        </p>

        {/* Key Features Grid */}
        <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-700 font-medium mb-4 mt-auto">
          <div className="flex flex-col items-center text-center">
            <span className="flex items-center gap-1 text-slate-500 mb-0.5">
              <Bed className="w-3.5 h-3.5 text-[#c59b27]" />
            </span>
            <span className="font-semibold text-slate-800">{property.bedrooms > 0 ? property.bedrooms : '-'}</span>
            <span className="text-[10px] text-slate-500">qts</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="flex items-center gap-1 text-slate-500 mb-0.5">
              <Bath className="w-3.5 h-3.5 text-[#c59b27]" />
            </span>
            <span className="font-semibold text-slate-800">{property.bathrooms > 0 ? property.bathrooms : '-'}</span>
            <span className="text-[10px] text-slate-500">banh</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="flex items-center gap-1 text-slate-500 mb-0.5">
              <Car className="w-3.5 h-3.5 text-[#c59b27]" />
            </span>
            <span className="font-semibold text-slate-800">{property.parkingSpaces > 0 ? property.parkingSpaces : '-'}</span>
            <span className="text-[10px] text-slate-500">vagas</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="flex items-center gap-1 text-slate-500 mb-0.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#c59b27]" />
            </span>
            <span className="font-semibold text-slate-800">{property.areaM2}</span>
            <span className="text-[10px] text-slate-500">m²</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded text-xs font-semibold text-[#0d213f] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            id={`btn-details-${property.code}`}
          >
            <span>Ver Detalhes</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
            id={`btn-interest-${property.code}`}
            title="Enviar mensagem no WhatsApp sobre este imóvel"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Tenho Interesse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
