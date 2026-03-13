import { Cidade } from "./Cidade"
import { Modalidade } from "./Modalidade"
import { Estado } from "./Estado"
import { Portal } from "./Portal"
import { ModoDisputa } from "./ModoDisputa"

export type Licitacao = {
    id: string
    objeto: string
    orgao: string
    modalidade: Modalidade
    estado: Estado
    cidade: Cidade
    dataPublicacao: Date
    dataAberturaProposta?: Date
    portal: Portal
    valorEstimado?: number
    modoDisputa?: ModoDisputa
    linkDownloadEdital: string
    linkSiteEdital: string
}
