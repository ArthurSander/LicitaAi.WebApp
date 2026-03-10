import { useEffect, useState } from "react";
import type { Estado } from "../../types/BuscaLicitacoes/Estado";
import { useEstadoRepository } from "../context/RepositoriesContext";

export function useEstados() {
  const estadoRepository = useEstadoRepository();
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setIsLoading(true);
        const result = await estadoRepository.getAll();
        if (!canceled) {
          setEstados(result);
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
  }, [estadoRepository]);

  return { estados, isLoading, error };
}
