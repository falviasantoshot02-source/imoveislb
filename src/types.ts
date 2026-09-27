export type PropertyType = 'casa' | 'apartamento' | 'terreno' | 'comercial';
export type TransactionType = 'venda' | 'aluguel';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  typeLabel: string;
  transaction: TransactionType;
  transactionLabel: string;
  price: number;
  priceFormatted: string;
  condoFee?: string;
  iptu?: string;
  neighborhood: string;
  city: string;
  state: string;
  addressSummary: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  images: {
    url: string;
    alt: string;
    caption?: string;
  }[];
  isDemonstration: boolean;
  featured: boolean;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFilters {
  transaction: TransactionType | 'todos';
  type: PropertyType | 'todos';
  neighborhood: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms: string; // 'todos' | '1' | '2' | '3' | '4+'
}

export type ActivePage = 'inicio' | 'imoveis' | 'detalhes' | 'sobre' | 'contato' | 'admin';
