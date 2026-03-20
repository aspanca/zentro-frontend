import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import PropertyGrid from '@/components/PropertyGrid';

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Gjeni pronën tuaj<br />
            <span className="text-rose-400">në Kosovë</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Qindra prona në shitje — banesa, shtëpi dhe truall — në të gjitha qytetet e Kosovës.
          </p>
          <SearchBar />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <Filters />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <PropertyGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
