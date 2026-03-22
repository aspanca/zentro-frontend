import RefDataManager from '@/components/admin/RefDataManager';

export default function HeatingPage() {
  return <RefDataManager title="Opsionet e ngrohjes" endpoint="/api/admin/heating-options" defaultIcon="🔥" />;
}
