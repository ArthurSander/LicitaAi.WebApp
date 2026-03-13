import type { Estado } from "../../types/BuscaLicitacoes/Estado";
import type { EstadoRepository } from "./estadoRepository";
import { licitaAiGet } from "./licitaAiApiClient";

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    for (const key of ["data", "items", "results", "estados"]) {
      const candidate = asRecord[key];
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [];
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function mapEstado(raw: unknown): Estado | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = pickString(obj, ["id", "idEstado", "estadoId"]);
  const codigo = pickString(obj, ["codigo", "sigla", "uf", "codigoUf", "estadoCodigo", "id"]);
  const nome = pickString(obj, ["nome", "descricao", "estadoNome", "name"]);

  if (!codigo || !nome) return null;
  return {
    id: id ?? codigo,
    codigo,
    nome,
  };
}

export class LicitaAiEstadoRepository implements EstadoRepository {
  async getAll(): Promise<Estado[]> {
    const response = await licitaAiGet("/api/licitacoes/estados");
    return toArray(response)
      .map(mapEstado)
      .filter((item): item is Estado => item !== null);
  }
}

