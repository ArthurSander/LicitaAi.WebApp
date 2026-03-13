import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { OpportunityCard } from './OpportunityCard';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LicitacaoFilterData } from '../../models/LicitacaoFilterData';
import { defaultLicitacaoFilterData } from '../../models/LicitacaoFilterData';
import { useLicitacoes } from '../hooks/useLicitacoes';
import type { Dispatch, SetStateAction } from 'react';
import { useEstados } from '../hooks/useEstados';
import { useCidades } from '../hooks/useCidades';
import { useModalidades } from '../hooks/useModalidades';
import { OpportunityModal } from './OpportunityModal';
import type { Licitacao } from '../../types/BuscaLicitacoes/Licitacao';
import { Skeleton } from './ui/skeleton';

function formatBRL(value: number | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ResultsSection({
  filterData,
  setFilterData,
  searchFilterData,
  onSearch,
}: {
  filterData: LicitacaoFilterData;
  setFilterData: Dispatch<SetStateAction<LicitacaoFilterData>>;
  searchFilterData?: LicitacaoFilterData;
  onSearch?: (nextFilterData?: LicitacaoFilterData) => void;
}) {
  const [selectedLicitacao, setSelectedLicitacao] = useState<Licitacao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [orderBy, setOrderBy] = useState<'recent' | 'value-high' | 'value-low' | 'closing'>('recent');
  const effectiveSearchFilter = searchFilterData ?? filterData;
  const displayedFilterData = searchFilterData ?? filterData;

  const { estados } = useEstados();
  const { cidades } = useCidades(displayedFilterData.StateCodes);
  const { modalidades } = useModalidades();

  const { items, totalCount, isLoading } = useLicitacoes({
    filter: effectiveSearchFilter,
    page,
    pageSize,
    orderBy,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    setPage(1);
  }, [effectiveSearchFilter]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [orderBy]);

  const activeFilterBadges = useMemo(() => {
    const badges: Array<{ key: string; label: string; onRemove: () => void }> = [];

    // Include / exclude keywords
    for (const kw of displayedFilterData.IncludeKeywords) {
      const trimmed = kw.trim();
      if (!trimmed) continue;
      badges.push({
        key: `include:${trimmed}`,
        label: trimmed,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            IncludeKeywords: prev.IncludeKeywords.filter((k) => k !== kw),
          })),
      });
    }

    for (const kw of displayedFilterData.ExcludeKeywords) {
      const trimmed = kw.trim();
      if (!trimmed) continue;
      badges.push({
        key: `exclude:${trimmed}`,
        label: `-${trimmed}`,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            ExcludeKeywords: prev.ExcludeKeywords.filter((k) => k !== kw),
          })),
      });
    }

    // Portals
    for (const portal of displayedFilterData.Portals) {
      badges.push({
        key: `portal:${portal.id}`,
        label: portal.nome,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            Portals: prev.Portals.filter((p) => p.id !== portal.id),
          })),
      });
    }

    // Modalidade
    if (displayedFilterData.ModalityId) {
      const modLabel =
        modalidades.find((m) => m.codigo === displayedFilterData.ModalityId)?.nome ??
        displayedFilterData.ModalityId;
      badges.push({
        key: `modality:${displayedFilterData.ModalityId}`,
        label: modLabel,
        onRemove: () => setFilterData((prev) => ({ ...prev, ModalityId: '' })),
      });
    }

    // Estados
    for (const code of displayedFilterData.StateCodes) {
      const label = estados.find((e) => e.codigo === code)?.codigo ?? code;
      badges.push({
        key: `state:${code}`,
        label,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            StateCodes: prev.StateCodes.filter((c) => c !== code),
          })),
      });
    }

    // Cidades
    for (const cityId of displayedFilterData.CityIds) {
      const label = cidades.find((c) => c.id === cityId)?.nome ?? cityId;
      badges.push({
        key: `city:${cityId}`,
        label,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            CityIds: prev.CityIds.filter((id) => id !== cityId),
          })),
      });
    }

    // Governo
    for (const level of displayedFilterData.GovernmentLevels) {
      badges.push({
        key: `gov:${level}`,
        label: level,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            GovernmentLevels: prev.GovernmentLevels.filter((g) => g !== level),
          })),
      });
    }

    // Data de abertura
    if (displayedFilterData.OpeningDateFilter !== 'any') {
      const labelMap: Record<LicitacaoFilterData['OpeningDateFilter'], string> = {
        any: 'Qualquer data',
        today: 'Hoje',
        'current-week': 'Esta semana',
        'current-month': 'Este mês',
        'custom-period': 'Período personalizado',
      };

      const label =
        displayedFilterData.OpeningDateFilter === 'custom-period' &&
        (displayedFilterData.OpeningDateStart || displayedFilterData.OpeningDateEnd)
          ? `${displayedFilterData.OpeningDateStart ? format(displayedFilterData.OpeningDateStart, 'dd/MM/yyyy', { locale: ptBR }) : '...'} - ${displayedFilterData.OpeningDateEnd ? format(displayedFilterData.OpeningDateEnd, 'dd/MM/yyyy', { locale: ptBR }) : '...'}`
          : labelMap[displayedFilterData.OpeningDateFilter];

      badges.push({
        key: `opening:${displayedFilterData.OpeningDateFilter}:${displayedFilterData.OpeningDateStart?.toISOString() ?? ''}:${displayedFilterData.OpeningDateEnd?.toISOString() ?? ''}`,
        label,
        onRemove: () =>
          setFilterData((prev) => ({
            ...prev,
            OpeningDateFilter: 'any',
            OpeningDateStart: undefined,
            OpeningDateEnd: undefined,
          })),
      });
    }

    // If user has portals loaded but none selected, consider this "no filter".
    // Nothing else to do here.

    // Deduplicate by key (defensive)
    const seen = new Set<string>();
    return badges.filter((b) => {
      if (seen.has(b.key)) return false;
      seen.add(b.key);
      return true;
    });
  }, [
    cidades,
    estados,
    displayedFilterData,
    modalidades,
    setFilterData,
  ]);

  const renderLoadingCards = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`loading-card-${index}`}
          className="bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-64" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E6E8EC] dark:border-[#1F1F1F]">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleClearFilters = () => {
    const clearedFilterData: LicitacaoFilterData = {
      ...defaultLicitacaoFilterData,
      IncludeKeywords: [],
      ExcludeKeywords: [],
      Portals: [],
      StateCodes: [],
      CityIds: [],
      GovernmentLevels: [],
      ModalityId: '',
      OpeningDateStart: undefined,
      OpeningDateEnd: undefined,
    };

    if (onSearch) {
      onSearch(clearedFilterData);
      return;
    }

    setFilterData(clearedFilterData);
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Results header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#111827] dark:text-[#F7F8FA]">
            {isLoading
              ? 'Carregando oportunidades...'
              : `${totalCount.toLocaleString('pt-BR')} oportunidades encontradas`}
          </h2>
          <div className="flex items-center gap-3">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                const next = Number(value);
                if (!Number.isFinite(next)) return;
                setPageSize(next);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px] bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                <SelectValue placeholder="Itens por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
                <SelectItem value="100">100 por página</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orderBy} onValueChange={(value) => setOrderBy(value as typeof orderBy)}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="value-high">Maior valor</SelectItem>
                <SelectItem value="value-low">Menor valor</SelectItem>
                <SelectItem value="closing">Encerrando em breve</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        <div className="flex flex-wrap gap-2">
          {activeFilterBadges.map((badge) => (
            <Badge
              key={badge.key}
              variant="secondary"
              className="bg-[#EFF6FF] dark:bg-[#1E3A8A] text-[#2563EB] dark:text-[#93C5FD] border-[#BFDBFE] dark:border-[#1E3A8A] hover:bg-[#DBEAFE] dark:hover:bg-[#1E40AF] rounded-full px-3 py-1"
            >
              {badge.label}
              <button
                type="button"
                className="ml-2 hover:text-[#1D4ED8] dark:hover:text-[#60A5FA]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  badge.onRemove();
                }}
                aria-label={`Remover filtro ${badge.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-[#6B7280] hover:text-[#111827] h-7"
            onClick={handleClearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* Opportunity cards */}
      {isLoading ? (
        renderLoadingCards()
      ) : (
        <div className="space-y-4">
          {items.map((licitacao) => (
            <OpportunityCard
              key={licitacao.id}
              title={licitacao.objeto}
              organization={licitacao.orgao}
              city={licitacao.cidade.nome}
              state={licitacao.estado.codigo}
              modality={licitacao.modalidade.nome}
              linkDownloadEdital={licitacao.linkDownloadEdital}
              estimatedValue={formatBRL(licitacao.valorEstimado)}
              openingDate={format(licitacao.dataAberturaProposta, 'dd MMM yyyy', { locale: ptBR })}
              publishDate={format(licitacao.dataPublicacao, 'dd MMM yyyy', { locale: ptBR })}
              modoDisputa={licitacao.modoDisputa ?? 'aberto'}
              onOpenDetails={() => {
                setSelectedLicitacao(licitacao);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          Página {page} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Próxima
          </Button>
        </div>
      </div>

      {selectedLicitacao && (
        <OpportunityModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          licitacao={selectedLicitacao}
        />
      )}
    </div>
  );
}
