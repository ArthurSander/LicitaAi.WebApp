import { useEffect, useState } from "react";
import type { Cidade } from "../../types/BuscaLicitacoes/Cidade";
import { useCidadeRepository } from "../context/RepositoriesContext";

export function useCidades(codigoEstados: string[]) {
  const cidadeRepository = useCidadeRepository();
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setIsLoading(true);
        const result = await cidadeRepository.getAll(codigoEstados);
        if (!canceled) {
          setCidades(result);
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
  }, [cidadeRepository, codigoEstados]);

  return { cidades, isLoading, error };
}
