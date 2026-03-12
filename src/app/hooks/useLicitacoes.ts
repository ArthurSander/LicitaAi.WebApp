import { useEffect, useState } from "react";
import type { LicitacaoFilterData } from "../../models/LicitacaoFilterData";
import type { Licitacao } from "../../types/BuscaLicitacoes/Licitacao";
import { useLicitacaoRepository } from "../context/RepositoriesContext";

export function useLicitacoes(params: {
  filter: LicitacaoFilterData;
  page: number;
  pageSize: number;
  orderBy?: "recent" | "value-high" | "value-low" | "closing";
}) {
  const licitacaoRepository = useLicitacaoRepository();

  const [items, setItems] = useState<Licitacao[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await licitacaoRepository.search({
          filter: params.filter,
          page: params.page,
          pageSize: params.pageSize,
          orderBy: params.orderBy,
        });

        if (!canceled) {
          setItems(result.items);
          setTotalCount(result.totalCount);
        }
      } catch (err) {
        if (!canceled) {
          setError(err);
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [licitacaoRepository, params.filter, params.page, params.pageSize, params.orderBy]);

  return { items, totalCount, isLoading, error };
}
