import { Header } from '../components/Header';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { OpportunityCard } from '../components/OpportunityCard';
import { X, Bookmark } from 'lucide-react';

const mockSavedOpportunities = [
  {
    id: 1,
    title: 'Aquisição de equipamentos de informática para unidades administrativas',
    organization: 'Prefeitura Municipal de Contagem',
    city: 'Contagem',
    state: 'MG',
    modality: 'Pregão Eletrônico',
    estimatedValue: 'R$ 245.000,00',
    openingDate: '18 mar 2026',
    publishDate: '06 mar 2026',
    status: 'open' as const,
  },
  {
    id: 3,
    title: 'Fornecimento de material de limpeza e higiene',
    organization: 'Hospital Municipal São José',
    city: 'Betim',
    state: 'MG',
    modality: 'Pregão Eletrônico',
    estimatedValue: 'R$ 89.500,00',
    openingDate: '22 mar 2026',
    publishDate: '06 mar 2026',
    status: 'open' as const,
  },
  {
    id: 5,
    title: 'Serviços de desenvolvimento de sistema de gestão integrada',
    organization: 'Prefeitura Municipal de Nova Lima',
    city: 'Nova Lima',
    state: 'MG',
    modality: 'Pregão Eletrônico',
    estimatedValue: 'R$ 1.200.000,00',
    openingDate: '15 mar 2026',
    publishDate: '01 mar 2026',
    status: 'warning' as const,
  },
];

export function SavedOpportunitiesPage() {
  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-6 h-6 text-[#2563EB] dark:text-[#93C5FD]" />
              <h1 className="text-2xl font-semibold text-[#111827] dark:text-[#F7F8FA]">
                Licitações Salvas
              </h1>
            </div>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Acompanhe as licitações que você marcou como favoritas
            </p>
          </div>

          {/* Results header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#111827] dark:text-[#F7F8FA]">
                {mockSavedOpportunities.length} oportunidade{mockSavedOpportunities.length !== 1 ? 's' : ''} salva{mockSavedOpportunities.length !== 1 ? 's' : ''}
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
                  <SelectItem value="saved">Ordem de salvamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Opportunity cards */}
          {mockSavedOpportunities.length > 0 ? (
            <div className="space-y-4">
              {mockSavedOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} {...opportunity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-[#9CA3AF] dark:text-[#6B7280] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#111827] dark:text-[#F7F8FA] mb-2">
                Nenhuma licitação salva
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Comece a salvar licitações para acompanhá-las mais facilmente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
