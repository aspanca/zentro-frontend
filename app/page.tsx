import SearchFilters from '@/components/SearchFilters';
import PropertyGrid from '@/components/PropertyGrid';
import ApiStatus from '@/components/ApiStatus';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
            Gjeni pronën tuaj<br />
            <span className="text-rose-400">në Kosovë</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Banesa, shtëpi dhe truall — me çmime, analiza dhe informata të detajuara.
          </p>
          <p className="inline-block text-sm text-gray-300 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 max-w-xl mx-auto leading-relaxed">
            😮 Prishtina është bërë si Bangladesh… e di që e ki vështirë me gjet diçka të hajrit.{' '}
            <span className="text-rose-400 font-medium">Ne mundohemi të të ndihmojmë ta bësh zgjedhjen e duhur.</span>
          </p>
          <div className="mt-4">
            <ApiStatus />
          </div>
        </div>
      </section>

      {/* Unified search + filters bar */}
      <SearchFilters />

      {/* Full-width listings grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyGrid />
      </div>
    </div>
  );
}
