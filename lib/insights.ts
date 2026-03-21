import { NeighborhoodProfile, NearbyAmenities, Property } from '@/types';

// ─── Price analysis ───────────────────────────────────────────────────────────

export interface PriceAnalysis {
  cityAvgPricePerSqm: number;
  /** positive = above average, negative = below (decimal, e.g. 0.12 = 12%) */
  diffPct: number;
  label: 'above' | 'below' | 'average';
}

export function calcPriceAnalysis(
  property: Property,
  allProperties: Property[]
): PriceAnalysis {
  const cityProps = allProperties.filter(
    (p) => p.city === property.city && p.id !== property.id
  );
  const comparables = cityProps.length > 0 ? cityProps : allProperties;
  const avg =
    comparables.reduce((sum, p) => sum + p.pricePerSqm, 0) / comparables.length;

  const diffPct = (property.pricePerSqm - avg) / avg;
  let label: PriceAnalysis['label'] = 'average';
  if (diffPct > 0.02) label = 'above';
  else if (diffPct < -0.02) label = 'below';

  return { cityAvgPricePerSqm: Math.round(avg), diffPct, label };
}

// ─── Score ────────────────────────────────────────────────────────────────────

/**
 * 0–10 score:
 *   Price component     (0–4 pts): below city avg = better
 *   Proximity component (0–4 pts): 4 key amenities × 1 pt each
 *   Profile bonus       (0–2 pts): neighborhood quality
 */
export function calcScore(
  property: Property,
  allProperties: Property[]
): number {
  const { diffPct } = calcPriceAnalysis(property, allProperties);

  // Price: clamp diff to ±30%, map to 0–4
  const clampedDiff = Math.max(-0.3, Math.min(0.3, diffPct));
  const priceScore = ((0.3 - clampedDiff) / 0.6) * 4;

  // Proximity (4 primary amenities, up to 1 pt each)
  const nearby = property.nearby;
  let proximityScore = 0;
  if (nearby) {
    proximityScore += amenityPt(nearby.market.distance, 400);
    proximityScore += amenityPt(nearby.hospital.distance, 1500);
    proximityScore += amenityPt(nearby.park.distance, 500);
    proximityScore += amenityPt(nearby.school.distance, 600);
  } else {
    proximityScore = 2;
  }

  // Neighborhood profile bonus (0–2 pts)
  const profile = property.neighborhoodProfile;
  let profileScore = 0;
  if (profile) {
    if (profile.noise === 'calm') profileScore += 0.4;
    else if (profile.noise === 'moderate') profileScore += 0.2;

    if (profile.traffic === 'low') profileScore += 0.3;
    else if (profile.traffic === 'moderate') profileScore += 0.15;

    if (profile.airQuality === 'good') profileScore += 0.4;
    else if (profile.airQuality === 'moderate') profileScore += 0.2;

    if (profile.streetQuality === 'good') profileScore += 0.3;
    else if (profile.streetQuality === 'average') profileScore += 0.15;

    if (profile.construction === 'none') profileScore += 0.3;
    else if (profile.construction === 'nearby') profileScore += 0.1;

    if (profile.sunlight === 'high') profileScore += 0.3;
    else if (profile.sunlight === 'moderate') profileScore += 0.15;
  } else {
    profileScore = 1;
  }

  const raw = priceScore + proximityScore + Math.min(2, profileScore);
  return Math.min(10, Math.max(0, Math.round(raw * 10) / 10));
}

/** Linear decay: full 1 pt at distance ≤ ideal, 0 pts at 3× ideal */
function amenityPt(distance: number, ideal: number): number {
  if (distance <= ideal) return 1;
  if (distance >= ideal * 3) return 0;
  return 1 - (distance - ideal) / (ideal * 2);
}

// ─── Score breakdown (exposes the three components separately) ───────────────

export interface ScoreBreakdown {
  total: number;
  priceScore: number;     // 0–4
  proximityScore: number; // 0–4
  profileScore: number;   // 0–2
}

export function calcScoreBreakdown(
  property: Property,
  allProperties: Property[]
): ScoreBreakdown {
  const { diffPct } = calcPriceAnalysis(property, allProperties);

  const clampedDiff = Math.max(-0.3, Math.min(0.3, diffPct));
  const priceScore = ((0.3 - clampedDiff) / 0.6) * 4;

  const nearby = property.nearby;
  let proximityScore = 0;
  if (nearby) {
    proximityScore += amenityPt(nearby.market.distance, 400);
    proximityScore += amenityPt(nearby.hospital.distance, 1500);
    proximityScore += amenityPt(nearby.park.distance, 500);
    proximityScore += amenityPt(nearby.school.distance, 600);
  } else {
    proximityScore = 2;
  }

  const profile = property.neighborhoodProfile;
  let profileRaw = 0;
  if (profile) {
    if (profile.noise === 'calm') profileRaw += 0.4;
    else if (profile.noise === 'moderate') profileRaw += 0.2;
    if (profile.traffic === 'low') profileRaw += 0.3;
    else if (profile.traffic === 'moderate') profileRaw += 0.15;
    if (profile.airQuality === 'good') profileRaw += 0.4;
    else if (profile.airQuality === 'moderate') profileRaw += 0.2;
    if (profile.streetQuality === 'good') profileRaw += 0.3;
    else if (profile.streetQuality === 'average') profileRaw += 0.15;
    if (profile.construction === 'none') profileRaw += 0.3;
    else if (profile.construction === 'nearby') profileRaw += 0.1;
    if (profile.sunlight === 'high') profileRaw += 0.3;
    else if (profile.sunlight === 'moderate') profileRaw += 0.15;
  } else {
    profileRaw = 1;
  }
  const profileScore = Math.min(2, profileRaw);

  const raw = priceScore + proximityScore + profileScore;
  const total = Math.min(10, Math.max(0, Math.round(raw * 10) / 10));
  return {
    total,
    priceScore: Math.round(priceScore * 10) / 10,
    proximityScore: Math.round(proximityScore * 10) / 10,
    profileScore: Math.round(profileScore * 10) / 10,
  };
}

