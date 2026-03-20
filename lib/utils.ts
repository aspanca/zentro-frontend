import { PropertyType } from '@/types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE').format(price) + ' €';
}

export function formatPricePerSqm(price: number): string {
  return new Intl.NumberFormat('de-DE').format(price) + ' €/m²';
}

export function propertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    flat: 'Banesë',
    house: 'Shtëpi',
    land: 'Truall',
  };
  return labels[type];
}

export function propertyTypeColor(type: PropertyType): string {
  const colors: Record<PropertyType, string> = {
    flat: 'bg-blue-100 text-blue-700',
    house: 'bg-green-100 text-green-700',
    land: 'bg-amber-100 text-amber-700',
  };
  return colors[type];
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Sot';
  if (diffDays === 1) return 'Dje';
  if (diffDays < 30) return `${diffDays} ditë më parë`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} muaj më parë`;
  return `${Math.floor(diffMonths / 12)} vit më parë`;
}
