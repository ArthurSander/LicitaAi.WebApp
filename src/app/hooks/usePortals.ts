import { useEffect, useState } from "react";
import type { Portal } from "../../types/BuscaLicitacoes/Portal";
import { usePortalRepository } from "../context/RepositoriesContext";

export function usePortals() {
  const portalRepository = usePortalRepository();
  const [portals, setPortals] = useState<Portal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setIsLoading(true);
        const result = await portalRepository.getAll();
        if (!canceled) {
          setPortals(result);
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
  }, [portalRepository]);

  return { portals, isLoading, error };
}
