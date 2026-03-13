import type { ArquivoLicitacaoRepository } from "./arquivoLicitacaoRepository";
import type { ArquivoLicitacao } from "../../types/BuscaLicitacoes/ArquivoLicitacao";
import { licitaAiGet } from "./licitaAiApiClient";

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function mapArquivo(raw: unknown): ArquivoLicitacao | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const idRaw = obj.id;
  const id = typeof idRaw === "number" ? String(idRaw) : typeof idRaw === "string" ? idRaw : "";
  if (!id) return null;

  const urlDownload =
    typeof obj.urlDownload === "string" && obj.urlDownload.trim()
      ? obj.urlDownload
      : "#";

  const titulo =
    typeof obj.titulo === "string" && obj.titulo.trim()
      ? obj.titulo
      : typeof obj.tipoDocumento === "string" && obj.tipoDocumento.trim()
        ? obj.tipoDocumento
        : "Arquivo";

  return {
    id,
    titulo,
    url: urlDownload,
  };
}

export class LicitaAiArquivoLicitacaoRepository implements ArquivoLicitacaoRepository {
  async getByLicitacaoId(licitacaoId: string): Promise<ArquivoLicitacao[]> {
    const response = await licitaAiGet(`/api/licitacoes/${licitacaoId}/arquivos`);
    return toArray(response)
      .map(mapArquivo)
      .filter((item): item is ArquivoLicitacao => item !== null);
  }
}

