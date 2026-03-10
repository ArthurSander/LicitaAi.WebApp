import type {
  LicitacaoRepository,
  SearchLicitacoesParams,
  SearchLicitacoesResult,
} from "./licitacaoRepository";
import type { Licitacao } from "../../types/BuscaLicitacoes/Licitacao";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const diffToMonday = (day + 6) % 7; // Mon -> 0, Sun -> 6
  date.setDate(date.getDate() - diffToMonday);
  return date;
}

function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

const mockLicitacoes: Licitacao[] = [
  {
    id: "1",
    objeto: "Aquisição de equipamentos de informática para unidades administrativas",
    orgao: "Prefeitura Municipal de Contagem",
    cidade: { id: "MG-3", nome: "Contagem", codigoEstado: "MG" },
    estado: { codigo: "MG", nome: "Minas Gerais" },
    modalidade: { codigo: "pregao-eletronico", nome: "Pregão Eletrônico" },
    valorEstimado: 245_000,
    dataAberturaProposta: new Date(2026, 2, 18),
    dataPublicacao: new Date(2026, 2, 6),
    status: "open",
    portal: { id: "1", nome: "Portal A" },
    linkDownloadEdital: "#",
    linkSiteEdital: "#",
  },
  {
    id: "2",
    objeto: "Contratação de serviços de manutenção predial",
    orgao: "Secretaria de Estado de Saúde",
    cidade: { id: "MG-1", nome: "Belo Horizonte", codigoEstado: "MG" },
    estado: { codigo: "MG", nome: "Minas Gerais" },
    modalidade: { codigo: "pregao-eletronico", nome: "Pregão Eletrônico" },
    valorEstimado: 520_000,
    dataAberturaProposta: new Date(2026, 2, 10),
    dataPublicacao: new Date(2026, 2, 3),
    status: "warning",
    portal: { id: "2", nome: "Portal BNC" },
    linkDownloadEdital: "#",
    linkSiteEdital: "#",
  },
  {
    id: "3",
    objeto: "Fornecimento de material de limpeza e higiene",
    orgao: "Hospital Municipal São José",
    cidade: { id: "MG-4", nome: "Betim", codigoEstado: "MG" },
    estado: { codigo: "MG", nome: "Minas Gerais" },
    modalidade: { codigo: "pregao-eletronico", nome: "Pregão Eletrônico" },
    valorEstimado: 89_500,
    dataAberturaProposta: new Date(2026, 2, 22),
    dataPublicacao: new Date(2026, 2, 6),
    status: "open",
    portal: { id: "3", nome: "Portal IBGE" },
    linkDownloadEdital: "#",
    linkSiteEdital: "#",
  },
  {
    id: "4",
    objeto: "Aquisição de mobiliário escolar para unidades de ensino",
    orgao: "Secretaria Municipal de Educação",
    cidade: { id: "MG-3", nome: "Contagem", codigoEstado: "MG" },
    estado: { codigo: "MG", nome: "Minas Gerais" },
    modalidade: { codigo: "concorrencia", nome: "Concorrência" },
    valorEstimado: 680_000,
    dataAberturaProposta: new Date(2026, 2, 25),
    dataPublicacao: new Date(2026, 2, 5),
    status: "open",
    portal: { id: "4", nome: "Portal Geral Compras BR" },
    linkDownloadEdital: "#",
    linkSiteEdital: "#",
  },
  {
    id: "5",
    objeto: "Serviços de desenvolvimento de sistema de gestão integrada",
    orgao: "Prefeitura Municipal de Nova Lima",
    cidade: { id: "MG-5", nome: "Nova Lima", codigoEstado: "MG" },
    estado: { codigo: "MG", nome: "Minas Gerais" },
    modalidade: { codigo: "pregao-eletronico", nome: "Pregão Eletrônico" },
    valorEstimado: 1_200_000,
    dataAberturaProposta: new Date(2026, 2, 15),
    dataPublicacao: new Date(2026, 2, 1),
    status: "warning",
    portal: { id: "1", nome: "Portal A" },
    linkDownloadEdital: "#",
    linkSiteEdital: "#",
  },
  {
    id: "6",
    objeto: "Fornecimento de uniformes e EPIs para equipes de limpeza urbana",
    orgao: "Serviço de Limpeza Urbana",
    cidade: { id: "MG-1", nome: "Belo Horizonte", codigoEstado: "MG" },
    estado: { codigo: "MG", nome: "Minas Gerais" },
    modalidade: { codigo: "pregao-eletronico", nome: "Pregão Eletrônico" },
    valorEstimado: 145_000,
    dataAberturaProposta: new Date(2026, 2, 20),
    dataPublicacao: new Date(2026, 2, 4),
    status: "open",
    portal: { id: "2", nome: "Portal BNC" },
    linkDownloadEdital: "#",
    linkSiteEdital: "#",
  },
];

