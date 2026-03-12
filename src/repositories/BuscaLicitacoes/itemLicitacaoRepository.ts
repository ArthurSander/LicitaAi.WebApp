import type { ItemLicitacao } from "../../types/BuscaLicitacoes/ItemLicitacao";

export interface ItemLicitacaoRepository {
  getByLicitacaoId(licitacaoId: string): Promise<ItemLicitacao[]>;
}
