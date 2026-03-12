import type { ArquivoLicitacaoRepository } from "./arquivoLicitacaoRepository";
import type { ArquivoLicitacao } from "../../types/BuscaLicitacoes/ArquivoLicitacao";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildBaseFiles(prefix: string): ArquivoLicitacao[] {
  return [
    {
      id: `${prefix}-1`,
      titulo: `Edital Completo - ${prefix}`,
      url: "#",
    },
    {
      id: `${prefix}-2`,
      titulo: "Anexo I - Termo de Referência",
      url: "#",
    },
    {
      id: `${prefix}-3`,
      titulo: "Anexo II - Modelo de Proposta Comercial",
      url: "#",
    },
    {
      id: `${prefix}-4`,
      titulo: "Anexo III - Minuta do Contrato",
      url: "#",
    },
    {
      id: `${prefix}-5`,
      titulo: "Anexo IV - Declaração de Habilitação",
      url: "#",
    },
    {
      id: `${prefix}-6`,
      titulo: "Esclarecimentos e Respostas",
      url: "#",
    },
  ];
}

const mockArquivosByLicitacaoId: Record<string, ArquivoLicitacao[]> = {
  "1": buildBaseFiles("PE 023/2026"),
  "2": buildBaseFiles("PE 024/2026"),
  "3": buildBaseFiles("PE 025/2026"),
  "4": buildBaseFiles("CC 010/2026"),
  "5": buildBaseFiles("PE 026/2026"),
  "6": buildBaseFiles("PE 027/2026"),
};

export class MockArquivoLicitacaoRepository implements ArquivoLicitacaoRepository {
  async getByLicitacaoId(licitacaoId: string): Promise<ArquivoLicitacao[]> {
    await sleep(250);
    return mockArquivosByLicitacaoId[licitacaoId] ?? [];
  }
}
