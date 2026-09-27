export const COMPANY_INFO = {
  name: 'LB NEGÓCIOS IMOBILIÁRIOS',
  shortName: 'LB Imóveis',
  creci: 'CRECI J 29910 J',
  agentName: 'Lucilene Bezerra',
  agentCreci: 'CRECI 18846F',
  phoneDisplay: '(85) 8780-5309',
  phoneRaw: '+558587805309',
  whatsappUrl: 'https://wa.me/558587805309',
  address: {
    street: 'Av. José Euclides Ferreira Gomes Junior, 154',
    neighborhood: 'Centro',
    city: 'Horizonte',
    state: 'CE',
    country: 'Brasil',
    full: 'Av. José Euclides Ferreira Gomes Junior, 154 - Centro, Horizonte - CE, Brasil',
  },
  social: {
    instagram1: {
      label: 'Instagram: Iara Lemos Corretora',
      url: 'https://www.instagram.com/iaralemoscorretora/',
      handle: '@iaralemoscorretora',
    },
    instagram2: {
      label: 'Instagram: Valéria Imóveis',
      url: 'https://www.instagram.com/imobiliariavaleriaimoveis/',
      handle: '@imobiliariavaleriaimoveis',
    },
  },
};

export function buildWhatsAppPropertyUrl(propertyTitle: string, propertyCode?: string): string {
  const codeText = propertyCode ? ` (Ref: ${propertyCode})` : '';
  const message = `Olá! Tenho interesse no imóvel ${propertyTitle}${codeText}. Gostaria de receber mais informações.`;
  return `https://wa.me/558587805309?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppGenericUrl(customMessage?: string): string {
  if (!customMessage) {
    return 'https://wa.me/558587805309';
  }
  return `https://wa.me/558587805309?text=${encodeURIComponent(customMessage)}`;
}
