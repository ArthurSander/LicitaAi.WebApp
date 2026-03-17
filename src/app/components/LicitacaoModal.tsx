import { X, Download, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useMemo, useState } from 'react';
import type { Licitacao } from '../../types/BuscaLicitacoes/Licitacao';
import { useItensLicitacao } from '../hooks/useItensLicitacao';
import { useArquivosLicitacao } from '../hooks/useArquivosLicitacao';
import { Skeleton } from './ui/skeleton';

interface LicitacaoModalProps {
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

export function LicitacaoModal({ open, onClose, licitacao }: LicitacaoModalProps) {
  const [itemFilterText, setItemFilterText] = useState('');
  const [arquivoFilterText, setArquivoFilterText] = useState('');

  const { items: itens, isLoading: isLoadingItens } = useItensLicitacao({
    licitacaoId: licitacao.id,
    enabled: open,
  });

  const { items: arquivos, isLoading: isLoadingArquivos } = useArquivosLicitacao({
    licitacaoId: licitacao.id,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setItemFilterText('');
    setArquivoFilterText('');
  }, [open, licitacao.id]);

  const filteredItens = useMemo(() => {
    const query = itemFilterText.trim().toLowerCase();
    if (!query) return itens;
    return itens.filter((item) => item.descricao.toLowerCase().includes(query));
  }, [itens, itemFilterText]);

  const filteredArquivos = useMemo(() => {
    const query = arquivoFilterText.trim().toLowerCase();
    if (!query) return arquivos;
    return arquivos.filter((file) => file.titulo.toLowerCase().includes(query));
  }, [arquivos, arquivoFilterText]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg w-[92vw] max-w-[920px] h-[78vh] max-h-[78vh] overflow-hidden z-50 flex flex-col">
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
          <Tabs.Root defaultValue="itens" className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
            <Tabs.Content value="itens" className="flex-1 min-h-0 overflow-y-auto p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
                <input
                  type="text"
                  value={itemFilterText}
                  onChange={(e) => setItemFilterText(e.target.value)}
                  placeholder="Filtrar itens por texto..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              {isLoadingItens ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`loading-item-${index}`}
                      className="bg-[#F7F8FA] dark:bg-[#1F1F1F] border border-[#E6E8EC] dark:border-[#2A2A2A] rounded-lg p-4"
                    >
                      <Skeleton className="h-5 w-28 mb-3" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-14" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItens.length === 0 ? (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Nenhum item encontrado para o filtro informado.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredItens.map((item) => (
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
            <Tabs.Content value="arquivos" className="flex-1 min-h-0 overflow-y-auto p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
                <input
                  type="text"
                  value={arquivoFilterText}
                  onChange={(e) => setArquivoFilterText(e.target.value)}
                  placeholder="Filtrar arquivos por texto..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-sm text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              {isLoadingArquivos ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={`loading-file-${index}`}
                      className="bg-[#F7F8FA] dark:bg-[#1F1F1F] border border-[#E6E8EC] dark:border-[#2A2A2A] rounded-lg p-4 flex items-center justify-between"
                    >
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredArquivos.length === 0 ? (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Nenhum arquivo encontrado para o filtro informado.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredArquivos.map((file) => (
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
