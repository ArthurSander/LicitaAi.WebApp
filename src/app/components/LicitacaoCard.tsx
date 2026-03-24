import { ExternalLink, Bookmark, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { ModoDisputa } from '../../types/BuscaLicitacoes/ModoDisputa';

interface LicitacaoCardProps {
  title: string;
  organization: string;
  city: string;
  state: string;
  modality: string;
  linkDownloadEdital?: string;
  estimatedValue: string;
  openingDate?: string;
  closingDate?: string;
  proposalCountdownBadge?: string;
  proposalCountdownTone?: 'open-soon' | 'open-today' | 'close-soon' | 'close-today';
  publishDate: string;
  modoDisputa: ModoDisputa;
  onOpenDetails?: () => void;
}

export function LicitacaoCard({
  title,
  organization,
  city,
  state,
  modality,
  linkDownloadEdital,
  estimatedValue,
  openingDate,
  closingDate,
  proposalCountdownBadge,
  proposalCountdownTone,
  publishDate,
  modoDisputa,
  onOpenDetails,
}: LicitacaoCardProps) {
  const hasDownloadLink =
    typeof linkDownloadEdital === 'string' && linkDownloadEdital.trim().length > 0;
  const hasOpeningDate = typeof openingDate === 'string' && openingDate.trim().length > 0;
  const hasClosingDate = typeof closingDate === 'string' && closingDate.trim().length > 0;

  const modoDisputaConfig: Record<ModoDisputa, { label: string; color: string }> = {
    aberto: {
      label: 'Aberto',
      color:
        'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 rounded-full',
    },
    fechado: {
      label: 'Fechado',
      color:
        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full',
    },
    'aberto-fechado': {
      label: 'Aberto/Fechado',
      color:
        'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full',
    },
    'dispensa-com-disputa': {
      label: 'Dispensa com disputa',
      color:
        'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 rounded-full',
    },
    'nao-se-aplica': {
      label: 'Nao se aplica',
      color:
        'bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-full',
    },
    'fechado-aberto': {
      label: 'Fechado/Aberto',
      color:
        'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 rounded-full',
    },
  };

  const proposalCountdownToneClassMap: Record<
    NonNullable<LicitacaoCardProps['proposalCountdownTone']>,
    string
  > = {
    'open-soon':
      'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300 border-lime-300 dark:border-lime-700 rounded-full',
    'open-today':
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 rounded-full',
    'close-soon':
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 rounded-full',
    'close-today':
      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 rounded-full',
  };

  return (
    <div
      className="bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg p-6 hover:shadow-lg dark:hover:shadow-2xl hover:border-[#D1D5DB] dark:hover:border-[#2A2A2A] transition-all duration-200 group cursor-pointer"
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      onClick={() => onOpenDetails?.()}
      onKeyDown={(e) => {
        if (!onOpenDetails) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails();
        }
      }}
    >
      <div className="space-y-4">
        {/* Header with location and modo de disputa */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="flex-1 text-[#111827] dark:text-[#F7F8FA] font-medium leading-snug">
            {city}, {state}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="bg-[#EFF6FF] dark:bg-[#1E3A8A] text-[#2563EB] dark:text-[#93C5FD] border-[#BFDBFE] dark:border-[#1E3A8A] rounded-full"
            >
              {modality}
            </Badge>
            <Badge
              variant="outline"
              className={modoDisputaConfig[modoDisputa].color}
            >
              {modoDisputaConfig[modoDisputa].label}
            </Badge>
            {proposalCountdownBadge ? (
              <Badge
                variant="outline"
                className={
                  proposalCountdownTone
                    ? proposalCountdownToneClassMap[proposalCountdownTone]
                    : proposalCountdownToneClassMap['close-soon']
                }
              >
                {proposalCountdownBadge}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Organization */}
        <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{organization}</div>

        {/* Objeto da Licitacao section */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Objeto da Licitacao</div>
          <div className="text-sm text-[#111827] dark:text-[#F7F8FA]">{title}</div>
        </div>

        {/* Information section */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#E6E8EC] dark:border-[#1F1F1F]">
          <div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Valor estimado</div>
            <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{estimatedValue}</div>
          </div>
          {hasOpeningDate && (
            <div>
              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Abertura das propostas</div>
              <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{openingDate}</div>
            </div>
          )}
          {!hasOpeningDate && <div aria-hidden="true"></div>}
          {hasClosingDate && (
            <div>
              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Fechamento das propostas</div>
              <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{closingDate}</div>
            </div>
          )}
          {!hasClosingDate && <div aria-hidden="true"></div>}
          <div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Publicacao</div>
            <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{publishDate}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {hasDownloadLink && (
              <Button
                asChild
                variant="outline"
                className="border-[#E6E8EC] dark:border-[#1F1F1F] hover:text-[#111827] dark:hover:text-[#F7F8FA] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] hover:border-[#D1D5DB] dark:hover:border-[#2A2A2A] transition-colors text-[#111827] dark:text-[#F7F8FA]"
              >
                <a
                  href={linkDownloadEdital}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Edital
                </a>
              </Button>
            )}
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails?.();
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver detalhes
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#2563EB] dark:hover:text-[#93C5FD] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
