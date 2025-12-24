import { useCallback, useMemo, useState } from "react";

type Enemy = {
  id: string;
  name: string;
};

type UseRosterParams = {
  enemies: Enemy[];
};

export function useRoster({ enemies }: UseRosterParams) {
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const eliminatedSet = useMemo(() => new Set(eliminatedIds), [eliminatedIds]);
  const activeEnemyCount = useMemo(
    () => enemies.filter((enemy) => !eliminatedSet.has(enemy.id)).length,
    [enemies, eliminatedSet],
  );
  const activePlayerCount = activeEnemyCount + 1;

  const eliminate = useCallback((enemyId: string) => {
    setEliminatedIds((prev) => (prev.includes(enemyId) ? prev : [...prev, enemyId]));
  }, []);

  const revive = useCallback((enemyId: string) => {
    setEliminatedIds((prev) => prev.filter((id) => id !== enemyId));
  }, []);

  const resetRoster = useCallback(() => {
    setEliminatedIds([]);
  }, []);

  const hydrateRoster = useCallback((ids: string[]) => {
    setEliminatedIds(ids);
  }, []);

  return {
    eliminatedIds,
    eliminatedSet,
    activeEnemyCount,
    activePlayerCount,
    eliminate,
    revive,
    resetRoster,
    hydrateRoster,
  };
}
