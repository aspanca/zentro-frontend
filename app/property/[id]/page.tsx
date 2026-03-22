import { Metadata } from 'next';
import PropertyDetail from './PropertyDetail';

interface PageProps {
  params: { id: string };
}

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

function getApiUrl() {
  // Server-side: prefer the direct backend URL; in dev use NEXT_PUBLIC_API_URL
  return (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
}

const CATEGORY_LABELS: Record<string, string> = {
  apartment: 'Banesë', house: 'Shtëpi', office: 'Zyrë', store: 'Dyqan',
  land: 'Tokë', object: 'Objekt', warehouse: 'Depo', business: 'Biznes',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const apiUrl  = getApiUrl();
  const pageUrl = `${siteUrl}/property/${params.id}`;

  try {
    const res = await fetch(`${apiUrl}/api/properties/${params.id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('not found');
    const property = await res.json();

    const title       = property.title as string;
    const description = (property.description as string).slice(0, 160);
    const image       = (property.images as string[])?.[0] ?? null;
    const category    = CATEGORY_LABELS[property.category as string] ?? property.category;
    const price       = `€${Number(property.totalPrice).toLocaleString('sq-XK')}`;
    const location    = `${property.neighborhood}, ${property.city}`;
    const ogTitle     = `${title} — ${price}`;
    const ogDesc      = `${category} • ${location} • ${property.size} m² • ${description}`;

    return {
      title,
      description: ogDesc.slice(0, 160),
      openGraph: {
        title:       ogTitle,
        description: ogDesc.slice(0, 200),
        url:         pageUrl,
        siteName:    'Zentro',
        type:        'website',
        locale:      'sq_XK',
        ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
      },
      twitter: {
        card:        image ? 'summary_large_image' : 'summary',
        title:       ogTitle,
        description: ogDesc.slice(0, 200),
        ...(image ? { images: [image] } : {}),
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch {
    return {
      title: 'Pronë | Zentro',
      description: 'Shiko detajet e pronës në Zentro — tregu i pasurive të patundshme në Kosovë.',
    };
  }
}

export default function PropertyPage({ params }: PageProps) {
  return <PropertyDetail id={params.id} />;
}
