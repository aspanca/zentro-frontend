export type PropertyType = 'flat' | 'house'; // legacy
export type ListingType = 'sale' | 'rent';
export type PropertyCategory =
  | 'apartment' | 'house' | 'office' | 'store'
  | 'land' | 'object' | 'warehouse' | 'business';
export type Orientation = 'east' | 'west' | 'north' | 'south';

export type FurnishingOption = 'living_room' | 'kitchen' | 'bathroom' | 'bedroom' | 'wc' | 'unfurnished';
export type HeatingOption    = 'wood' | 'pellet' | 'gas' | 'keds' | 'termokos' | 'oil';
export type ExtraOption      = 'elevator' | 'garage' | 'parking' | 'air_conditioning' | 'tv' | 'internet' | 'storage';

export interface AmenityInfo {
  distance: number;
  duration: number;
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

export type NoiseLevel          = 'calm' | 'moderate' | 'noisy';
export type TrafficLevel        = 'low' | 'moderate' | 'heavy';
export type SunlightLevel       = 'low' | 'moderate' | 'high';
export type ConstructionStatus  = 'none' | 'nearby' | 'active' | 'stopped';
export type StreetQuality       = 'poor' | 'average' | 'good';
export type ParkingAvailability = 'scarce' | 'moderate' | 'ample';
export type AirQuality          = 'poor' | 'moderate' | 'good';
export type PublicTransport     = 'poor' | 'moderate' | 'good';

export interface NeighborhoodProfile {
  noise: NoiseLevel;
  traffic: TrafficLevel;
  sunlight: SunlightLevel;
  construction: ConstructionStatus;
  streetQuality: StreetQuality;
  parking: ParkingAvailability;
  airQuality: AirQuality;
  publicTransport: PublicTransport;
  notes: string[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  // legacy
  type?: PropertyType;
  // new
  listingType: ListingType;
  category: PropertyCategory;
  city: string;
  neighborhood: string;
  pricePerSqm: number;
  totalPrice: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number | null;
  orientation?: string[] | Orientation | null;
  furnishing: FurnishingOption[];
  heating: HeatingOption[];
  extras: ExtraOption[];
  balconies?: number;
  wc?: number;
  storage?: number;
  hasBalcony?: boolean;
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
  phone?: string;
  avatar?: string | null;
}

export interface FilterState {
  searchQuery: string;
  city: string;
  listingType: ListingType | '';
  category: PropertyCategory | '';
  minPrice: number | '';
  maxPrice: number | '';
  minSize: number | '';
  maxSize: number | '';
  bedrooms: number | '';
  bathrooms: number | '';
  orientation: string[];
  furnishing: string[];
  heating: string[];
  extras: string[];
}
