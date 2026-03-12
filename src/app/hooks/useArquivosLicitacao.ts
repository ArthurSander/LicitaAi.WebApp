import { useEffect, useState } from "react";
import type { ArquivoLicitacao } from "../../types/BuscaLicitacoes/ArquivoLicitacao";
import { useArquivoLicitacaoRepository } from "../context/RepositoriesContext";

export function useArquivosLicitacao(params: {
  licitacaoId: string | undefined;
  enabled?: boolean;
}) {
  const arquivoRepo = useArquivoLicitacaoRepository();

  const [items, setItems] = useState<ArquivoLicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!params.enabled || !params.licitacaoId) {
      setItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let canceled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await arquivoRepo.getByLicitacaoId(params.licitacaoId);

        if (!canceled) {
          setItems(result);
        }
      } catch (err) {
        if (!canceled) setError(err);
      } finally {
        if (!canceled) setIsLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [arquivoRepo, params.enabled, params.licitacaoId]);

  return { items, isLoading, error };
}
