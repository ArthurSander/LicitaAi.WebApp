import type { EstadoRepository } from "./estadoRepository";
import type { Estado } from "../../types/BuscaLicitacoes/Estado";

const mockEstados: Estado[] = [
    {
        codigo: "RJ",
        nome: "Rio de Janeiro",
    },
    {
        codigo: "SP",
        nome: "São Paulo",
    },
    {
        codigo: "MG",
        nome: "Minas Gerais",
    },
];

export class MockEstadoRepository implements EstadoRepository {

    async getAll(): Promise<Estado[]> {
        // simula latência de API
        await new Promise(resolve => setTimeout(resolve, 300));

        return mockEstados;
    }

}
