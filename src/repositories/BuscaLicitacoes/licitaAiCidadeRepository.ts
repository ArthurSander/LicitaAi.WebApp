import type { Cidade } from "../../types/BuscaLicitacoes/Cidade";
import type { CidadeRepository } from "./cidadeRepository";
import { licitaAiGet } from "./licitaAiApiClient";

type EstadoMap = {
  byCodigo: Map<string, string>;
  byId: Map<string, string>;
};

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    for (const key of ["data", "items", "results", "municipios", "estados"]) {
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

function mapEstadoMaps(rawEstados: unknown): EstadoMap {
  const byCodigo = new Map<string, string>();
  const byId = new Map<string, string>();

  for (const raw of toArray(rawEstados)) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const id = pickString(obj, ["id", "idEstado", "estadoId"]);
    const codigo = pickString(obj, ["codigo", "sigla", "uf", "codigoUf", "estadoCodigo"]);
    if (!id || !codigo) continue;
    byCodigo.set(codigo, id);
    byId.set(id, codigo);
  }

  return { byCodigo, byId };
}

function mapCidade(raw: unknown, estadoById: Map<string, string>): Cidade | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = pickString(obj, ["id", "idMunicipio", "municipioId"]);
  const nome = pickString(obj, ["nome", "descricao", "municipioNome", "name"]);
  const codigoEstadoFromPayload = pickString(
    obj,
    ["codigoEstado", "estadoCodigo", "uf", "siglaEstado"],
  );
  const estadoId = pickString(obj, ["idEstado", "estadoId"]);
  const codigoEstado = codigoEstadoFromPayload ?? (estadoId ? estadoById.get(estadoId) : undefined);

  if (!id || !nome || !codigoEstado) return null;
  return { id, nome, codigoEstado };
}

export class LicitaAiCidadeRepository implements CidadeRepository {
  async getAll(codigoEstados: string[]): Promise<Cidade[]> {
    if (codigoEstados.length === 0) return [];

    const estadosResponse = await licitaAiGet("/api/licitacoes/estados");
    const estadoMaps = mapEstadoMaps(estadosResponse);

    // Accept both selected UF codes and pre-existing IDs in the input array.
    const idEstados = Array.from(
      new Set(
        codigoEstados
          .map((codigoOuId) => estadoMaps.byCodigo.get(codigoOuId) ?? codigoOuId)
          .filter(Boolean),
      ),
    );

    if (idEstados.length === 0) return [];

    const municipiosResponse = await licitaAiGet(
      `/api/licitacoes/municipios?idEstados=${idEstados.join(",")}`,
    );

    return toArray(municipiosResponse)
      .map((raw) => mapCidade(raw, estadoMaps.byId))
      .filter((item): item is Cidade => item !== null);
  }
}
