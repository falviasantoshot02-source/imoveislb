import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Building, MapPin, DollarSign, BedDouble, ChevronDown } from 'lucide-react';
import { PropertyType, SearchFilters, TransactionType } from '../types';
import { NEIGHBORHOODS_HORIZONTE } from '../data/properties';

interface PropertySearchProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch?: () => void;
  resultCount?: number;
  className?: string;
  isCompact?: boolean;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  filters,
  onChange,
  onSearch,
  resultCount,
  className = '',
  isCompact = false
}) => {
  const [showAdvancedMobile, setShowAdvancedMobile] = useState(false);

  const handleTransactionToggle = (val: TransactionType | 'todos') => {
    onChange({ ...filters, transaction: val });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, type: e.target.value as PropertyType | 'todos' });
  };

  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, neighborhood: e.target.value });
  };

  const handleBedroomsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, bedrooms: e.target.value });
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'todos') {
      onChange({ ...filters, minPrice: undefined, maxPrice: undefined });
    } else if (val === '0-200k') {
      onChange({ ...filters, minPrice: 0, maxPrice: 200000 });
    } else if (val === '200k-400k') {
      onChange({ ...filters, minPrice: 200000, maxPrice: 400000 });
    } else if (val === '400k-800k') {
      onChange({ ...filters, minPrice: 400000, maxPrice: 800000 });
    } else if (val === '800k+') {
      onChange({ ...filters, minPrice: 800000, maxPrice: undefined });
    }
  };

  const handleReset = () => {
    onChange({
      transaction: 'todos',
      type: 'todos',
      neighborhood: 'Todos os bairros',
      bedrooms: 'todos',
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  // Determine current price range select value
  let currentPriceKey = 'todos';
  if (filters.minPrice === 0 && filters.maxPrice === 200000) currentPriceKey = '0-200k';
  else if (filters.minPrice === 200000 && filters.maxPrice === 400000) currentPriceKey = '200k-400k';
  else if (filters.minPrice === 400000 && filters.maxPrice === 800000) currentPriceKey = '400k-800k';
  else if (filters.minPrice === 800000 && filters.maxPrice === undefined) currentPriceKey = '800k+';

  const isFiltered = 
    filters.transaction !== 'todos' ||
    filters.type !== 'todos' ||
    filters.neighborhood !== 'Todos os bairros' ||
    filters.bedrooms !== 'todos' ||
    currentPriceKey !== 'todos';

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-slate-200/80 p-4 md:p-6 ${className}`}
      id="property-search-filter"
    >
      {/* Transaction Tabs (Comprar / Alugar / Todos) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs md:text-sm font-semibold text-slate-600 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTransactionToggle('todos')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-md transition-all ${
              filters.transaction === 'todos'
                ? 'bg-[#0d213f] text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => handleTransactionToggle('venda')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-md transition-all ${
              filters.transaction === 'venda'
                ? 'bg-[#0d213f] text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Comprar
          </button>
          <button
            type="button"
            onClick={() => handleTransactionToggle('aluguel')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-md transition-all ${
              filters.transaction === 'aluguel'
                ? 'bg-[#0d213f] text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Alugar
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvancedMobile(!showAdvancedMobile)}
          className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0 border border-slate-200"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#c59b27]" />
          <span>Filtros</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedMobile ? 'rotate-180' : ''}`} />
        </button>

        {/* Desktop reset button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-amber-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      {/* Main Filter Fields */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 ${
        !showAdvancedMobile && 'hidden sm:grid'
      }`}>
        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="search-type" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-[#c59b27]" />
            Tipo de Imóvel
          </label>
          <select
            id="search-type"
            value={filters.type}
            onChange={handleTypeChange}
            className="w-full h-11 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all cursor-pointer"
          >
            <option value="todos">Todos os tipos</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Ponto Comercial</option>
          </select>
        </div>

        {/* Neighborhood */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="search-neighborhood" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
            Localização
          </label>
          <select
            id="search-neighborhood"
            value={filters.neighborhood}
            onChange={handleNeighborhoodChange}
            className="w-full h-11 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all cursor-pointer"
          >
            {NEIGHBORHOODS_HORIZONTE.map((bairro) => (
              <option key={bairro} value={bairro}>
                {bairro}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="search-price" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
            Faixa de Preço
          </label>
          <select
            id="search-price"
            value={currentPriceKey}
            onChange={handlePriceRangeChange}
            className="w-full h-11 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all cursor-pointer"
          >
            <option value="todos">Qualquer valor</option>
            <option value="0-200k">Até R$ 200.000</option>
            <option value="200k-400k">R$ 200.000 a R$ 400.000</option>
            <option value="400k-800k">R$ 400.000 a R$ 800.000</option>
            <option value="800k+">Acima de R$ 800.000</option>
          </select>
        </div>

        {/* Bedrooms */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="search-bedrooms" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-[#c59b27]" />
            Quartos
          </label>
          <select
            id="search-bedrooms"
            value={filters.bedrooms}
            onChange={handleBedroomsChange}
            className="w-full h-11 px-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d213f]/20 focus:border-[#c59b27] transition-all cursor-pointer"
          >
            <option value="todos">Qualquer quantidade</option>
            <option value="1">1+ quarto</option>
            <option value="2">2+ quartos</option>
            <option value="3">3+ quartos</option>
            <option value="4">4+ quartos</option>
          </select>
        </div>
      </div>

      {/* Footer bar with Search Button and counts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          {typeof resultCount === 'number' ? (
            <span>
              {resultCount === 0 ? (
                'Nenhum imóvel encontrado para os filtros selecionados'
              ) : (
                <>Mostrando <strong className="text-[#0d213f] font-bold">{resultCount}</strong> {resultCount === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}</>
              )}
            </span>
          ) : (
            <span>Encontre imóveis em Horizonte e cidades vizinhas</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="sm:hidden flex-1 inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-md text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}

          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md text-sm font-semibold text-white bg-[#0d213f] hover:bg-[#14325e] active:bg-[#081528] shadow-sm transition-colors cursor-pointer border border-[#c59b27]/30"
              id="btn-search-properties"
            >
              <Search className="w-4 h-4 text-[#dfb743]" />
              <span>Buscar Imóveis</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
