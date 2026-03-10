import { Estado } from "../../types/BuscaLicitacoes/Estado";

export interface EstadoRepository {
    getAll(): Promise<Estado[]>
}
