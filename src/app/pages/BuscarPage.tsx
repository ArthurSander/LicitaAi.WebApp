import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { AlertTriangle, Search, CalendarIcon, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { AdvancedSearchDialog } from '../components/AdvancedSearchDialog';
import { LicitacaoFilterData } from '../../models/LicitacaoFilterData';
import { Portal } from '../../types/BuscaLicitacoes/Portal';
import { usePortals } from '../hooks/usePortals';
import { useEstados } from '../hooks/useEstados';
import { useCidades } from '../hooks/useCidades';
import { useModalidades } from '../hooks/useModalidades';
import { useSearchFilters } from '../context/SearchFiltersContext';

export function BuscarPage() {
  const navigate = useNavigate();

  const { portals } = usePortals();
  const { estados } = useEstados();
  
  // Filter data model (shared across the app)
  const { filterData, setFilterData } = useSearchFilters();

  const { cidades } = useCidades(filterData.StateCodes);
  const { modalidades } = useModalidades();
  const [estadoSearchQuery, setEstadoSearchQuery] = useState('');
  const [cidadeSearchQuery, setCidadeSearchQuery] = useState('');
  const hasSelectedStates = filterData.StateCodes.length > 0;

  const filteredEstados = useMemo(() => {
    const query = estadoSearchQuery.trim().toLowerCase();
    if (!query) return estados;
    return estados.filter(
      (estado) =>
        estado.nome.toLowerCase().includes(query) ||
        estado.codigo.toLowerCase().includes(query),
    );
  }, [estados, estadoSearchQuery]);

  const filteredCidades = useMemo(() => {
    const query = cidadeSearchQuery.trim().toLowerCase();
    if (!query) return cidades;
    return cidades.filter((cidade) => cidade.nome.toLowerCase().includes(query));
  }, [cidades, cidadeSearchQuery]);
  
  // UI-only state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  const isAdvancedKeywordSearchActive =
    filterData.IncludeKeywords.length > 1 || filterData.ExcludeKeywords.length > 0;

  useEffect(() => {
    if (isAdvancedKeywordSearchActive) return;
    const next = filterData.IncludeKeywords[0] ?? '';
    setSearchQuery(next);
  }, [filterData.IncludeKeywords, isAdvancedKeywordSearchActive]);

  const isCustomOpeningDate = filterData.OpeningDateFilter === 'custom-period';

  // Helper to convert filter dates to DateRange for the calendar
  const dateRange: DateRange | undefined =
    isCustomOpeningDate && (filterData.OpeningDateStart || filterData.OpeningDateEnd)
      ? {
          from: filterData.OpeningDateStart,
          to: filterData.OpeningDateEnd,
        }
      : undefined;

  const handleSearch = () => {
    if (!isAdvancedKeywordSearchActive) {
      const trimmed = searchQuery.trim();
      setFilterData((prev) => {
        return {
          ...prev,
          IncludeKeywords: trimmed ? [trimmed] : [],
        };
      });
    }

    navigate('/resultados');
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  const handlePortalChange = (portal: Portal) => {
    setFilterData((prev) => {
      const alreadySelected = prev.Portals.some((p) => p.id === portal.id);
      return {
        ...prev,
        Portals: alreadySelected
          ? prev.Portals.filter((p) => p.id !== portal.id)
          : [...prev.Portals, portal],
      };
    });
  };

  const toggleStateCode = (codigo: string) => {
    setFilterData((prev) => {
      const alreadySelected = prev.StateCodes.includes(codigo);
      const nextStateCodes = alreadySelected
        ? prev.StateCodes.filter((c) => c !== codigo)
        : [...prev.StateCodes, codigo];

      return {
        ...prev,
        StateCodes: nextStateCodes,
      };
    });
  };

  const toggleCityId = (cidadeId: string) => {
    setFilterData((prev) => {
      const alreadySelected = prev.CityIds.includes(cidadeId);
      return {
        ...prev,
        CityIds: alreadySelected
          ? prev.CityIds.filter((id) => id !== cidadeId)
          : [...prev.CityIds, cidadeId],
      };
    });
  };

  useEffect(() => {
    setFilterData((prev) => {
      const availableCityIds = new Set(cidades.map((c) => c.id));
      const nextCityIds = prev.CityIds.filter((id) => availableCityIds.has(id));
      if (nextCityIds.length === prev.CityIds.length) return prev;
      return {
        ...prev,
        CityIds: nextCityIds,
      };
    });
  }, [cidades]);

  useEffect(() => {
    if (hasSelectedStates) return;
    setCidadeSearchQuery('');
  }, [hasSelectedStates]);

  useEffect(() => {
    setFilterData((prev) => {
      if (!prev.ModalityId) return prev;
      const exists = modalidades.some((m) => m.codigo === prev.ModalityId);
      if (exists) return prev;
      return { ...prev, ModalityId: '' };
    });
  }, [modalidades]);

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <Header />

      {/* Hero Section */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="pt-16 pb-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-[40px] font-semibold text-[#111827] dark:text-[#F7F8FA] mb-4 leading-tight">
              Encontre licitações
            </h1>
            <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF]">
              Busque e monitore licitações públicas de forma simples e eficiente
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-3xl mx-auto mb-3">
            <div className="relative">
              {isAdvancedKeywordSearchActive ? (
                <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D97706] dark:text-[#FBBF24]" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9CA3AF] dark:text-[#6B7280]" />
              )}
              {isAdvancedKeywordSearchActive ? (
                <div className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-[15px] text-[#6B7280] dark:text-[#9CA3AF]">
                  Busca avançada ativa.
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Buscar por palavras-chave, CNPJ, órgão..."
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-[15px] text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              )}
            </div>
          </div>

          {/* Advanced Search Link */}
          <div className="max-w-3xl mx-auto mb-8 flex justify-center">
            <button
              onClick={() => setAdvancedSearchOpen(true)}
              className="text-sm text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Busca Avançada
            </button>
          </div>

          {/* Filter Grid */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Data de Abertura */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Data de abertura</Label>
                <Select
                  value={filterData.OpeningDateFilter}
                  onValueChange={(value) => {
                    if (value === 'custom-period') {
                      setFilterData((prev) => ({
                        ...prev,
                        OpeningDateFilter: 'custom-period',
                      }));
                      return;
                    }

                    // Preset selected: persist the preset and clear any custom date range.
                    setFilterData((prev) => ({
                      ...prev,
                      OpeningDateFilter: value as LicitacaoFilterData['OpeningDateFilter'],
                      OpeningDateStart: undefined,
                      OpeningDateEnd: undefined,
                    }));
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer data</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="current-week">Esta semana</SelectItem>
                    <SelectItem value="current-month">Este mês</SelectItem>
                    <SelectItem value="custom-period">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomOpeningDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                      >
                        <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                                {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                            )
                          ) : (
                            'Selecione um período'
                          )}
                        </span>
                        <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[280px] p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                      align="start"
                    >
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setFilterData((prev) => ({
                            ...prev,
                            OpeningDateFilter: 'custom-period',
                            OpeningDateStart: range?.from,
                            OpeningDateEnd: range?.to,
                          }));
                        }}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Modalidade */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Modalidade</Label>
                <Select
                  value={filterData.ModalityId || undefined}
                  onValueChange={(value) => {
                    setFilterData({
                      ...filterData,
                      ModalityId: value,
                    });
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                    <SelectValue placeholder="Selecione uma modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map((m) => (
                      <SelectItem key={m.codigo} value={m.codigo}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Estado</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                    >
                      <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                        {filterData.StateCodes.length === 0
                          ? 'Selecione os estados'
                          : estados.length > 0 && filterData.StateCodes.length === estados.length
                          ? 'Todos os estados'
                          : `${filterData.StateCodes.length} selecionado${filterData.StateCodes.length > 1 ? 's' : ''}`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[280px] max-h-[48vh] overflow-y-auto p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                    align="start"
                  >
                    <div className="sticky top-0 z-20 -mx-3 px-3 py-2 bg-white dark:bg-[#111111] border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
                      <input
                        type="text"
                        placeholder="Filtrar estados..."
                        className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                        value={estadoSearchQuery}
                        onChange={(e) => setEstadoSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      {filteredEstados.map((estado) => (
                        <div key={estado.codigo} className="flex items-center space-x-2">
                          <Checkbox
                            id={`home-estado-${estado.codigo}`}
                            checked={filterData.StateCodes.includes(estado.codigo)}
                            onCheckedChange={() => toggleStateCode(estado.codigo)}
                          />
                          <label
                            htmlFor={`home-estado-${estado.codigo}`}
                            className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {estado.nome}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Cidade</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!hasSelectedStates}
                      className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                        {!hasSelectedStates
                          ? 'Selecione ao menos um estado'
                          : filterData.CityIds.length === 0
                          ? 'Selecione as cidades'
                          : cidades.length > 0 && filterData.CityIds.length === cidades.length
                          ? 'Todas as cidades'
                          : `${filterData.CityIds.length} selecionada${filterData.CityIds.length > 1 ? 's' : ''}`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[280px] max-h-[48vh] overflow-y-auto p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                    align="start"
                  >
                    <div className="space-y-3">
                      {!hasSelectedStates ? (
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          Selecione pelo menos um estado para habilitar cidades.
                        </p>
                      ) : (
                        <>
                          <div className="sticky top-0 z-20 -mx-3 px-3 py-2 bg-white dark:bg-[#111111] border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
                            <input
                              type="text"
                              placeholder="Filtrar cidades..."
                              className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                              value={cidadeSearchQuery}
                              onChange={(e) => setCidadeSearchQuery(e.target.value)}
                            />
                          </div>
                          {filteredCidades.map((cidade) => (
                            <div key={cidade.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`home-cidade-${cidade.id}`}
                                checked={filterData.CityIds.includes(cidade.id)}
                                onCheckedChange={() => toggleCityId(cidade.id)}
                              />
                              <label
                                htmlFor={`home-cidade-${cidade.id}`}
                                className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {cidade.nome}
                              </label>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-2.5 rounded-lg"
              >
                Buscar licitações
              </Button>
            </div>
          </div>

          {/* Advanced Search Dialog */}
          <AdvancedSearchDialog
            open={advancedSearchOpen}
            onOpenChange={setAdvancedSearchOpen}
            idPrefix="home"
            portais={portals}
            filterData={filterData}
            setFilterData={setFilterData}
            onSubmit={handleSearch}
          />
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Personalize sua busca com filtros adicionais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Portais</Label>
              <div className="space-y-1">
                {portals.map((portal) => (
                  <Checkbox
                    key={portal.id}
                    value={portal.id}
                    checked={filterData.Portals.some((p) => p.id === portal.id)}
                    onCheckedChange={() => handlePortalChange(portal)}
                  >
                    {portal.nome}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-2.5 rounded-lg"
              onClick={handleFilterClose}
            >
              Aplicar filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


