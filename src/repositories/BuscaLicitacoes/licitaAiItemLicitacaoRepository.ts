import type { ItemLicitacaoRepository } from "./itemLicitacaoRepository";
import type { ItemLicitacao } from "../../types/BuscaLicitacoes/ItemLicitacao";
import { licitaAiGet } from "./licitaAiApiClient";

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumberOrFallback(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return fallback;
}

function mapItem(raw: unknown): ItemLicitacao | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = String(toNumberOrFallback(obj.id, NaN));
  if (!id || id === "NaN") return null;

  return {
    id,
    descricao:
      typeof obj.descricao === "string" && obj.descricao.trim()
        ? obj.descricao
        : "Descrição não informada",
    quantidade: toNumberOrFallback(obj.quantidade, 0),
    valorUnitarioEstimado:
      typeof obj.valorUnitarioEstimado === "number"
        ? obj.valorUnitarioEstimado
        : undefined,
    valorTotalEstimado:
      typeof obj.valorTotal === "number"
        ? obj.valorTotal
        : undefined,
  };
}

export class LicitaAiItemLicitacaoRepository implements ItemLicitacaoRepository {
  async getByLicitacaoId(licitacaoId: string): Promise<ItemLicitacao[]> {
    const response = await licitaAiGet(`/api/licitacoes/${licitacaoId}/itens`);
    return toArray(response)
      .map(mapItem)
      .filter((item): item is ItemLicitacao => item !== null);
  }
}

