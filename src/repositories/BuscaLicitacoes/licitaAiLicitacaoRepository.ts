import type {
  LicitacaoRepository,
  SearchLicitacoesParams,
  SearchLicitacoesResult,
} from "./licitacaoRepository";
import type { Licitacao } from "../../types/BuscaLicitacoes/Licitacao";
import { licitaAiPost } from "./licitaAiApiClient";
import type { LicitacaoFilterData } from "../../models/LicitacaoFilterData";
import type { ModoDisputa } from "../../types/BuscaLicitacoes/ModoDisputa";
import { getModalidadeNomeByCodigo } from "../../types/BuscaLicitacoes/Modalidade";

const openingDateFilterMap: Record<LicitacaoFilterData["OpeningDateFilter"], number> = {
  any: 0,
  today: 1,
  "current-week": 2,
  "current-month": 3,
  "custom-period": 4,
};

const orderByMap: Record<
  NonNullable<SearchLicitacoesParams["orderBy"]>,
  "mais-recentes" | "maior-valor" | "menor-valor" | "proxima-ao-encerramento"
> = {
  recent: "mais-recentes",
  "value-high": "maior-valor",
  "value-low": "menor-valor",
  closing: "proxima-ao-encerramento",
};

function toIsoOrNull(value: Date | undefined): string | null {
  return value ? value.toISOString() : null;
}

function mapModoDisputa(value: unknown): ModoDisputa {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;

  if (Number.isFinite(numeric)) {
    switch (numeric) {
      case 1:
        return "aberto";
      case 2:
        return "fechado";
      case 3:
        return "aberto-fechado";
      case 4:
        return "dispensa-com-disputa";
      case 5:
        return "nao-se-aplica";
      case 6:
        return "fechado-aberto";
      default:
        break;
    }
  }

  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (text.includes("dispensa")) return "dispensa-com-disputa";
  if (text.includes("não se aplica") || text.includes("nao se aplica")) return "nao-se-aplica";
  if (text.includes("fechado") && text.includes("aberto")) {
    return text.startsWith("fechado") ? "fechado-aberto" : "aberto-fechado";
  }
  if (text.includes("fechado")) return "fechado";
  return "aberto";
}

function toDateOrEpoch(value: unknown): Date {
  if (typeof value !== "string") return new Date(0);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }
  return undefined;
}

function toStringOrFallback(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function toIntOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function mapSearchItem(raw: unknown): Licitacao | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = toStringOrFallback(obj.id, "");
  if (!id) return null;

  const estadoCodigo = toStringOrFallback(obj.estadoCodigo, "N/A");
  const estadoNome = toStringOrFallback(obj.estadoNome, estadoCodigo);
  const idEstado = toStringOrFallback(obj.idEstado, estadoCodigo);
  const idMunicipio = toStringOrFallback(obj.idMunicipio, "");

  const codigoModalidade = toStringOrFallback(obj.codigoModalidade, "");

  return {
    id,
    objeto: toStringOrFallback(obj.objeto, "Objeto não informado"),
    orgao: toStringOrFallback(obj.nomeOrgao, "Órgão não informado"),
    modalidade: {
      codigo: codigoModalidade || "0",
      nome: getModalidadeNomeByCodigo(codigoModalidade),
    },
    estado: {
      id: idEstado,
      codigo: estadoCodigo,
      nome: estadoNome,
    },
    cidade: {
      id: idMunicipio || `${id}-municipio`,
      nome: toStringOrFallback(obj.municipioNome, "Município não informado"),
      codigoEstado: estadoCodigo,
    },
    dataPublicacao: toDateOrEpoch(obj.dataPublicacaoOrigem),
    dataAberturaProposta: toDateOrEpoch(obj.dataAberturaProposta),
    portal: {
      id: "nao-informado",
      nome: "Não informado",
    },
    valorEstimado: toNumberOrUndefined(obj.valorTotalEstimado),
    modoDisputa: mapModoDisputa(obj.codigoModoDisputa),
    linkDownloadEdital: toStringOrFallback(obj.urlDownloadEdital, "#"),
    linkSiteEdital: toStringOrFallback(obj.urlDownloadEdital, "#"),
  };
}

export class LicitaAiLicitacaoRepository implements LicitacaoRepository {
  async search(params: SearchLicitacoesParams): Promise<SearchLicitacoesResult> {
    const orderBy = params.orderBy ?? "recent";

    const response = await licitaAiPost("/api/licitacoes/search", {
      filter: {
        includeKeywords: params.filter.IncludeKeywords,
        excludeKeywords: params.filter.ExcludeKeywords,
        openingDateFilter: openingDateFilterMap[params.filter.OpeningDateFilter],
        openingDateStart: toIsoOrNull(params.filter.OpeningDateStart),
        openingDateEnd: toIsoOrNull(params.filter.OpeningDateEnd),
        modalityId: toIntOrNull(params.filter.ModalityId),
        orderBy: orderByMap[orderBy],
        stateCodes: params.filter.StateCodes,
        cityIds: params.filter.CityIds,
        governmentLevels: params.filter.GovernmentLevels,
        portals: params.filter.Portals.map((portal) => ({
          id: portal.id,
          nome: portal.nome,
        })),
      },
      page: {
        pageNumber: params.page,
        pageSize: params.pageSize,
      },
    });

    const payload =
      response && typeof response === "object"
        ? (response as Record<string, unknown>)
        : {};

    const itemsRaw = Array.isArray(payload.items) ? payload.items : [];
    const items = itemsRaw
      .map(mapSearchItem)
      .filter((item): item is Licitacao => item !== null);

    const totalCount =
      typeof payload.totalCount === "number" ? payload.totalCount : items.length;

    return {
      items,
      totalCount,
    };
  }
}
