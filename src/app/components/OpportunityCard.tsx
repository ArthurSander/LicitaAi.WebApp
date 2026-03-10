import { ExternalLink, Bookmark, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface OpportunityCardProps {
  title: string;
  organization: string;
  city: string;
  state: string;
  modality: string;
  estimatedValue: string;
  openingDate: string;
  publishDate: string;
  status: 'open' | 'warning' | 'closed';
}

export function OpportunityCard({
  title,
  organization,
  city,
  state,
  modality,
  estimatedValue,
  openingDate,
  publishDate,
  status,
}: OpportunityCardProps) {
  const statusConfig = {
    open: { label: 'Aberta', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 rounded-full' },
    warning: { label: 'Encerrando', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full' },
    closed: { label: 'Fechada', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full' },
  };

  return (
    <div className="bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg p-6 hover:shadow-lg dark:hover:shadow-2xl hover:border-[#D1D5DB] dark:hover:border-[#2A2A2A] transition-all duration-200 group cursor-pointer">
      <div className="space-y-4">
        {/* Header with location and status */}
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
              className={`${statusConfig[status].color}`}
            >
              {statusConfig[status].label}
            </Badge>
          </div>
        </div>

        {/* Organization */}
        <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{organization}</div>

        {/* Objeto da Licitação section */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Objeto da Licitação</div>
          <div className="text-sm text-[#111827] dark:text-[#F7F8FA]">{title}</div>
        </div>

        {/* Information section */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E6E8EC] dark:border-[#1F1F1F]">
          <div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Valor estimado</div>
            <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{estimatedValue}</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Abertura das propostas</div>
            <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{openingDate}</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Publicação</div>
            <div className="text-sm text-[#111827] dark:text-[#F7F8FA] font-medium">{publishDate}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="border-[#E6E8EC] dark:border-[#1F1F1F] hover:text-[#111827] dark:hover:text-[#F7F8FA] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] hover:border-[#D1D5DB] dark:hover:border-[#2A2A2A] transition-colors text-[#111827] dark:text-[#F7F8FA]"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Edital
            </Button>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver detalhes
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#2563EB] dark:hover:text-[#93C5FD] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A] transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}