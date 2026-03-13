import type { Estado } from "../../types/BuscaLicitacoes/Estado";
import type { EstadoRepository } from "./estadoRepository";
import { licitaAiGet } from "./licitaAiApiClient";

const ESTADOS_CACHE_KEY = "licitaai:estados:v1";
const ESTADOS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let inMemoryCache: { data: Estado[]; expiresAt: number } | null = null;
let inFlightRequest: Promise<Estado[]> | null = null;

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

function hasValidInMemoryCache(now: number): boolean {
  return Boolean(inMemoryCache && inMemoryCache.expiresAt > now);
}

function readLocalCache(now: number): Estado[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ESTADOS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { data?: unknown; expiresAt?: unknown };
    if (typeof parsed.expiresAt !== "number" || parsed.expiresAt <= now) {
      window.localStorage.removeItem(ESTADOS_CACHE_KEY);
      return null;
    }

    if (!Array.isArray(parsed.data)) return null;

    const data = parsed.data
      .map(mapEstado)
      .filter((item): item is Estado => item !== null);

    return data;
  } catch {
    return null;
  }
}

function writeCache(data: Estado[], now: number): void {
  const payload = {
    data,
    expiresAt: now + ESTADOS_CACHE_TTL_MS,
  };
  inMemoryCache = payload;

  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ESTADOS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write errors (quota/privacy mode).
  }
}

export class LicitaAiEstadoRepository implements EstadoRepository {
  async getAll(): Promise<Estado[]> {
    const now = Date.now();

    if (hasValidInMemoryCache(now)) {
      return [...(inMemoryCache?.data ?? [])];
    }

    const localCached = readLocalCache(now);
    if (localCached) {
      inMemoryCache = {
        data: localCached,
        expiresAt: now + ESTADOS_CACHE_TTL_MS,
      };
      return [...localCached];
    }

    if (inFlightRequest) {
      return inFlightRequest;
    }

    inFlightRequest = (async () => {
      const response = await licitaAiGet("/api/licitacoes/estados");
      const estados = toArray(response)
        .map(mapEstado)
        .filter((item): item is Estado => item !== null);

      writeCache(estados, Date.now());
      return estados;
    })();

    try {
      return await inFlightRequest;
    } finally {
      inFlightRequest = null;
    }
  }
}
