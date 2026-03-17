import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertTriangle, CalendarIcon, Search, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdvancedSearchDialog } from './AdvancedSearchDialog';
import { LicitacaoFilterData, defaultLicitacaoFilterData } from '../../models/LicitacaoFilterData';
import { Portal } from '../../types/BuscaLicitacoes/Portal';
import { usePortals } from '../hooks/usePortals';
import { useEstados } from '../hooks/useEstados';
import { useCidades } from '../hooks/useCidades';
import { useModalidades } from '../hooks/useModalidades';
import { Skeleton } from './ui/skeleton';

function FilterListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 py-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={`filter-skeleton-${index}`} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

function parseFilterJson(input: string): LicitacaoFilterData {
  const parsed = JSON.parse(input) as Partial<LicitacaoFilterData> & {
    OpeningDateStart?: string | Date;
    OpeningDateEnd?: string | Date;
  };

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

  const asDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value);
      return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    return undefined;
  };

  const allowedOpeningDateFilters = new Set<LicitacaoFilterData['OpeningDateFilter']>([
    'any',
    'today',
    'current-week',
    'current-month',
    'custom-period',
  ]);

  const openingDateFilter = allowedOpeningDateFilters.has(
    parsed.OpeningDateFilter as LicitacaoFilterData['OpeningDateFilter'],
  )
    ? (parsed.OpeningDateFilter as LicitacaoFilterData['OpeningDateFilter'])
    : 'any';

  const normalized: LicitacaoFilterData = {
    ...defaultLicitacaoFilterData,
    IncludeKeywords: asStringArray(parsed.IncludeKeywords),
    ExcludeKeywords: asStringArray(parsed.ExcludeKeywords),
    OpeningDateFilter: openingDateFilter,
    OpeningDateStart: asDate(parsed.OpeningDateStart),
    OpeningDateEnd: asDate(parsed.OpeningDateEnd),
    ModalityId: typeof parsed.ModalityId === 'string' ? parsed.ModalityId : '',
    StateCodes: asStringArray(parsed.StateCodes),
    CityIds: asStringArray(parsed.CityIds),
    GovernmentLevels: asStringArray(parsed.GovernmentLevels),
    Portals: Array.isArray(parsed.Portals)
      ? parsed.Portals
          .filter(
            (portal): portal is { id: string; nome: string } =>
              typeof portal === 'object' &&
              portal !== null &&
              typeof (portal as { id?: unknown }).id === 'string' &&
              typeof (portal as { nome?: unknown }).nome === 'string',
          )
          .map((portal) => ({ id: portal.id, nome: portal.nome }))
      : [],
  };

  if (normalized.OpeningDateFilter !== 'custom-period') {
    normalized.OpeningDateStart = undefined;
    normalized.OpeningDateEnd = undefined;
  }

  return normalized;
}

