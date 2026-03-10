import { useEffect, useState } from "react";
import type { Modalidade } from "../../types/BuscaLicitacoes/Modalidade";
import { useModalidadeRepository } from "../context/RepositoriesContext";

export function useModalidades() {
  const modalidadeRepository = useModalidadeRepository();
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setIsLoading(true);
        const result = await modalidadeRepository.getAll();
        if (!canceled) {
          setModalidades(result);
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
  }, [modalidadeRepository]);

  return { modalidades, isLoading, error };
}
