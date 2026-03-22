import RefDataManager from '@/components/admin/RefDataManager';

export default function CitiesPage() {
  return <RefDataManager title="Qytetet" endpoint="/api/admin/cities" defaultIcon="🏙️" hideIcon />;
}
