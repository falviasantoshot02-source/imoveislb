export type PropertyType = 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'rural';
export type TransactionType = 'venda' | 'aluguel';

export interface PropertyImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface Property {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  transaction: TransactionType;
  price: number;
  condoFee?: number;
  iptu?: number;
  neighborhood: string;
  city: string;
  state: string;
  addressSummary?: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  images: PropertyImage[];
  featured?: boolean;
  isDemonstration?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
