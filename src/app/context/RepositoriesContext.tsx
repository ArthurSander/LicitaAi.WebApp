import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { PortalRepository } from "../../repositories/BuscaLicitacoes/portalRepository";
import { LicitaAiPortalRepository } from "../../repositories/BuscaLicitacoes/licitaAiPortalRepository";
import type { EstadoRepository } from "../../repositories/BuscaLicitacoes/estadoRepository";
import { LicitaAiEstadoRepository } from "../../repositories/BuscaLicitacoes/licitaAiEstadoRepository";
import type { CidadeRepository } from "../../repositories/BuscaLicitacoes/cidadeRepository";
import { LicitaAiCidadeRepository } from "../../repositories/BuscaLicitacoes/licitaAiCidadeRepository";
import type { ModalidadeRepository } from "../../repositories/BuscaLicitacoes/modalidadeRepository";
import { LocalModalidadeRepository } from "../../repositories/BuscaLicitacoes/localModalidadeRepository";
import type { LicitacaoRepository } from "../../repositories/BuscaLicitacoes/licitacaoRepository";
import { LicitaAiLicitacaoRepository } from "../../repositories/BuscaLicitacoes/licitaAiLicitacaoRepository";
import type { ItemLicitacaoRepository } from "../../repositories/BuscaLicitacoes/itemLicitacaoRepository";
import { LicitaAiItemLicitacaoRepository } from "../../repositories/BuscaLicitacoes/licitaAiItemLicitacaoRepository";
import type { ArquivoLicitacaoRepository } from "../../repositories/BuscaLicitacoes/arquivoLicitacaoRepository";
import { LicitaAiArquivoLicitacaoRepository } from "../../repositories/BuscaLicitacoes/licitaAiArquivoLicitacaoRepository";
import type { AuthRepository } from "../../repositories/Auth/authRepository";
import { SupabaseAuthRepository } from "../../repositories/Auth/supabaseAuthRepository";

export type Repositories = {
  portalRepository: PortalRepository;
  estadoRepository: EstadoRepository;
  cidadeRepository: CidadeRepository;
  modalidadeRepository: ModalidadeRepository;
  licitacaoRepository: LicitacaoRepository;
  itemLicitacaoRepository: ItemLicitacaoRepository;
  arquivoLicitacaoRepository: ArquivoLicitacaoRepository;
  authRepository: AuthRepository;
};

const RepositoriesContext = createContext<Repositories | null>(null);

export function RepositoriesProvider({
  children,
  repositories: repositoriesOverride,
}: {
  children: ReactNode;
  repositories?: Partial<Repositories>;
}) {
  const repositories = useMemo<Repositories>(() => {
    return {
      portalRepository: repositoriesOverride?.portalRepository ?? new LicitaAiPortalRepository(),
      estadoRepository: repositoriesOverride?.estadoRepository ?? new LicitaAiEstadoRepository(),
      cidadeRepository:
        repositoriesOverride?.cidadeRepository ??
        new LicitaAiCidadeRepository(),
      modalidadeRepository:
        repositoriesOverride?.modalidadeRepository ??
        new LocalModalidadeRepository(),
      licitacaoRepository:
        repositoriesOverride?.licitacaoRepository ??
        new LicitaAiLicitacaoRepository(),
      itemLicitacaoRepository:
        repositoriesOverride?.itemLicitacaoRepository ??
        new LicitaAiItemLicitacaoRepository(),
      arquivoLicitacaoRepository:
        repositoriesOverride?.arquivoLicitacaoRepository ??
        new LicitaAiArquivoLicitacaoRepository(),
      authRepository:
        repositoriesOverride?.authRepository ??
        new SupabaseAuthRepository(),
    };
  }, [repositoriesOverride]);

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoriesContext);
  if (!repositories) {
    throw new Error("useRepositories must be used within RepositoriesProvider");
  }
  return repositories;
}

export function usePortalRepository(): PortalRepository {
  return useRepositories().portalRepository;
}

export function useEstadoRepository(): EstadoRepository {
  return useRepositories().estadoRepository;
}

export function useCidadeRepository(): CidadeRepository {
  return useRepositories().cidadeRepository;
}

export function useModalidadeRepository(): ModalidadeRepository {
  return useRepositories().modalidadeRepository;
}

export function useLicitacaoRepository(): LicitacaoRepository {
  return useRepositories().licitacaoRepository;
}

export function useItemLicitacaoRepository(): ItemLicitacaoRepository {
  return useRepositories().itemLicitacaoRepository;
}

export function useArquivoLicitacaoRepository(): ArquivoLicitacaoRepository {
  return useRepositories().arquivoLicitacaoRepository;
}

export function useAuthRepository(): AuthRepository {
  return useRepositories().authRepository;
}
