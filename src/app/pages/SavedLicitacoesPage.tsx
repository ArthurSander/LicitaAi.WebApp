import { Header } from '../components/Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { LicitacaoCard } from '../components/LicitacaoCard';
import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import type { Licitacao } from '../../types/BuscaLicitacoes/Licitacao';
import { LicitacaoModal } from '../components/LicitacaoModal';

const mockSavedLicitacoes = [
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
    modoDisputa: 'aberto' as const,
    linkDownloadEdital: '#',
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
    modoDisputa: 'aberto' as const,
    linkDownloadEdital: '#',
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
    modoDisputa: 'aberto-fechado' as const,
    linkDownloadEdital: '#',
  },
];

export function SavedLicitacoesPage() {
  const [selectedLicitacao, setSelectedLicitacao] = useState<Licitacao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                {mockSavedLicitacoes.length}{' '}
                {mockSavedLicitacoes.length === 1 ? 'licita��o salva' : 'licita��es salvas'}
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

          {/* Licitacao cards */}
          {mockSavedLicitacoes.length > 0 ? (
            <div className="space-y-4">
              {mockSavedLicitacoes.map((licitacaoSalva) => (
                <LicitacaoCard
                  key={licitacaoSalva.id}
                  {...licitacaoSalva}
                  onOpenDetails={() => {
                    const licitacao: Licitacao = {
                      id: String(licitacaoSalva.id),
                      objeto: licitacaoSalva.title,
                      orgao: licitacaoSalva.organization,
                      cidade: {
                        id: `${licitacaoSalva.state}-${licitacaoSalva.city}`,
                        nome: licitacaoSalva.city,
                        codigoEstado: licitacaoSalva.state,
                      },
                      estado: { codigo: licitacaoSalva.state, nome: licitacaoSalva.state },
                      modalidade: {
                        codigo: licitacaoSalva.modality.toLowerCase().replace(/\s+/g, '-'),
                        nome: licitacaoSalva.modality,
                      },
                      dataPublicacao: new Date(2026, 2, 1),
                      dataAberturaProposta: new Date(2026, 2, 15),
                      portal: { id: 'saved', nome: 'Salvas' },
                      valorEstimado: undefined,
                      modoDisputa: licitacaoSalva.modoDisputa,
                      linkDownloadEdital: '#',
                      linkSiteEdital: '#',
                    };

                    setSelectedLicitacao(licitacao);
                    setIsModalOpen(true);
                  }}
                />
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

          {selectedLicitacao && (
            <LicitacaoModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              licitacao={selectedLicitacao}
            />
          )}
        </div>
      </div>
    </div>
  );
}