// ─── Score label / colour helpers ────────────────────────────────────────────

export function scoreLabel(score: number): string {
  if (score >= 8) return 'Shkëlqyer';
  if (score >= 6) return 'Shumë mirë';
  if (score >= 4) return 'Mirë';
  return 'Mesatar';
}

export function scoreColorClasses(score: number): string {
  if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 4) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

export function scoreRingHex(score: number): string {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#3b82f6';
  if (score >= 4) return '#f59e0b';
  return '#9ca3af';
}

// ─── Mock nearby / profile generators (for new listings) ─────────────────────

const NEARBY_PRESETS: NearbyAmenities[] = [
  {
    market:      { distance: 280,  duration: 3,  mode: 'walk'  },
    hospital:    { distance: 950,  duration: 4,  mode: 'drive' },
    park:        { distance: 420,  duration: 5,  mode: 'walk'  },
    school:      { distance: 380,  duration: 5,  mode: 'walk'  },
    pharmacy:    { distance: 200,  duration: 2,  mode: 'walk'  },
    busStop:     { distance: 150,  duration: 2,  mode: 'walk'  },
    kindergarten:{ distance: 500,  duration: 6,  mode: 'walk'  },
  },
  {
    market:      { distance: 550,  duration: 7,  mode: 'walk'  },
    hospital:    { distance: 1800, duration: 7,  mode: 'drive' },
    park:        { distance: 750,  duration: 9,  mode: 'walk'  },
    school:      { distance: 620,  duration: 8,  mode: 'walk'  },
    pharmacy:    { distance: 480,  duration: 6,  mode: 'walk'  },
    busStop:     { distance: 350,  duration: 4,  mode: 'walk'  },
    kindergarten:{ distance: 700,  duration: 9,  mode: 'walk'  },
  },
  {
    market:      { distance: 150,  duration: 2,  mode: 'walk'  },
    hospital:    { distance: 1400, duration: 6,  mode: 'drive' },
    park:        { distance: 200,  duration: 2,  mode: 'walk'  },
    school:      { distance: 300,  duration: 4,  mode: 'walk'  },
    pharmacy:    { distance: 180,  duration: 2,  mode: 'walk'  },
    busStop:     { distance: 100,  duration: 1,  mode: 'walk'  },
    kindergarten:{ distance: 400,  duration: 5,  mode: 'walk'  },
  },
  {
    market:      { distance: 900,  duration: 11, mode: 'walk'  },
    hospital:    { distance: 2800, duration: 10, mode: 'drive' },
    park:        { distance: 1100, duration: 13, mode: 'walk'  },
    school:      { distance: 850,  duration: 10, mode: 'walk'  },
    pharmacy:    { distance: 950,  duration: 12, mode: 'walk'  },
    busStop:     { distance: 600,  duration: 7,  mode: 'walk'  },
    kindergarten:{ distance: 1000, duration: 12, mode: 'walk'  },
  },
];

const PROFILE_PRESETS: NeighborhoodProfile[] = [
  {
    noise: 'calm',
    traffic: 'low',
    sunlight: 'high',
    construction: 'none',
    streetQuality: 'good',
    parking: 'moderate',
    airQuality: 'good',
    publicTransport: 'moderate',
    notes: [
      'Lagje e qetë dhe e sigurt',
      'Infrastrukturë e mirë rrugore',
      'Ekspozim i mirë ndaj diellit',
    ],
  },
  {
    noise: 'moderate',
    traffic: 'moderate',
    sunlight: 'moderate',
    construction: 'nearby',
    streetQuality: 'average',
    parking: 'scarce',
    airQuality: 'moderate',
    publicTransport: 'good',
    notes: [
      'Transport publik i mirë',
      'Lagje në zhvillim aktiv',
      'Parking i kufizuar',
    ],
  },
];

export function generateMockNearby(seed: number): NearbyAmenities {
  return NEARBY_PRESETS[seed % NEARBY_PRESETS.length];
}

export function generateMockProfile(seed: number): NeighborhoodProfile {
  return PROFILE_PRESETS[seed % PROFILE_PRESETS.length];
}
