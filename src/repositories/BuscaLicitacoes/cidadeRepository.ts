import { Cidade } from "../../types/BuscaLicitacoes/Cidade";

export interface CidadeRepository {
    getAll(codigoEstados: string[]): Promise<Cidade[]>
}
