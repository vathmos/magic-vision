import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type PointerSensorOptions,
  type SensorDescriptor,
} from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import type { DragData } from "@/types/drag";
import type { Stage } from "@/types/session";

type Enemy = {
  id: string;
  name: string;
};

type UseDiscoveryOrderParams = {
  stage: Stage;
  enemies: Enemy[];
  roundCount: number;
};

export function useDiscoveryOrder({ stage, enemies, roundCount }: UseDiscoveryOrderParams) {
  const [order, setOrder] = useState<(string | null)[]>(Array(roundCount).fill(null));
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null);

  const assignedIds = useMemo(
    () => new Set(order.filter((entry): entry is string => Boolean(entry))),
    [order],
  );
  const availableEnemies = useMemo(
    () => enemies.filter((enemy) => !assignedIds.has(enemy.id)),
    [enemies, assignedIds],
  );
  const isDiscoveryComplete = useMemo(() => order.every((slot) => slot !== null), [order]);

  const placePlayerInSlot = useCallback(
    (playerId: string, targetIndex: number) => {
      if (stage !== "discovery") return;
      setOrder((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex((id) => id === playerId);
        if (existingIndex === targetIndex) {
          return prev;
        }
        const targetPlayer = next[targetIndex];
        if (existingIndex !== -1) {
          next[existingIndex] = targetPlayer ?? null;
        }
        next[targetIndex] = playerId;
        return next;
      });
      setSelectedEnemyId(null);
    },
    [stage],
  );

  const removePlayerFromSlot = useCallback(
    (slotIndex: number) => {
      if (stage !== "discovery") return;
      setOrder((prev) => {
        if (!prev[slotIndex]) {
          return prev;
        }
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setSelectedEnemyId(null);
    },
    [stage],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (stage === "discovery" && typeof event.over?.id === "string") {
        const data = event.active.data.current as DragData | undefined;
        if (event.over.id === "pool-drop" && data?.type === "slot") {
          removePlayerFromSlot(data.index);
          setActiveDragPlayerId(null);
          return;
        }
        const match = event.over.id.match(/^round-(\d+)$/);
        if (match && data?.playerId) {
          const roundIndex = Number(match[1]);
          placePlayerInSlot(data.playerId, roundIndex);
        }
      }
      setActiveDragPlayerId(null);
    },
    [stage, placePlayerInSlot, removePlayerFromSlot],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (stage !== "discovery") return;
      const data = event.active.data?.current as DragData | undefined;
      if (data?.playerId) {
        setActiveDragPlayerId(data.playerId);
      }
    },
    [stage],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragPlayerId(null);
  }, []);

  const sensors: SensorDescriptor<PointerSensorOptions>[] = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const resetDiscovery = useCallback(() => {
    setOrder(Array(roundCount).fill(null));
    setSelectedEnemyId(null);
    setActiveDragPlayerId(null);
  }, [roundCount]);

  const clearSelection = useCallback(() => {
    setSelectedEnemyId(null);
  }, []);

  const hydrateDiscovery = useCallback(
    (nextOrder: (string | null)[]) => {
      setOrder(nextOrder);
      setSelectedEnemyId(null);
      setActiveDragPlayerId(null);
    },
    [],
  );

  return {
    order,
    selectedEnemyId,
    setSelectedEnemyId,
    activeDragPlayerId,
    sensors,
    availableEnemies,
    isDiscoveryComplete,
    placePlayerInSlot,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    resetDiscovery,
    clearSelection,
    hydrateDiscovery,
  };
}
