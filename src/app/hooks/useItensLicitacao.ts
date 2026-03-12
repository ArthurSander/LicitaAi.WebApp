import { useEffect, useState } from "react";
import type { ItemLicitacao } from "../../types/BuscaLicitacoes/ItemLicitacao";
import { useItemLicitacaoRepository } from "../context/RepositoriesContext";

export function useItensLicitacao(params: {
  licitacaoId: string | undefined;
  enabled?: boolean;
}) {
  const itemRepo = useItemLicitacaoRepository();

  const [items, setItems] = useState<ItemLicitacao[]>([]);
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

        const result = await itemRepo.getByLicitacaoId(params.licitacaoId);

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
  }, [itemRepo, params.enabled, params.licitacaoId]);

  return { items, isLoading, error };
}
