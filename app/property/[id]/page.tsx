import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from './PropertyDetail';
import { mockProperties } from '@/lib/mockData';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = mockProperties.find((p) => p.id === params.id);

  if (!property) {
    return { title: 'Prona nuk u gjet' };
  }

  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images[0] ? [{ url: property.images[0] }] : [],
      type: 'website',
    },
  };
}

export default function PropertyPage({ params }: PageProps) {
  return <PropertyDetail id={params.id} />;
}
