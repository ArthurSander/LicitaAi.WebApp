import type { ModalidadeOption } from "../../types/BuscaLicitacoes/Modalidade";

export interface ModalidadeRepository {
  getAll(): Promise<ModalidadeOption[]>;
}
