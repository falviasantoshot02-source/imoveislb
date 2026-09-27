import { Property } from '../types';

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'demo-1',
    code: 'LB-0101',
    title: 'Casa Residencial com 3 Suítes e Varanda Gourmet',
    type: 'casa',
    typeLabel: 'Casa',
    transaction: 'venda',
    transactionLabel: 'Venda',
    price: 340000,
    priceFormatted: 'R$ 340.000',
    neighborhood: 'Centro',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: 'Bairro Centro, Horizonte - CE',
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    areaM2: 128,
    shortDescription: 'Excelente padrão construtivo em localização privilegiada no Centro de Horizonte, com ampla iluminação natural e acabamento de qualidade.',
    fullDescription: 'Imóvel modelo demonstrativo para homologação do catálogo. Configuração com sala com pé direito elevado, 3 quartos sendo 3 suítes, cozinha integrada no conceito aberto, varanda gourmet com bancada em granito, área de serviço individualizada e quintal privativo ideal para convivência familiar.',
    features: [
      '3 suítes amplas',
      'Varanda gourmet com bancada',
      'Piso em porcelanato polido',
      'Portão automático instalado',
      'Vaga para até 2 veículos',
      'Área de serviço coberta',
      'Iluminação em LED'
    ],
    images: [
      {
        url: '',
        alt: 'Fachada frontal do imóvel modelo - Horizonte CE',
        caption: 'Fachada Principal - Modelo Demonstrativo'
      },
      {
        url: '',
        alt: 'Sala de estar integrada com pé direito duplo',
        caption: 'Living e Sala Integrada'
      },
      {
        url: '',
        alt: 'Varanda gourmet com churrasqueira e bancada',
        caption: 'Espaço Gourmet e Lazer'
      },
      {
        url: '',
        alt: 'Suíte master com ventilação natural',
        caption: 'Suíte Principal'
      }
    ],
    isDemonstration: true,
    featured: true
  },
  {
    id: 'demo-2',
    code: 'LB-0102',
    title: 'Apartamento Conforto com Sacada e Vista Livre',
    type: 'apartamento',
    typeLabel: 'Apartamento',
    transaction: 'venda',
    transactionLabel: 'Venda',
    price: 195000,
    priceFormatted: 'R$ 195.000',
    condoFee: 'R$ 180 / mês',
    neighborhood: 'Planalto Horizonte',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: 'Planalto Horizonte, Horizonte - CE',
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    areaM2: 64,
    shortDescription: 'Apartamento moderno em condomínio tranquilo, com fácil acesso ao transporte, comércio local e vias principais.',
    fullDescription: 'Imóvel modelo demonstrativo para homologação do catálogo. Composto por 2 dormitórios (sendo 1 suíte reversível), sala em dois ambientes com acesso à sacada ventilada, cozinha americana prática, banheiro social e 1 vaga de garagem demarcada.',
    features: [
      '1 suíte reversível',
      'Sacada arejada com vista livre',
      'Cozinha estilo americana',
      'Condomínio fechado com guarita',
      'Próximo a escolas e serviços',
      'Baixo custo condominial'
    ],
    images: [
      {
        url: '',
        alt: 'Vista da área social do apartamento modelo',
        caption: 'Sala de Estar e Sacada'
      },
      {
        url: '',
        alt: 'Cozinha americana planejada',
        caption: 'Cozinha Integrada'
      },
      {
        url: '',
        alt: 'Dormitório principal bem ventilado',
        caption: 'Dormitório Master'
      }
    ],
    isDemonstration: true,
    featured: true
  },
  {
    id: 'demo-3',
    code: 'LB-0103',
    title: 'Lote Residencial Pronto para Construir no Bairro Catolé',
    type: 'terreno',
    typeLabel: 'Terreno',
    transaction: 'venda',
    transactionLabel: 'Venda',
    price: 85000,
    priceFormatted: 'R$ 85.000',
    neighborhood: 'Catolé',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: 'Bairro Catolé, Horizonte - CE',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    areaM2: 250,
    shortDescription: 'Terreno 100% plano com 250m² em rua pavimentada, com água encanada, energia elétrica e vizinhança consolidada.',
    fullDescription: 'Imóvel modelo demonstrativo para homologação do catálogo. Lote com 10m de frente por 25m de fundo, topografia plana, documentação regularizada apta para transferência ou financiamento bancário para construção individual.',
    features: [
      'Área total de 250m² (10x25m)',
      'Topografia totalmente plana',
      'Rede de energia e água disponíveis',
      'Rua com pavimentação',
      'Excelente potencial de valorização',
      'Documentação apta para financiamento'
    ],
    images: [
      {
        url: '',
        alt: 'Topografia e frente do lote modelo',
        caption: 'Vista Frontal do Terreno'
      },
      {
        url: '',
        alt: 'Acesso e pavimentação da rua',
        caption: 'Infraestrutura da Região'
      }
    ],
    isDemonstration: true,
    featured: true
  },
  {
    id: 'demo-4',
    code: 'LB-0104',
    title: 'Ponto Comercial Estratégico com Ampla Vitrine',
    type: 'comercial',
    typeLabel: 'Ponto Comercial',
    transaction: 'aluguel',
    transactionLabel: 'Aluguel',
    price: 2800,
    priceFormatted: 'R$ 2.800 / mês',
    neighborhood: 'Centro',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: 'Av. Principal - Centro, Horizonte - CE',
    bedrooms: 0,
    bathrooms: 2,
    parkingSpaces: 2,
    areaM2: 110,
    shortDescription: 'Espaço comercial com excelente fluxo de pedestres e veículos, salão amplo em vão livre e instalações elétricas reforçadas.',
    fullDescription: 'Imóvel modelo demonstrativo para homologação do catálogo. Imóvel comercial pronto para instalação de escritórios, clínicas, lojas ou prestação de serviços. Conta com fachada de vidro, 2 sanitários acessíveis, copa funcional e recuo para clientes.',
    features: [
      'Salão principal em vão livre',
      'Fachada envidraçada de alta visibilidade',
      '2 banheiros adaptados',
      'Copa/cozinha para colaboradores',
      'Piso cerâmico de alta resistência',
      'Localização central de alto fluxo'
    ],
    images: [
      {
        url: '',
        alt: 'Fachada frontal do ponto comercial modelo',
        caption: 'Fachada Comercial com Vitrine'
      },
      {
        url: '',
        alt: 'Salão interno em vão livre',
        caption: 'Salão Principal'
      }
    ],
    isDemonstration: true,
    featured: false
  },
  {
    id: 'demo-5',
    code: 'LB-0105',
    title: 'Casa Duplex com Quintal e Espaço para Piscina',
    type: 'casa',
    typeLabel: 'Casa',
    transaction: 'venda',
    transactionLabel: 'Venda',
    price: 420000,
    priceFormatted: 'R$ 420.000',
    neighborhood: 'Dourado',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: 'Bairro Dourado, Horizonte - CE',
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 3,
    areaM2: 175,
    shortDescription: 'Projeto contemporâneo de 2 pavimentos com 4 quartos, acabamento refinado e quintal generoso para lazer privativo.',
    fullDescription: 'Imóvel modelo demonstrativo para homologação do catálogo. Pavimento térreo com sala de estar e jantar em conceito aberto, 1 dormitório de hóspedes, banheiro completo, cozinha planejada e varanda. Pavimento superior com 3 suítes, sendo a principal com closet e varanda panorâmica.',
    features: [
      '4 quartos sendo 3 suítes superiores',
      'Quintal espaçoso para deck ou piscina',
      'Garagem para até 3 veículos',
      'Esquadrias em alumínio branco e vidro',
      'Acabamento com bancadas em mármore travertino',
      'Portão social e de garagem independentes'
    ],
    images: [
      {
        url: '',
        alt: 'Fachada duplex com arquitetura moderna',
        caption: 'Perspectiva Frontal do Duplex'
      },
      {
        url: '',
        alt: 'Ambiente de jantar e estar integrados',
        caption: 'Living Integrado'
      },
      {
        url: '',
        alt: 'Quintal posterior com área verde',
        caption: 'Área Externa e Quintal'
      }
    ],
    isDemonstration: true,
    featured: true
  },
  {
    id: 'demo-6',
    code: 'LB-0106',
    title: 'Residência Familiar para Locação com Garagem Coberta',
    type: 'casa',
    typeLabel: 'Casa',
    transaction: 'aluguel',
    transactionLabel: 'Aluguel',
    price: 1500,
    priceFormatted: 'R$ 1.500 / mês',
    neighborhood: 'Centro',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: 'Centro, Horizonte - CE',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    areaM2: 105,
    shortDescription: 'Casa bem ventilada, segura e com localização conveniente para famílias, próxima ao polo comercial de Horizonte.',
    fullDescription: 'Imóvel modelo demonstrativo para homologação do catálogo. Dispõe de sala confortável, 3 quartos sendo 1 suíte, copa-cozinha com bancada, área de serviço coberta, garagem para 2 carros e grades de proteção.',
    features: [
      '3 dormitórios sendo 1 suíte',
      'Garagem coberta para 2 veículos',
      'Cerca elétrica e portão reforçado',
      'Rua tranquila e residencial',
      'Próxima a supermercados e farmácias'
    ],
    images: [
      {
        url: '',
        alt: 'Fachada da residência térrea para locação',
        caption: 'Fachada Térrea'
      },
      {
        url: '',
        alt: 'Cozinha e sala arejadas',
        caption: 'Área Interna'
      }
    ],
    isDemonstration: true,
    featured: false
  }
];

export const NEIGHBORHOODS_HORIZONTE = [
  'Todos os bairros',
  'Centro',
  'Catolé',
  'Planalto Horizonte',
  'Dourado',
  'Diadema',
  'Mangueiral'
];
