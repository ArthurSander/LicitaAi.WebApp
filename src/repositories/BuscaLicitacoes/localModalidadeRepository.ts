import { MODALIDADE_OPTIONS, type Modalidade } from "../../types/BuscaLicitacoes/Modalidade";
import type { ModalidadeRepository } from "./modalidadeRepository";

export class LocalModalidadeRepository implements ModalidadeRepository {
  async getAll(): Promise<Modalidade[]> {
    return [...MODALIDADE_OPTIONS];
  }
}

