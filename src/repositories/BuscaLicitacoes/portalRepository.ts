import { Portal } from "../../types/BuscaLicitacoes/Portal";

export interface PortalRepository {
    getAll(): Promise<Portal[]>
}