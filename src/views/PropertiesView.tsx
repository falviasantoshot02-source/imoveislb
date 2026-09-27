import React, { useState, useMemo } from 'react';
import { Building2, MessageCircle, AlertCircle, Sparkles, Filter, CheckCircle2, RotateCcw } from 'lucide-react';
import { Property, SearchFilters } from '../types';
import { DEMO_PROPERTIES } from '../data/properties';
import { PropertyCard } from '../components/PropertyCard';
import { PropertySearch } from '../components/PropertySearch';
import { COMPANY_INFO } from '../data/company';

interface PropertiesViewProps {
  onSelectProperty: (property: Property) => void;
  initialFilters?: Partial<SearchFilters>;
  properties?: Property[];
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  onSelectProperty,
  initialFilters,
  properties
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    transaction: 'todos',
    type: 'todos',
    neighborhood: 'Todos os bairros',
    bedrooms: 'todos',
    minPrice: undefined,
    maxPrice: undefined,
    ...initialFilters
  });

  // Source list: uses database properties if available, otherwise DEMO_PROPERTIES
  const sourceList = useMemo(() => {
    if (properties && properties.length > 0) {
      return properties;
    }
    return DEMO_PROPERTIES;
  }, [properties]);

  const hasLiveProperties = useMemo(() => {
    return properties && properties.length > 0 && properties.some(p => !p.isDemonstration);
  }, [properties]);

  // Filter properties logic
  const filteredProperties = useMemo(() => {
    return sourceList.filter((item) => {
      // Transaction
      if (filters.transaction !== 'todos' && item.transaction !== filters.transaction) {
        return false;
      }
      // Type
      if (filters.type !== 'todos' && item.type !== filters.type) {
        return false;
      }
      // Neighborhood
      if (filters.neighborhood !== 'Todos os bairros' && item.neighborhood !== filters.neighborhood) {
        return false;
      }
      // Bedrooms
      if (filters.bedrooms !== 'todos') {
        const minBed = parseInt(filters.bedrooms, 10);
        if (item.bedrooms < minBed) {
          return false;
        }
      }
      // Price range
      if (filters.minPrice !== undefined && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && item.price > filters.maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // 1. Featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // 2. Real registered properties first
      if (!a.isDemonstration && b.isDemonstration) return -1;
      if (a.isDemonstration && !b.isDemonstration) return 1;
      return 0;
    });
  }, [sourceList, filters]);

  const handleResetFilters = () => {
    setFilters({
      transaction: 'todos',
      type: 'todos',
      neighborhood: 'Todos os bairros',
      bedrooms: 'todos',
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-[#c59b27]/40 text-[#a9801a] text-xs font-bold tracking-wider uppercase mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Catálogo Imobiliário • Horizonte - CE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0d213f] tracking-tight">
              Imóveis Disponíveis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Explore casas, apartamentos, terrenos e oportunidades comerciais em Horizonte e região.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold self-start md:self-auto">
            {hasLiveProperties ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Catálogo Oficial Ativo ({sourceList.length} imóveis)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {sourceList.length} imóveis no catálogo
              </span>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8">
          <PropertySearch
            filters={filters}
            onChange={setFilters}
            resultCount={filteredProperties.length}
          />
        </div>

        {/* Properties Grid - Guaranteed to show all matching properties! */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800 mb-2">
              Nenhum imóvel encontrado com esses filtros
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Tente alterar os critérios de busca ou redefina os filtros para ver todas as opções disponíveis no catálogo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md text-xs font-bold text-[#0d213f] bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Todos os Filtros</span>
              </button>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Solicitar Imóvel no WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
