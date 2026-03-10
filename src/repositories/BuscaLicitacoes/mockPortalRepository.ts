import type { PortalRepository } from "./portalRepository"
import type { Portal } from "../../types/BuscaLicitacoes/Portal"

const mockPortals: Portal[] = [
    {
        id: "1",
        nome: "Portal A"
    },
    {
        id: "2",
        nome: "Portal BNC"
    },
    {
        id: "3",
        nome: "Portal IBGE"
    },
    {
        id: "4",
        nome: "Portal Geral Compras BR"
    }
]

export class MockPortalRepository implements PortalRepository {

    async getAll(): Promise<Portal[]> {
        // simula latência de API
        await new Promise(resolve => setTimeout(resolve, 300))

        return mockPortals
    }

}