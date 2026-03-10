import { Portal } from "../types/BuscaLicitacoes/Portal";

export type LicitacaoFilterData = {
  IncludeKeywords: string[];
  ExcludeKeywords: string[];

  OpeningDateFilter: "any" | "today" | "current-week" | "current-month" | "custom-period";

  OpeningDateStart?: Date;
  OpeningDateEnd?: Date;

  ModalityId?: string;
  StateCodes: string[];
  CityIds: string[];
  GovernmentLevels: string[];

  Portals: Portal[];
};

export const defaultLicitacaoFilterData: LicitacaoFilterData = {
  IncludeKeywords: [],
  ExcludeKeywords: [],
  OpeningDateFilter: "any",
  Portals: [],
  StateCodes: [],
  CityIds: [],
  GovernmentLevels: [],
};