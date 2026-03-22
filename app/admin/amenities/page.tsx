import RefDataManager from '@/components/admin/RefDataManager';

export default function AmenitiesPage() {
  return <RefDataManager title="Amenitetet" endpoint="/api/admin/amenities" defaultIcon="✨" />;
}
