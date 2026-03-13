import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { FilterSidebar } from '../components/FilterSidebar';
import { ResultsSection } from '../components/ResultsSection';
import { useSearchFilters } from '../context/SearchFiltersContext';
import type { LicitacaoFilterData } from '../../models/LicitacaoFilterData';

export function ResultsPage() {
  const { filterData, setFilterData } = useSearchFilters();
  const [draftFilterData, setDraftFilterData] = useState(filterData);
  const [appliedFilterData, setAppliedFilterData] = useState(filterData);

  useEffect(() => {
    setDraftFilterData(filterData);
    setAppliedFilterData(filterData);
  }, [filterData]);

  const applySearch = (nextFilterData?: LicitacaoFilterData) => {
    const next = nextFilterData ?? draftFilterData;
    setDraftFilterData(next);
    setAppliedFilterData(next);
    setFilterData(next);
  };

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          {/* Left - Filter Sidebar */}
          <FilterSidebar
            filterData={draftFilterData}
            setFilterData={setDraftFilterData}
            onSearch={applySearch}
          />

          {/* Right - Results */}
          <ResultsSection
            filterData={draftFilterData}
            setFilterData={setDraftFilterData}
            searchFilterData={appliedFilterData}
            onSearch={applySearch}
          />
        </div>
      </div>
    </div>
  );
}
