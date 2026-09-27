import React, { useState, useMemo } from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, MapPin, Building, Sparkles, AlertCircle, CheckCircle2, Home, Key, Layers } from 'lucide-react';
import { Property, SearchFilters } from '../types';
import { DEMO_PROPERTIES } from '../data/properties';
import { HeroSection } from '../components/HeroSection';
import { PropertySearch } from '../components/PropertySearch';
import { PropertyCard } from '../components/PropertyCard';
import { COMPANY_INFO } from '../data/company';

interface HomeViewProps {
  onSelectProperty: (property: Property) => void;
  onViewAllProperties: () => void;
  onSearchSubmit: (filters: SearchFilters) => void;
  properties?: Property[];
}

type HomeCategoryFilter = 'todos' | 'venda' | 'aluguel' | 'casa' | 'apartamento' | 'terreno';

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectProperty,
  onViewAllProperties,
  onSearchSubmit,
  properties
}) => {
  const [quickFilters, setQuickFilters] = useState<SearchFilters>({
    transaction: 'todos',
    type: 'todos',
    neighborhood: 'Todos os bairros',
    bedrooms: 'todos',
  });

  const [activeCategory, setActiveCategory] = useState<HomeCategoryFilter>('todos');
  const [displayLimit, setDisplayLimit] = useState(6);

  // Source list of properties: prioritizes Firestore / database, fallbacks to DEMO_PROPERTIES
  const allProps = useMemo(() => {
    if (properties && properties.length > 0) {
      return properties;
    }
    return DEMO_PROPERTIES;
  }, [properties]);

  // Dynamic counts for quick filter buttons
  const counts = useMemo(() => ({
    todos: allProps.length,
    venda: allProps.filter(p => p.transaction === 'venda').length,
    aluguel: allProps.filter(p => p.transaction === 'aluguel').length,
    casa: allProps.filter(p => p.type === 'casa').length,
    apartamento: allProps.filter(p => p.type === 'apartamento').length,
    terreno: allProps.filter(p => p.type === 'terreno').length,
  }), [allProps]);

  // Filter and sort: Featured properties first, then real registered properties, then newest
  const filteredProperties = useMemo(() => {
    return allProps
      .filter((p) => {
        if (activeCategory === 'todos') return true;
        if (activeCategory === 'venda') return p.transaction === 'venda';
        if (activeCategory === 'aluguel') return p.transaction === 'aluguel';
        if (activeCategory === 'casa') return p.type === 'casa';
        if (activeCategory === 'apartamento') return p.type === 'apartamento';
        if (activeCategory === 'terreno') return p.type === 'terreno';
        return true;
      })
      .sort((a, b) => {
        // 1. Featured properties prioritized
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // 2. Real registered properties prioritized over demo
        if (!a.isDemonstration && b.isDemonstration) return -1;
        if (a.isDemonstration && !b.isDemonstration) return 1;
        return 0;
      });
  }, [allProps, activeCategory]);

  const visibleProperties = filteredProperties.slice(0, displayLimit);
  const hasMore = filteredProperties.length > displayLimit;
  const hasOfficialProps = allProps.some(p => !p.isDemonstration);

  const handleSearchExecute = () => {
    onSearchSubmit(quickFilters);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <HeroSection onViewProperties={onViewAllProperties} />

      {/* Overlapping Quick Search Container */}
      <div className="relative -mt-8 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PropertySearch
          filters={quickFilters}
          onChange={setQuickFilters}
          onSearch={handleSearchExecute}
          className="shadow-xl"
        />
      </div>

      {/* Section: Imóveis em Destaque & Catálogo Principal */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="featured-properties-section">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-[#c59b27]/40 text-[#a9801a] text-xs font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oportunidades em Horizonte - CE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0d213f] tracking-tight">
              IMÓVEIS DISPONÍVEIS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Confira os melhores imóveis para compra e locação em Horizonte e região.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAllProperties}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0d213f] hover:text-[#14325e] bg-white hover:bg-slate-100 py-2.5 px-4 rounded-md border border-slate-200 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
            id="home-btn-view-all"
          >
            <span>Ver Catálogo Completo ({allProps.length})</span>
            <ArrowRight className="w-4 h-4 text-[#c59b27]" />
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('todos')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'todos'
                ? 'bg-[#0d213f] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos ({counts.todos})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('venda')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'venda'
                ? 'bg-[#0d213f] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Comprar ({counts.venda})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('aluguel')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'aluguel'
                ? 'bg-[#0d213f] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Alugar ({counts.aluguel})</span>
          </button>

          {counts.casa > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory('casa')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'casa'
                  ? 'bg-[#0d213f] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Casas ({counts.casa})</span>
            </button>
          )}

          {counts.apartamento > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory('apartamento')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'apartamento'
                  ? 'bg-[#0d213f] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Apartamentos ({counts.apartamento})</span>
            </button>
          )}

          {counts.terreno > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory('terreno')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'terreno'
                  ? 'bg-[#0d213f] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Terrenos ({counts.terreno})</span>
            </button>
          )}
        </div>

        {/* Informative Catalog Status Notice */}
        {hasOfficialProps ? (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2.5 text-emerald-900 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Catálogo Oficial Ativo:</strong> Imóveis gerenciados pela <strong>LB Negócios Imobiliários</strong> (CRECI {COMPANY_INFO.creci}).
              </span>
            </div>
            <span className="hidden sm:inline font-semibold text-emerald-700">
              {filteredProperties.length} anúncio(s)
            </span>
          </div>
        ) : (
          <div className="mb-6 p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Catálogo de Oportunidades:</strong> Modelos e opções em Horizonte - CE. Consulte condições oficiais e agendamento direto com a corretora Lucilene Bezerra.
            </span>
          </div>
        )}

        {/* Properties Grid - Guaranteed to show properties! */}
        {visibleProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md mx-auto my-8">
            <Building className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#0d213f] mb-1">
              Nenhum imóvel nesta categoria
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Não encontramos imóveis para a categoria selecionada. Veja todas as opções ou fale conosco.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => setActiveCategory('todos')}
                className="px-4 py-2 text-xs font-bold text-[#0d213f] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Ver Todos os Imóveis
              </button>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Consultar no WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Load More or View Full Catalog button */}
        {hasMore && (
          <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setDisplayLimit(prev => prev + 6)}
              className="w-full sm:w-auto px-6 py-3 rounded-md text-xs font-bold text-[#0d213f] bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              Carregar Mais Imóveis ({filteredProperties.length - displayLimit} restantes)
            </button>
            <button
              type="button"
              onClick={onViewAllProperties}
              className="w-full sm:w-auto px-6 py-3 rounded-md text-xs font-bold text-white bg-[#0d213f] hover:bg-[#14325e] transition-colors shadow-sm cursor-pointer"
            >
              Ver Catálogo Completo com Filtros
            </button>
          </div>
        )}

        {/* Mobile quick link to full catalog */}
        <div className="mt-8 text-center sm:hidden">
          <button
            type="button"
            onClick={onViewAllProperties}
            className="w-full py-3 px-4 rounded-md text-xs font-bold text-white bg-[#0d213f] hover:bg-[#14325e] transition-colors shadow-sm"
          >
            Ver Catálogo com Busca Avançada ({allProps.length})
          </button>
        </div>
      </section>

      {/* Institutional Highlights Strip */}
      <section className="bg-white border-y border-slate-200/90 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0d213f] text-[#dfb743] flex items-center justify-center shrink-0 shadow-sm border border-[#c59b27]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#0d213f] mb-1">
                  CRECI Regularizado
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Intermediações credenciadas pelo CRECI-CE ({COMPANY_INFO.creci}) e condução técnica de Lucilene Bezerra ({COMPANY_INFO.agentCreci}).
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0d213f] text-[#dfb743] flex items-center justify-center shrink-0 shadow-sm border border-[#c59b27]/30">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#0d213f] mb-1">
                  Atendimento em Horizonte
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sede física localizada no Centro de Horizonte, atendendo clientes e proprietários de toda a Região Metropolitana.
                </p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0d213f] text-[#dfb743] flex items-center justify-center shrink-0 shadow-sm border border-[#c59b27]/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#0d213f] mb-1">
                  Canal Direto no WhatsApp
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sem burocracia ou intermediários: fale diretamente com a equipe pelo número oficial {COMPANY_INFO.phoneDisplay}.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Direct Contact Banner Section */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-[#081528] via-[#0d213f] to-[#14325e] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-5">
            <MessageCircle className="w-7 h-7 text-emerald-400" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Precisa comprar, vender ou alugar em Horizonte?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Entre em contato com a <strong>LB Negócios Imobiliários</strong> para avaliar seu imóvel ou receber orientações personalizadas para sua próxima conquista imobiliária.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-md text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg transition-all"
              id="cta-banner-whatsapp"
            >
              <MessageCircle className="w-5 h-5" />
              <span>FALAR NO WHATSAPP COM A CORRETORA</span>
            </a>

            <button
              type="button"
              onClick={onViewAllProperties}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md text-sm sm:text-base font-bold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Explorar Catálogo Completo</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
