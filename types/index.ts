export type PropertyType = 'flat' | 'house';

export interface AmenityInfo {
  distance: number; // metres
  duration: number; // minutes
  mode?: 'walk' | 'drive';
}

export interface NearbyAmenities {
  market: AmenityInfo;
  hospital: AmenityInfo;
  park: AmenityInfo;
  school: AmenityInfo;
  pharmacy: AmenityInfo;
  busStop: AmenityInfo;
  kindergarten: AmenityInfo;
}

export type NoiseLevel = 'calm' | 'moderate' | 'noisy';
export type TrafficLevel = 'low' | 'moderate' | 'heavy';
export type SunlightLevel = 'low' | 'moderate' | 'high';
export type ConstructionStatus = 'none' | 'nearby' | 'active' | 'stopped';
export type StreetQuality = 'poor' | 'average' | 'good';
export type ParkingAvailability = 'scarce' | 'moderate' | 'ample';
export type AirQuality = 'poor' | 'moderate' | 'good';
export type PublicTransport = 'poor' | 'moderate' | 'good';

export interface NeighborhoodProfile {
  noise: NoiseLevel;
  traffic: TrafficLevel;
  sunlight: SunlightLevel;
  construction: ConstructionStatus;
  streetQuality: StreetQuality;
  parking: ParkingAvailability;
  airQuality: AirQuality;
  publicTransport: PublicTransport;
  notes: string[]; // short contextual bullets
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  city: string;
  neighborhood: string;
  pricePerSqm: number;
  totalPrice: number;
  size: number;
  hasBalcony: boolean;
  images: string[];
  userId: string;
  createdAt: string;
  lat?: number;
  lng?: number;
  nearby?: NearbyAmenities;
  neighborhoodProfile?: NeighborhoodProfile;
  score?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface FilterState {
  city: string;
  minPrice: number | '';
  maxPrice: number | '';
  propertyType: PropertyType | '';
  searchQuery: string;
}
