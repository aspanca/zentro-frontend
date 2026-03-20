export type PropertyType = 'flat' | 'house' | 'land';

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
}

export interface User {
  id: string;
  fullName: string;
  companyName?: string;
  email: string;
  password: string;
}

export interface FilterState {
  city: string;
  minPrice: number | '';
  maxPrice: number | '';
  propertyType: PropertyType | '';
  searchQuery: string;
}
