import type { Portal } from "../../types/BuscaLicitacoes/Portal";
import type { PortalRepository } from "./portalRepository";
import { licitaAiGet } from "./licitaAiApiClient";

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    for (const key of ["data", "items", "results", "portais"]) {
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

function mapPortal(raw: unknown): Portal | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = pickString(obj, ["id", "idPortal", "portalId"]);
  const nome = pickString(obj, ["nome", "descricao", "portalNome", "name"]);

  if (!id || !nome) return null;
  return { id, nome };
}

export class LicitaAiPortalRepository implements PortalRepository {
  async getAll(): Promise<Portal[]> {
    const response = await licitaAiGet("/api/licitacoes/portais");
    return toArray(response)
      .map(mapPortal)
      .filter((item): item is Portal => item !== null);
  }
}

