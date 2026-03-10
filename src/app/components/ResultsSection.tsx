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
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LicitacaoFilterData } from '../../models/LicitacaoFilterData';
import { defaultLicitacaoFilterData } from '../../models/LicitacaoFilterData';
import { useLicitacoes } from '../hooks/useLicitacoes';
import type { Dispatch, SetStateAction } from 'react';
import { useEstados } from '../hooks/useEstados';
import { useCidades } from '../hooks/useCidades';
import { useModalidades } from '../hooks/useModalidades';

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
}: {
  filterData: LicitacaoFilterData;
  setFilterData: Dispatch<SetStateAction<LicitacaoFilterData>>;
}) {
  const { estados } = useEstados();
  const { cidades } = useCidades(filterData.StateCodes);
  const { modalidades } = useModalidades();

  const { items, totalCount, isLoading } = useLicitacoes({
    filter: filterData,
    page: 1,
    pageSize: 20,
  });

  const activeFilterBadges = useMemo(() => {
    const badges: Array<{ key: string; label: string; onRemove: () => void }> = [];

    // Include / exclude keywords
    for (const kw of filterData.IncludeKeywords) {
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

    for (const kw of filterData.ExcludeKeywords) {
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
    for (const portal of filterData.Portals) {
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
    if (filterData.ModalityId) {
      const modLabel =
        modalidades.find((m) => m.nome === filterData.ModalityId)?.nome ??
        filterData.ModalityId;
      badges.push({
        key: `modality:${filterData.ModalityId}`,
        label: modLabel,
        onRemove: () => setFilterData((prev) => ({ ...prev, ModalityId: undefined })),
      });
    }

    // Estados
    for (const code of filterData.StateCodes) {
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
    for (const cityId of filterData.CityIds) {
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
    for (const level of filterData.GovernmentLevels) {
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
    if (filterData.OpeningDateFilter !== 'any') {
      const labelMap: Record<LicitacaoFilterData['OpeningDateFilter'], string> = {
        any: 'Qualquer data',
        today: 'Hoje',
        'current-week': 'Esta semana',
        'current-month': 'Este mês',
        'custom-period': 'Período personalizado',
      };

      const label =
        filterData.OpeningDateFilter === 'custom-period' &&
        (filterData.OpeningDateStart || filterData.OpeningDateEnd)
          ? `${filterData.OpeningDateStart ? format(filterData.OpeningDateStart, 'dd/MM/yyyy', { locale: ptBR }) : '...'} - ${filterData.OpeningDateEnd ? format(filterData.OpeningDateEnd, 'dd/MM/yyyy', { locale: ptBR }) : '...'}`
          : labelMap[filterData.OpeningDateFilter];

      badges.push({
        key: `opening:${filterData.OpeningDateFilter}:${filterData.OpeningDateStart?.toISOString() ?? ''}:${filterData.OpeningDateEnd?.toISOString() ?? ''}`,
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
    filterData,
    modalidades,
    setFilterData,
  ]);

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
          <Select defaultValue="recent">
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
            onClick={() => setFilterData(defaultLicitacaoFilterData)}
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* Opportunity cards */}
      <div className="space-y-4">
        {items.map((licitacao) => (
          <OpportunityCard
            key={licitacao.id}
            title={licitacao.objeto}
            organization={licitacao.orgao}
            city={licitacao.cidade.nome}
            state={licitacao.estado.codigo}
            modality={licitacao.modalidade.nome}
            estimatedValue={formatBRL(licitacao.valorEstimado)}
            openingDate={format(licitacao.dataAberturaProposta, 'dd MMM yyyy', { locale: ptBR })}
            publishDate={format(licitacao.dataPublicacao, 'dd MMM yyyy', { locale: ptBR })}
            status={licitacao.status ?? 'open'}
          />
        ))}
      </div>
    </div>
  );
}