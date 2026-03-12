import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { PortalRepository } from "../../repositories/BuscaLicitacoes/portalRepository";
import { MockPortalRepository } from "../../repositories/BuscaLicitacoes/mockPortalRepository";
import type { EstadoRepository } from "../../repositories/BuscaLicitacoes/estadoRepository";
import { MockEstadoRepository } from "../../repositories/BuscaLicitacoes/mockEstadoRepository";
import type { CidadeRepository } from "../../repositories/BuscaLicitacoes/cidadeRepository";
import { MockCidadeRepository } from "../../repositories/BuscaLicitacoes/mockCidadeRepository";
import { EstadoFilteredCidadeRepository } from "../../repositories/BuscaLicitacoes/estadoFilteredCidadeRepository";
import type { ModalidadeRepository } from "../../repositories/BuscaLicitacoes/modalidadeRepository";
import { MockModalidadeRepository } from "../../repositories/BuscaLicitacoes/mockModalidadeRepository";
import type { LicitacaoRepository } from "../../repositories/BuscaLicitacoes/licitacaoRepository";
import { MockLicitacaoRepository } from "../../repositories/BuscaLicitacoes/mockLicitacaoRepository";
import type { ItemLicitacaoRepository } from "../../repositories/BuscaLicitacoes/itemLicitacaoRepository";
import { MockItemLicitacaoRepository } from "../../repositories/BuscaLicitacoes/mockItemLicitacaoRepository";
import type { ArquivoLicitacaoRepository } from "../../repositories/BuscaLicitacoes/arquivoLicitacaoRepository";
import { MockArquivoLicitacaoRepository } from "../../repositories/BuscaLicitacoes/mockArquivoLicitacaoRepository";
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
      portalRepository: repositoriesOverride?.portalRepository ?? new MockPortalRepository(),
      estadoRepository: repositoriesOverride?.estadoRepository ?? new MockEstadoRepository(),
      cidadeRepository:
        repositoriesOverride?.cidadeRepository ??
        new EstadoFilteredCidadeRepository(new MockCidadeRepository()),
      modalidadeRepository:
        repositoriesOverride?.modalidadeRepository ??
        new MockModalidadeRepository(),
      licitacaoRepository:
        repositoriesOverride?.licitacaoRepository ??
        new MockLicitacaoRepository(),
      itemLicitacaoRepository:
        repositoriesOverride?.itemLicitacaoRepository ??
        new MockItemLicitacaoRepository(),
      arquivoLicitacaoRepository:
        repositoriesOverride?.arquivoLicitacaoRepository ??
        new MockArquivoLicitacaoRepository(),
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
