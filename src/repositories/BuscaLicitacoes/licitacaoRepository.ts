// src/repositories/LicitacaoRepository.ts
import type { LicitacaoFilterData } from "../../models/LicitacaoFilterData"
import type { Licitacao } from "../../types/BuscaLicitacoes/Licitacao"

export type SearchLicitacoesParams = {
    filter: LicitacaoFilterData
    page: number
    pageSize: number
}

export type SearchLicitacoesResult = {
    items: Licitacao[]
    totalCount: number
}

export interface LicitacaoRepository {
    search(params: SearchLicitacoesParams): Promise<SearchLicitacoesResult>
}