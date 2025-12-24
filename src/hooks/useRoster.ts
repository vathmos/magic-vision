import { useCallback, useMemo } from "react";
import { useSessionStore } from "@/store/sessionStore";

type Enemy = {
  id: string;
  name: string;
};

type UseRosterParams = {
  enemies: Enemy[];
};

export function useRoster({ enemies }: UseRosterParams) {
  const eliminatedIds = useSessionStore((state) => state.eliminatedIds);
  const setEliminatedIds = useSessionStore((state) => state.setEliminatedIds);
  const eliminate = useSessionStore((state) => state.eliminate);
  const revive = useSessionStore((state) => state.revive);
  const resetRoster = useSessionStore((state) => state.resetRoster);
  const eliminatedSet = useMemo(() => new Set(eliminatedIds), [eliminatedIds]);
  const activeEnemyCount = useMemo(
    () => enemies.filter((enemy) => !eliminatedSet.has(enemy.id)).length,
    [enemies, eliminatedSet],
  );
  const activePlayerCount = activeEnemyCount + 1;

  const hydrateRoster = useCallback(
    (ids: string[]) => {
      setEliminatedIds(ids);
    },
    [setEliminatedIds],
  );

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
