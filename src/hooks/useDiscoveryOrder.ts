import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type PointerSensorOptions,
  type SensorDescriptor,
} from "@dnd-kit/core";
import { useCallback, useMemo } from "react";
import type { DragData } from "@/types/drag";
import { useSessionStore } from "@/store/sessionStore";

type Enemy = {
  id: string;
  name: string;
};

type UseDiscoveryOrderParams = {
  enemies: Enemy[];
  roundCount: number;
};

export function useDiscoveryOrder({ enemies, roundCount }: UseDiscoveryOrderParams) {
  const stage = useSessionStore((state) => state.stage);
  const order = useSessionStore((state) => state.order);
  const selectedEnemyId = useSessionStore((state) => state.selectedEnemyId);
  const activeDragPlayerId = useSessionStore((state) => state.activeDragPlayerId);
  const setSelectedEnemyId = useSessionStore((state) => state.setSelectedEnemyId);
  const setActiveDragPlayerId = useSessionStore((state) => state.setActiveDragPlayerId);
  const setOrder = useSessionStore((state) => state.setOrder);
  const updateOrder = useSessionStore((state) => state.updateOrder);
  const resetDiscovery = useSessionStore((state) => state.resetDiscovery);

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
      updateOrder((prev) => {
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
    [stage, updateOrder, setSelectedEnemyId],
  );

  const removePlayerFromSlot = useCallback(
    (slotIndex: number) => {
      if (stage !== "discovery") return;
      updateOrder((prev) => {
        if (!prev[slotIndex]) {
          return prev;
        }
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setSelectedEnemyId(null);
    },
    [stage, updateOrder, setSelectedEnemyId],
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
    [stage, placePlayerInSlot, removePlayerFromSlot, setActiveDragPlayerId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (stage !== "discovery") return;
      const data = event.active.data?.current as DragData | undefined;
      if (data?.playerId) {
        setActiveDragPlayerId(data.playerId);
      }
    },
    [stage, setActiveDragPlayerId],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragPlayerId(null);
  }, [setActiveDragPlayerId]);

  const sensors: SensorDescriptor<PointerSensorOptions>[] = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const resetDiscoveryState = useCallback(() => {
    resetDiscovery(roundCount);
  }, [resetDiscovery, roundCount]);

  const clearSelection = useCallback(() => {
    setSelectedEnemyId(null);
  }, [setSelectedEnemyId]);

  const hydrateDiscovery = useCallback(
    (nextOrder: (string | null)[]) => {
      setOrder(nextOrder);
      setSelectedEnemyId(null);
      setActiveDragPlayerId(null);
    },
    [setOrder, setSelectedEnemyId, setActiveDragPlayerId],
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
    resetDiscovery: resetDiscoveryState,
    clearSelection,
    hydrateDiscovery,
  };
}