export function FilterSidebar({
  filterData: controlledFilterData,
  setFilterData: controlledSetFilterData,
  onSearch,
}: {
  filterData?: LicitacaoFilterData;
  setFilterData?: Dispatch<SetStateAction<LicitacaoFilterData>>;
  onSearch?: (nextFilterData?: LicitacaoFilterData) => void;
} = {}) {
  const { portals, isLoading: isPortaisLoading } = usePortals();
  const { estados, isLoading: isEstadosLoading } = useEstados();

  const [internalFilterData, setInternalFilterData] = useState<LicitacaoFilterData>({
    ...defaultLicitacaoFilterData,
    Portals: [],
  });

  const isControlled = Boolean(controlledFilterData && controlledSetFilterData);
  const filterData = controlledFilterData ?? internalFilterData;
  const setFilterData = controlledSetFilterData ?? setInternalFilterData;

  const { cidades, isLoading: isCidadesLoading } = useCidades(filterData.StateCodes);
  const { modalidades, isLoading: isModalidadesLoading } = useModalidades();

  // UI-only state
  const [portaisOpen, setPortaisOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoSearchQuery, setEstadoSearchQuery] = useState('');
  const [cidadeSearchQuery, setCidadeSearchQuery] = useState('');
  const [portalSearchQuery, setPortalSearchQuery] = useState('');
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedFilterJson, setPastedFilterJson] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

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

  const filteredPortais = useMemo(() => {
    const query = portalSearchQuery.trim().toLowerCase();
    if (!query) return portals;
    return portals.filter((portal) => portal.nome.toLowerCase().includes(query));
  }, [portals, portalSearchQuery]);

  const isAdvancedKeywordSearchActive =
    filterData.IncludeKeywords.length > 1 || filterData.ExcludeKeywords.length > 0;

  const isCustomOpeningDate = filterData.OpeningDateFilter === 'custom-period';

  useEffect(() => {
    if (isAdvancedKeywordSearchActive) return;
    const next = filterData.IncludeKeywords[0] ?? '';
    setSearchQuery(next);
  }, [filterData.IncludeKeywords, isAdvancedKeywordSearchActive]);

  // Helper to convert filter dates to DateRange for the calendar
  const dateRange: DateRange | undefined =
    isCustomOpeningDate && (filterData.OpeningDateStart || filterData.OpeningDateEnd)
      ? {
          from: filterData.OpeningDateStart,
          to: filterData.OpeningDateEnd,
        }
      : undefined;

  const togglePortal = (portal: Portal) => {
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

  const toggleGovernmentLevel = (value: string) => {
    setFilterData((prev) => {
      if (prev.GovernmentLevels.includes(value)) {
        return {
          ...prev,
          GovernmentLevels: prev.GovernmentLevels.filter((g) => g !== value),
        };
      }
      return {
        ...prev,
        GovernmentLevels: [...prev.GovernmentLevels, value],
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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilterData((prev) => ({
      ...prev,
      OpeningDateFilter: 'custom-period',
      OpeningDateStart: range?.from,
      OpeningDateEnd: range?.to,
    }));
  };

  useEffect(() => {
    if (portals.length === 0) return;
    if (isPortaisLoading) return;
    if (isControlled) return;
    setFilterData((prev) => {
      if (prev.Portals.length > 0) return prev;
      return {
        ...prev,
        Portals: portals,
      };
    });
  }, [portals, isPortaisLoading, isControlled, setFilterData]);

  useEffect(() => {
    if (isModalidadesLoading) return;
    setFilterData((prev) => {
      if (!prev.ModalityId) return prev;
      const exists = modalidades.some((m) => m.codigo === prev.ModalityId);
      if (exists) return prev;
      return { ...prev, ModalityId: '' };
    });
  }, [modalidades, isModalidadesLoading]);

  useEffect(() => {
    if (isCidadesLoading) return;
    setFilterData((prev) => {
      const availableCityIds = new Set(cidades.map((c) => c.id));
      const nextCityIds = prev.CityIds.filter((id) => availableCityIds.has(id));
      if (nextCityIds.length === prev.CityIds.length) return prev;
      return {
        ...prev,
        CityIds: nextCityIds,
      };
    });
  }, [cidades, isCidadesLoading]);

  useEffect(() => {
    if (hasSelectedStates) return;
    setCidadeSearchQuery('');
  }, [hasSelectedStates]);

  const handleHeroSearch = () => {
    if (isAdvancedKeywordSearchActive) {
      onSearch?.(filterData);
      return;
    }

    const trimmed = searchQuery.trim();
    const nextFilterData = {
      ...filterData,
      IncludeKeywords: trimmed ? [trimmed] : [],
    };
    setFilterData(nextFilterData);
    onSearch?.(nextFilterData);
  };

  const getFilterSnapshot = () => {
    if (isAdvancedKeywordSearchActive) return filterData;
    const trimmed = searchQuery.trim();
    return {
      ...filterData,
      IncludeKeywords: trimmed ? [trimmed] : [],
    };
  };

  const handleCopyFilter = async () => {
    const snapshot = getFilterSnapshot();
    const json = JSON.stringify(snapshot, null, 2);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
      } else {
        const fallback = document.createElement('textarea');
        fallback.value = json;
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.appendChild(fallback);
        fallback.focus();
        fallback.select();
        document.execCommand('copy');
        document.body.removeChild(fallback);
      }
      setCopyFeedback('Filtro copiado.');
    } catch {
      setCopyFeedback('Nao foi possivel copiar o filtro.');
    }

    setTimeout(() => setCopyFeedback(''), 2500);
  };

  const handleApplyPastedFilter = () => {
    try {
      const nextFilterData = parseFilterJson(pastedFilterJson);
      setFilterData(nextFilterData);
      onSearch?.(nextFilterData);
      setPasteError('');
      setPasteModalOpen(false);
    } catch {
      setPasteError('JSON invalido. Cole um filtro no formato correto.');
    }
  };

  return (
    <aside className="w-[280px] shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="space-y-6">
        {/* Hero Search Bar */}
        <div className="space-y-3">
          <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Buscar</Label>
          <div className="relative">
            {isAdvancedKeywordSearchActive ? (
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
            )}

            {isAdvancedKeywordSearchActive ? (
              <div className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Busca avançada ativa.
              </div>
            ) : (
              <input
                type="text"
                placeholder="Palavras-chave, CNPJ, órgão..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
              />
            )}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
            onClick={() => setAdvancedSearchOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            <span className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Busca Avançada
            </span>
          </Button>
          
          <Button
            className="w-full bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white cursor-pointer"
            onClick={handleHeroSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
              onClick={handleCopyFilter}
            >
              Copiar Filtro
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
              onClick={() => {
                setPastedFilterJson('');
                setPasteError('');
                setPasteModalOpen(true);
              }}
            >
              Colar Filtro
            </Button>
          </div>

          {copyFeedback ? (
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{copyFeedback}</p>
          ) : null}
        </div>

        <div className="border-t border-[#E6E8EC] dark:border-[#1F1F1F] pt-6"></div>

        {/* Data de abertura */}
        <div className="space-y-3">
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
                  className="w-full justify-start text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
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
                    <span className="text-[#9CA3AF] dark:text-[#6B7280]">Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-[#111111]" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Modalidade */}
        <div className="space-y-3">
          <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Modalidade</Label>
          <Select
            value={filterData.ModalityId || 'all'}
            onValueChange={(value) => {
              setFilterData((prev) => ({
                ...prev,
                ModalityId: value === 'all' ? '' : value,
              }));
            }}
          >
            <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
              <SelectValue
                placeholder={isModalidadesLoading ? 'Carregando modalidades...' : 'Selecione uma modalidade'}
              />
            </SelectTrigger>
            <SelectContent>
              {isModalidadesLoading ? (
                <div className="px-2 py-2">
                  <Skeleton className="h-4 w-44" />
                </div>
              ) : (
                <>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  {modalidades.map((m) => (
                    <SelectItem key={m.codigo} value={m.codigo}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div className="space-y-3">
          <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Estado</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
              >
                <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                  {isEstadosLoading
                    ? 'Carregando estados...'
                    : filterData.StateCodes.length === 0
                    ? 'Selecione os estados'
                    : estados.length > 0 && filterData.StateCodes.length === estados.length
                    ? 'Todos os estados'
                    : `${filterData.StateCodes.length} selecionado${filterData.StateCodes.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[280px] max-h-[48vh] overflow-hidden p-0 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
              align="start"
            >
              <div className="px-3 py-2 bg-white dark:bg-[#111111] border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
                <input
                  type="text"
                  placeholder="Filtrar estados..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                  value={estadoSearchQuery}
                  onChange={(e) => setEstadoSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[calc(48vh-56px)] overflow-y-auto px-3 py-2 space-y-3">
                {isEstadosLoading ? (
                  <FilterListSkeleton rows={6} />
                ) : (
                  filteredEstados.map((estado) => (
                    <div key={estado.codigo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sidebar-estado-${estado.codigo}`}
                        checked={filterData.StateCodes.includes(estado.codigo)}
                        onCheckedChange={() => toggleStateCode(estado.codigo)}
                      />
                      <label
                        htmlFor={`sidebar-estado-${estado.codigo}`}
                        className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {estado.nome}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Cidade */}
        <div className="space-y-3">
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
                    : isCidadesLoading
                    ? 'Carregando cidades...'
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
              className="w-[280px] max-h-[48vh] overflow-hidden p-0 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
              align="start"
            >
              <div className="px-3 py-2">
                {!hasSelectedStates ? (
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    Selecione pelo menos um estado para habilitar cidades.
                  </p>
                ) : (
                  <>
                    <div className="pb-2 border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
                      <input
                        type="text"
                        placeholder="Filtrar cidades..."
                        className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                        value={cidadeSearchQuery}
                        onChange={(e) => setCidadeSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[calc(48vh-74px)] overflow-y-auto pt-2 space-y-3">
                      {isCidadesLoading ? (
                        <FilterListSkeleton rows={6} />
                      ) : (
                        filteredCidades.map((cidade) => (
                          <div key={cidade.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sidebar-cidade-${cidade.id}`}
                              checked={filterData.CityIds.includes(cidade.id)}
                              onCheckedChange={() => toggleCityId(cidade.id)}
                            />
                            <label
                              htmlFor={`sidebar-cidade-${cidade.id}`}
                              className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {cidade.nome}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Esfera */}
        <div className="space-y-3">
          <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Esfera</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="municipal"
                checked={filterData.GovernmentLevels.includes('municipal')}
                onCheckedChange={() => toggleGovernmentLevel('municipal')}
              />
              <label
                htmlFor="municipal"
                className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Municipal
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="estadual"
                checked={filterData.GovernmentLevels.includes('estadual')}
                onCheckedChange={() => toggleGovernmentLevel('estadual')}
              />
              <label
                htmlFor="estadual"
                className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Estadual
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="federal"
                checked={filterData.GovernmentLevels.includes('federal')}
                onCheckedChange={() => toggleGovernmentLevel('federal')}
              />
              <label
                htmlFor="federal"
                className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Federal
              </label>
            </div>
          </div>
        </div>

        {/* Portais */}
        <div className="space-y-3">
          <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Portais</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
              >
                <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                  {isPortaisLoading
                    ? 'Carregando portais...'
                    : filterData.Portals.length === 0
                    ? 'Selecione os portais'
                    : filterData.Portals.length === portals.length
                    ? 'Todos os portais'
                    : `${filterData.Portals.length} selecionado${filterData.Portals.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[280px] max-h-[48vh] overflow-hidden p-0 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]" 
              align="start"
            >
              <div className="px-3 py-2 bg-white dark:bg-[#111111] border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
                <input
                  type="text"
                  placeholder="Filtrar portais..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                  value={portalSearchQuery}
                  onChange={(e) => setPortalSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[calc(48vh-56px)] overflow-y-auto px-3 py-2 space-y-3">
                {isPortaisLoading ? (
                  <FilterListSkeleton rows={5} />
                ) : (
                  filteredPortais.map((portal) => (
                    <div key={portal.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`portal-${portal.id}`}
                        checked={filterData.Portals.some((p) => p.id === portal.id)}
                        onCheckedChange={() => togglePortal(portal)}
                      />
                      <label
                        htmlFor={`portal-${portal.id}`}
                        className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {portal.nome}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Bottom Search Button */}
        <div className="border-t border-[#E6E8EC] dark:border-[#1F1F1F] pt-6">
          <Button
            className="w-full bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white cursor-pointer"
            onClick={handleHeroSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>

        <AdvancedSearchDialog
          open={advancedSearchOpen}
          onOpenChange={setAdvancedSearchOpen}
          idPrefix="sidebar"
          portais={portals}
          filterData={filterData}
          setFilterData={setFilterData}
          onSubmit={() => onSearch?.(filterData)}
        />

        <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
          <DialogContent className="sm:max-w-[640px] bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
            <DialogHeader>
              <DialogTitle>Colar Filtro</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="paste-filter-json" className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                Cole o JSON do filtro
              </Label>
              <textarea
                id="paste-filter-json"
                value={pastedFilterJson}
                onChange={(e) => setPastedFilterJson(e.target.value)}
                placeholder='{"IncludeKeywords":["transporte"],"...":"..."}'
                className="min-h-[220px] w-full rounded-md border border-[#E6E8EC] dark:border-[#1F1F1F] bg-white dark:bg-[#111111] px-3 py-2 text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A]"
              />
              {pasteError ? (
                <p className="text-xs text-[#DC2626] dark:text-[#F87171]">{pasteError}</p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setPasteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white cursor-pointer"
                onClick={handleApplyPastedFilter}
              >
                Aplicar Filtro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}


