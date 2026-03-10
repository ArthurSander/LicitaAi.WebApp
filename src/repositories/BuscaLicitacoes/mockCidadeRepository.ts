import type { CidadeRepository } from "./cidadeRepository";
import type { Cidade } from "../../types/BuscaLicitacoes/Cidade";

const mockCidades: Cidade[] = [
    // RJ
    { id: "RJ-1", nome: "Rio de Janeiro", codigoEstado: "RJ" },
    { id: "RJ-2", nome: "Niterói", codigoEstado: "RJ" },
    { id: "RJ-3", nome: "Duque de Caxias", codigoEstado: "RJ" },

    // SP
    { id: "SP-1", nome: "São Paulo", codigoEstado: "SP" },
    { id: "SP-2", nome: "Campinas", codigoEstado: "SP" },
    { id: "SP-3", nome: "Santos", codigoEstado: "SP" },

    // MG
    { id: "MG-1", nome: "Belo Horizonte", codigoEstado: "MG" },
    { id: "MG-2", nome: "Uberlândia", codigoEstado: "MG" },
    { id: "MG-3", nome: "Contagem", codigoEstado: "MG" },
    { id: "MG-4", nome: "Betim", codigoEstado: "MG" },
    { id: "MG-5", nome: "Nova Lima", codigoEstado: "MG" },
];

export class MockCidadeRepository implements CidadeRepository {

    async getAll(codigoEstados?: string[]): Promise<Cidade[]> {
        // simula latência de API
        await new Promise(resolve => setTimeout(resolve, 300));

        // Base mock returns all records; use EstadoFilteredCidadeRepository
        // if you want filtering by selected estados.
        return mockCidades;
    }

}
