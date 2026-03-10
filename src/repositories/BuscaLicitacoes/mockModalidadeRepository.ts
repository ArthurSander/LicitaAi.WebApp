import { Modalidade } from "../../types/BuscaLicitacoes/Modalidade";
import type { ModalidadeRepository } from "./modalidadeRepository";


const MODALIDADE_OPTIONS: Modalidade[] = [
  { codigo: "pregao-eletronico", nome: "Pregão Eletrônico" },
  { codigo: "pregao-presencial", nome: "Pregão Presencial" },
  { codigo: "dispensa", nome: "Dispensa" }
];

export class MockModalidadeRepository implements ModalidadeRepository {
  async getAll(): Promise<Modalidade[]> {
    // simula latência de API
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...MODALIDADE_OPTIONS];
  }
}
