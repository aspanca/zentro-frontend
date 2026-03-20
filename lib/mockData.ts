import { Property, User } from '@/types';

export const KOSOVO_CITIES = [
  'Prishtinë',
  'Prizren',
  'Pejë',
  'Gjakovë',
  'Ferizaj',
  'Gjilan',
  'Mitrovicë',
  'Vushtrri',
  'Suharekë',
  'Rahovec',
  'Malishevë',
  'Skënderaj',
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    fullName: 'Arben Gashi',
    companyName: 'Gashi Real Estate',
    email: 'arben@example.com',
    password: 'password123',
  },
  {
    id: 'user-2',
    fullName: 'Lirije Krasniqi',
    email: 'lirije@example.com',
    password: 'password123',
  },
];

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Banesë moderne në qendër të Prishtinës',
    description:
      'Banesë luksoze me pamje të mrekullueshme, e vendosur në zemër të Prishtinës. Apartamenti ofron hapësirë moderne, kuzhinë të pajisur plotësisht dhe dy dhoma gjumi të rehatshme. Ndërtesa ka ashensor, ruajtje 24 orë dhe parking nëntokësor.',
    type: 'flat',
    city: 'Prishtinë',
    neighborhood: 'Qendra',
    pricePerSqm: 1800,
    totalPrice: 162000,
    size: 90,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'prop-2',
    title: 'Shtëpi e bukur me kopsht në Prizren',
    description:
      'Shtëpi familjare e re me kopsht të madh dhe pamje nga lumi. Ndërtesa dy katëshe me katër dhoma gjumi, dy banjo dhe garazh të dyfishtë. Vendndodhje e shkëlqyer afër shkollave dhe qendrës tregtare.',
    type: 'house',
    city: 'Prizren',
    neighborhood: 'Rruga e Lirisë',
    pricePerSqm: 950,
    totalPrice: 285000,
    size: 300,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    ],
    userId: 'user-2',
    createdAt: '2024-03-02T11:00:00Z',
  },
  {
    id: 'prop-3',
    title: 'Truall ndërtimi në lagjen Dardania',
    description:
      'Truall ideal për ndërtim me sipërfaqe të rregullt dhe qasje të lehtë. Infrastruktura e plotë – rrjet elektrik, ujësjellës, kanalizim. Zonë rezidenciale e qetë me shumë mundësi zhvillimi.',
    type: 'land',
    city: 'Prishtinë',
    neighborhood: 'Dardania',
    pricePerSqm: 400,
    totalPrice: 80000,
    size: 200,
    hasBalcony: false,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2024-03-03T09:00:00Z',
  },
  {
    id: 'prop-4',
    title: 'Apartament 2+1 në Pejë',
    description:
      'Apartament i mobiluar plotësisht në lagjen qendrore të Pejës. Dy dhoma gjumi, dhomë ndenje e madhe dhe ballkon me pamje nga malet. Ndërtuar në vitin 2020 me materiale cilësore.',
    type: 'flat',
    city: 'Pejë',
    neighborhood: 'Lagja e Re',
    pricePerSqm: 1200,
    totalPrice: 96000,
    size: 80,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    userId: 'user-2',
    createdAt: '2024-03-04T14:00:00Z',
  },
  {
    id: 'prop-5',
    title: 'Villa luksoze me pishinë në Gjakovë',
    description:
      'Villa e jashtëzakonshme me pishinë private dhe kopsht të madh të mirëmbajtur. Pesë dhoma gjumi, salla e pallatit, dhomë filmash dhe kuzhina profesionale. Sistemi i ngrohjes dhe ftohjes të integruar.',
    type: 'house',
    city: 'Gjakovë',
    neighborhood: 'Çabrati',
    pricePerSqm: 1100,
    totalPrice: 550000,
    size: 500,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2024-03-05T08:00:00Z',
  },
  {
    id: 'prop-6',
    title: 'Studio moderne pranë universitetit',
    description:
      'Studio e re dhe moderne, ideale për studentë ose profesionistë të rinj. Hapësirë efikase me kuzhinë të hapur, banjo moderne dhe ballkon të vogël. Qasje e lehtë me transport publik.',
    type: 'flat',
    city: 'Prishtinë',
    neighborhood: 'Bregu i Diellit',
    pricePerSqm: 1600,
    totalPrice: 64000,
    size: 40,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    ],
    userId: 'user-2',
    createdAt: '2024-03-06T16:00:00Z',
  },
  {
    id: 'prop-7',
    title: 'Truall komercial në Ferizaj',
    description:
      'Truall komercial me pozicion strategjik pranë rrugës kryesore. Zonë me trafik të lartë, i përshtatshëm për ndërtim biznesi, marketi apo qendre tregtare. Dokumentet e plota të pronës.',
    type: 'land',
    city: 'Ferizaj',
    neighborhood: 'Rruga Kryesore',
    pricePerSqm: 350,
    totalPrice: 175000,
    size: 500,
    hasBalcony: false,
    images: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2024-03-07T10:00:00Z',
  },
  {
    id: 'prop-8',
    title: 'Banesë familjare 3+1 në Gjilan',
    description:
      'Banesë e madhe familjare me tre dhoma gjumi, dy banjo dhe garazh. Lagjja e qetë dhe e sigurt me kopshte të shërbimit. Afër shkollave dhe parqeve. E gatshme për banim menjëherë.',
    type: 'flat',
    city: 'Gjilan',
    neighborhood: 'Lagja Arbëria',
    pricePerSqm: 1050,
    totalPrice: 136500,
    size: 130,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=80',
    ],
    userId: 'user-2',
    createdAt: '2024-03-08T12:00:00Z',
  },
];
