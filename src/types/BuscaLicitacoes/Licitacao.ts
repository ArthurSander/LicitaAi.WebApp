import { Cidade } from "./Cidade"
import { Modalidade } from "./Modalidade"
import { Estado } from "./Estado"
import { Portal } from "./Portal"

export type Licitacao = {
    id: string
    objeto: string
    orgao: string
    modalidade: Modalidade
    estado: Estado
    cidade: Cidade
    dataPublicacao: Date
    dataAberturaProposta: Date
    portal: Portal
    valorEstimado?: number
    status?: "open" | "warning" | "closed"
    linkDownloadEdital: string
    linkSiteEdital: string
}