export class MockLicitacaoRepository implements LicitacaoRepository {
  async search(params: SearchLicitacoesParams): Promise<SearchLicitacoesResult> {
    await sleep(300);

    const { filter, page, pageSize } = params;
    const now = new Date();

    let results = [...mockLicitacoes];

    // Keywords
    if (filter.IncludeKeywords.length > 0) {
      const include = filter.IncludeKeywords.map(normalizeText).filter(Boolean);
      results = results.filter((l) => {
        const haystack = normalizeText(`${l.objeto} ${l.orgao}`);
        return include.some((kw) => haystack.includes(kw));
      });
    }

    if (filter.ExcludeKeywords.length > 0) {
      const exclude = filter.ExcludeKeywords.map(normalizeText).filter(Boolean);
      results = results.filter((l) => {
        const haystack = normalizeText(`${l.objeto} ${l.orgao}`);
        return !exclude.some((kw) => haystack.includes(kw));
      });
    }

    // Portals
    if (filter.Portals.length > 0) {
      const portalIds = new Set(filter.Portals.map((p) => p.id));
      results = results.filter((l) => portalIds.has(l.portal.id));
    }

    // States / Cities
    if (filter.StateCodes.length > 0) {
      const stateCodes = new Set(filter.StateCodes);
      results = results.filter((l) => stateCodes.has(l.estado.codigo));
    }

    if (filter.CityIds.length > 0) {
      const cityIds = new Set(filter.CityIds);
      results = results.filter((l) => cityIds.has(l.cidade.id));
    }

    // Modalidade
    if (filter.ModalityId) {
      const modality = normalizeText(filter.ModalityId);
      results = results.filter((l) => {
        return (
          normalizeText(l.modalidade.nome) === modality ||
          normalizeText(l.modalidade.codigo) === modality
        );
      });
    }

    // Opening date filters
    switch (filter.OpeningDateFilter) {
      case "today":
        results = results.filter((l) => isSameLocalDay(l.dataAberturaProposta, now));
        break;
      case "current-week": {
        const start = startOfWeekMonday(now);
        const end = endOfWeekSunday(now);
        results = results.filter(
          (l) => l.dataAberturaProposta >= start && l.dataAberturaProposta <= end,
        );
        break;
      }
      case "current-month":
        results = results.filter(
          (l) =>
            l.dataAberturaProposta.getFullYear() === now.getFullYear() &&
            l.dataAberturaProposta.getMonth() === now.getMonth(),
        );
        break;
      case "custom-period": {
        const start = filter.OpeningDateStart;
        const end = filter.OpeningDateEnd;
        results = results.filter((l) => {
          if (start && l.dataAberturaProposta < start) return false;
          if (end && l.dataAberturaProposta > end) return false;
          return true;
        });
        break;
      }
      case "any":
      default:
        break;
    }

    const totalCount = results.length;

    // Pagination (treat page as 1-based)
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;

    const startIndex = (safePage - 1) * safePageSize;
    const endIndex = startIndex + safePageSize;

    return {
      items: results.slice(startIndex, endIndex),
      totalCount,
    };
  }
}
