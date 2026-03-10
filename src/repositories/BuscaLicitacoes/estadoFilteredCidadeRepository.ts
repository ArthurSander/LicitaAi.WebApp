import type { CidadeRepository } from "./cidadeRepository";
import type { Cidade } from "../../types/BuscaLicitacoes/Cidade";

/**
 * Decorator repository that filters cidades by the selected estados.
 * Useful when the underlying repository can't (or shouldn't) implement filtering.
 */
export class EstadoFilteredCidadeRepository implements CidadeRepository {
  constructor(private readonly inner: CidadeRepository) {}

  async getAll(codigoEstados?: string[]): Promise<Cidade[]> {
    const all = await this.inner.getAll();

    if (!codigoEstados || codigoEstados.length === 0) {
      return all;
    }

    return all.filter((c) => codigoEstados.includes(c.codigoEstado));
  }
}
