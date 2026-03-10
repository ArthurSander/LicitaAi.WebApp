import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LicitacaoFilterData } from "../../models/LicitacaoFilterData";
import { defaultLicitacaoFilterData } from "../../models/LicitacaoFilterData";

export type SearchFiltersContextValue = {
  filterData: LicitacaoFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<LicitacaoFilterData>>;
};

const SearchFiltersContext = createContext<SearchFiltersContextValue | null>(null);

export function SearchFiltersProvider({ children }: { children: ReactNode }) {
  const [filterData, setFilterData] = useState<LicitacaoFilterData>(
    defaultLicitacaoFilterData,
  );

  const value = useMemo<SearchFiltersContextValue>(() => {
    return { filterData, setFilterData };
  }, [filterData]);

  return (
    <SearchFiltersContext.Provider value={value}>
      {children}
    </SearchFiltersContext.Provider>
  );
}

export function useSearchFilters(): SearchFiltersContextValue {
  const ctx = useContext(SearchFiltersContext);
  if (!ctx) {
    throw new Error("useSearchFilters must be used within SearchFiltersProvider");
  }
  return ctx;
}
