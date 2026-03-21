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

// All 5 properties are in Prishtina – coordinates verified against OpenStreetMap.
// Nearby amenities & scores are calculated live from Overpass API on the detail page.
export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Banesë 2+1 në Prishtina e Re, afër Gjykatës',
    description:
      'Apartament i ndriçuar me dy dhoma gjumi dhe kuzhinë të hapur në lagjen Prishtina e Re. Ndërtesë e re 2022, kati i pestë me ashensor. Pamje nga parku dhe rrugët e gjelbra të lagjes. Afër gjykatës, shkollave dhe qendrës. Ballkon i gjerë, ngrohje qendrore, parking i lirë. I gatshëm për banim.',
    type: 'flat',
    city: 'Prishtinë',
    neighborhood: 'Prishtina e Re',
    pricePerSqm: 1250,
    totalPrice: 106250,
    size: 85,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2025-11-10T09:00:00Z',
    // Prishtina e Re – near Gjykata e Rrethit area
    lat: 42.6326,
    lng: 21.1649,
  },

  {
    id: 'prop-2',
    title: 'Banesë 3+1 në Muharrem Fejza',
    description:
      'Apartament i bollshëm me tre dhoma gjumi, dy banjo dhe kuzhinë të madhe. Kati i tretë, ndërtesë 2019. Rruga Muharrem Fejza — lagje e qetë me infrastrukturë të mirë, afër tregut dhe transportit publik. Dritare të mëdha, dysheme laminat, sistem alarmi.',
    type: 'flat',
    city: 'Prishtinë',
    neighborhood: 'Muharrem Fejza',
    pricePerSqm: 1380,
    totalPrice: 152000,
    size: 110,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    ],
    userId: 'user-2',
    createdAt: '2025-12-05T10:30:00Z',
    // Muharrem Fejza street area – eastern Prishtina
    lat: 42.6522,
    lng: 21.1928,
  },

  {
    id: 'prop-3',
    title: 'Shtëpi 4+1 me oborr në Emshiri',
    description:
      'Shtëpi familjare me katër dhoma gjumi, dy banjo dhe oborr 180 m² me pemë frutore. Garazh i brendshëm dhe dhomë shërbimi. Lagja Emshiri — ambient shumë i qetë, i përshtatshëm për familje. Çmim konkurues për sipërfaqen dhe cilësinë e ofertës.',
    type: 'house',
    city: 'Prishtinë',
    neighborhood: 'Emshiri',
    pricePerSqm: 880,
    totalPrice: 158400,
    size: 180,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2026-01-15T08:00:00Z',
    // Emshiri – western outskirts of Prishtina municipality
    lat: 42.6304,
    lng: 21.0982,
  },

  {
    id: 'prop-4',
    title: 'Banesë 1+1 e re në Arbëri',
    description:
      'Studio e re me pamje nga parku i Arbërit. Kati i dytë, ndërtesë 2023. Mbaron çdo detaj me material cilësor — parket, kuzhinë e inkuadruar, banjo me kahllon. Lagja Arbëri — e njohur për gjelbërim, qetësi dhe shërbime afër. Ideale për çift ose investim me qira.',
    type: 'flat',
    city: 'Prishtinë',
    neighborhood: 'Arbëri',
    pricePerSqm: 1480,
    totalPrice: 74000,
    size: 50,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    userId: 'user-2',
    createdAt: '2026-02-01T11:00:00Z',
    // Arbëri neighbourhood – northwest Prishtina
    lat: 42.6620,
    lng: 21.1501,
  },

  {
    id: 'prop-5',
    title: 'Banesë 2+1 me çmim të arsyeshëm në Sofali',
    description:
      'Apartament i mirëmbajtur me dy dhoma gjumi, ballkon dhe kuzhinë funksionale. Kati i katërt, ndërtesë 2015. Lagja Sofali — periferike dhe e qetë, me çmim të arsyeshëm krahasuar me lagjet qendrore. Akses i mirë me autobus. I përshtatshëm për familje të reja.',
    type: 'flat',
    city: 'Prishtinë',
    neighborhood: 'Sofali',
    pricePerSqm: 960,
    totalPrice: 86400,
    size: 90,
    hasBalcony: true,
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
    ],
    userId: 'user-1',
    createdAt: '2026-02-20T09:30:00Z',
    // Sofali – east Prishtina / Kolovicë area
    lat: 42.6677,
    lng: 21.1941,
  },
];
