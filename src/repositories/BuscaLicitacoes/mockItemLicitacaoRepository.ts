import type { ItemLicitacaoRepository } from "./itemLicitacaoRepository";
import type { ItemLicitacao } from "../../types/BuscaLicitacoes/ItemLicitacao";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildBaseItems(prefix: string): ItemLicitacao[] {
  const items = [
    {
      id: `${prefix}-1`,
      descricao: "Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD",
      quantidade: 20,
      valorUnitarioEstimado: 3500,
    },
    {
      id: `${prefix}-2`,
      descricao: "Monitor LED 24 polegadas, Full HD, HDMI",
      quantidade: 50,
      valorUnitarioEstimado: 850,
    },
    {
      id: `${prefix}-3`,
      descricao: "Teclado USB ABNT2, padrão ergonômico",
      quantidade: 50,
      valorUnitarioEstimado: 120,
    },
    {
      id: `${prefix}-4`,
      descricao: "Mouse óptico USB, 1000 DPI, com fio",
      quantidade: 50,
      valorUnitarioEstimado: 45,
    },
    {
      id: `${prefix}-5`,
      descricao: "Estabilizador 500VA, bivolt automático",
      quantidade: 20,
      valorUnitarioEstimado: 180,
    },
  ] satisfies Array<Omit<ItemLicitacao, "valorTotalEstimado">>;

  return items.map((i) => ({
    ...i,
    valorTotalEstimado:
      i.valorTotalEstimado ??
      (i.valorUnitarioEstimado != null ? i.valorUnitarioEstimado * i.quantidade : undefined),
  }));
}

const mockItensByLicitacaoId: Record<string, ItemLicitacao[]> = {
  "1": buildBaseItems("1"),
  "2": buildBaseItems("2"),
  "3": buildBaseItems("3"),
  "4": buildBaseItems("4"),
  "5": buildBaseItems("5"),
  "6": buildBaseItems("6"),
};

export class MockItemLicitacaoRepository implements ItemLicitacaoRepository {
  async getByLicitacaoId(licitacaoId: string): Promise<ItemLicitacao[]> {
    await sleep(250);
    return mockItensByLicitacaoId[licitacaoId] ?? [];
  }
}
