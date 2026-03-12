import { X, Download } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import type { Licitacao } from '../../types/BuscaLicitacoes/Licitacao';
import { useItensLicitacao } from '../hooks/useItensLicitacao';
import { useArquivosLicitacao } from '../hooks/useArquivosLicitacao';

interface OpportunityModalProps {
  open: boolean;
  onClose: () => void;
  licitacao: Licitacao;
}

function formatBRL(value: number | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value);
}

export function OpportunityModal({ open, onClose, licitacao }: OpportunityModalProps) {
  const { items: itens, isLoading: isLoadingItens } = useItensLicitacao({
    licitacaoId: licitacao.id,
    enabled: open,
  });

  const { items: arquivos, isLoading: isLoadingArquivos } = useArquivosLicitacao({
    licitacaoId: licitacao.id,
    enabled: open,
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#E6E8EC] dark:border-[#1F1F1F]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Dialog.Title className="text-xl font-medium text-[#111827] dark:text-[#F7F8FA] mb-2">
                  {licitacao.cidade.nome}, {licitacao.estado.codigo}
                </Dialog.Title>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{licitacao.orgao}</p>
              </div>
              <Dialog.Close asChild>
                <button className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F7F8FA] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Objeto</p>
              <p className="text-sm text-[#111827] dark:text-[#D1D5DB]">{licitacao.objeto}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs.Root defaultValue="itens" className="flex-1 flex flex-col overflow-hidden">
            <Tabs.List className="flex border-b border-[#E6E8EC] dark:border-[#1F1F1F] px-6">
              <Tabs.Trigger
                value="itens"
                className="px-4 py-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] border-b-2 border-transparent data-[state=active]:text-[#111827] dark:data-[state=active]:text-[#F7F8FA] data-[state=active]:border-[#2563EB] transition-colors"
              >
                Itens
              </Tabs.Trigger>
              <Tabs.Trigger
                value="arquivos"
                className="px-4 py-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] border-b-2 border-transparent data-[state=active]:text-[#111827] dark:data-[state=active]:text-[#F7F8FA] data-[state=active]:border-[#2563EB] transition-colors"
              >
                Arquivos
              </Tabs.Trigger>
            </Tabs.List>

            {/* Itens Tab */}
            <Tabs.Content value="itens" className="flex-1 overflow-y-auto p-6">
              {isLoadingItens ? (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Carregando itens...</p>
              ) : itens.length === 0 ? (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Nenhum item encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#F7F8FA] dark:bg-[#1F1F1F] border border-[#E6E8EC] dark:border-[#2A2A2A] rounded-lg p-4 hover:border-[#D1D5DB] dark:hover:border-[#3A3A3A] transition-colors"
                    >
                      <p className="text-sm text-[#111827] dark:text-[#D1D5DB] mb-3">{item.descricao}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Quantidade</p>
                          <p className="text-sm font-medium text-[#111827] dark:text-[#F7F8FA]">{item.quantidade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Valor Unitário Estimado</p>
                          <p className="text-sm font-medium text-[#111827] dark:text-[#F7F8FA]">
                            {formatBRL(item.valorUnitarioEstimado)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Valor Total</p>
                          <p className="text-sm font-medium text-[#111827] dark:text-[#F7F8FA]">
                            {formatBRL(item.valorTotalEstimado)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Content>

            {/* Arquivos Tab */}
            <Tabs.Content value="arquivos" className="flex-1 overflow-y-auto p-6">
              {isLoadingArquivos ? (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Carregando arquivos...</p>
              ) : arquivos.length === 0 ? (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Nenhum arquivo encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {arquivos.map((file) => (
                    <div
                      key={file.id}
                      className="bg-[#F7F8FA] dark:bg-[#1F1F1F] border border-[#E6E8EC] dark:border-[#2A2A2A] rounded-lg p-4 flex items-center justify-between hover:border-[#D1D5DB] dark:hover:border-[#3A3A3A] transition-colors"
                    >
                      <p className="text-sm text-[#111827] dark:text-[#D1D5DB]">{file.titulo}</p>
                      <a
                        href={file.url}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md text-sm text-white flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Baixar
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}