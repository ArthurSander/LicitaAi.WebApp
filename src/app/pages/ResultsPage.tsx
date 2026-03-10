import { Header } from '../components/Header';
import { FilterSidebar } from '../components/FilterSidebar';
import { ResultsSection } from '../components/ResultsSection';
import { useSearchFilters } from '../context/SearchFiltersContext';

export function ResultsPage() {
  const { filterData, setFilterData } = useSearchFilters();

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          {/* Left - Filter Sidebar */}
          <FilterSidebar filterData={filterData} setFilterData={setFilterData} />

          {/* Right - Results */}
          <ResultsSection filterData={filterData} setFilterData={setFilterData} />
        </div>
      </div>
    </div>
  );
}