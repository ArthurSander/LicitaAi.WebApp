import type { ArquivoLicitacao } from "../../types/BuscaLicitacoes/ArquivoLicitacao";

export interface ArquivoLicitacaoRepository {
  getByLicitacaoId(licitacaoId: string): Promise<ArquivoLicitacao[]>;
}
