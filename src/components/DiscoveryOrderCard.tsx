import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type PointerSensorOptions,
} from "@dnd-kit/core";
import { Button, Card, CardBody } from "@heroui/react";
import { IconChevronRight, IconUser } from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { DragData } from "@/types/drag";

type Enemy = {
  id: string;
  name: string;
};

type DraggableEnemyProps = {
  id: string;
  label: string;
  selected: boolean;
  eliminated: boolean;
  disabled?: boolean;
  onClick: () => void;
  dragData?: DragData;
  statusLabel: string;
};

function DraggableEnemy({
  id,
  label,
  selected,
  eliminated,
  disabled,
  onClick,
  dragData,
  statusLabel,
}: DraggableEnemyProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: dragData,
    disabled,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Button
      type="button"
      ref={setNodeRef}
      style={style}
      onPress={onClick}
      {...listeners}
      {...attributes}
      className={`flex w-full items-center justify-between border px-5 py-6 text-base transition-none ${
        selected ? "border-[var(--accent)] bg-[var(--surface-strong)]" : "border-white/10 bg-[var(--surface)]"
      } ${eliminated ? "opacity-50 line-through" : ""} ${isDragging ? "shadow-xl opacity-0" : "shadow-sm"}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{statusLabel}</span>
    </Button>
  );
}

type DroppableSlotProps = {
  children: ReactNode;
  disabled?: boolean;
  id: string;
  isActive?: boolean;
};

function DroppableSlot({ children, disabled, id, isActive }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[84px] items-center justify-center rounded-2xl border p-5 text-center transition md:min-h-[92px] md:p-6 ${
        isOver
          ? "border-[var(--accent)] bg-[var(--surface-strong)]"
          : isActive
            ? "border-[var(--accent-2)] bg-[var(--surface-strong)]"
            : "border-white/10 bg-[var(--surface)]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {children}
    </div>
  );
}

type SlotDraggableProps = {
  playerId: string;
  name: string;
  index: number;
};

function SlotDraggable({ playerId, name, index }: SlotDraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `slot-item-${index}`,
    data: { type: "slot", playerId, index } satisfies DragData,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-base font-medium ${
        isDragging ? "opacity-0" : ""
      }`}
    >
      <IconUser className="h-5 w-5 text-[var(--muted)]" />
      {name}
    </div>
  );
}

type PoolDropZoneProps = {
  children: ReactNode;
};

function PoolDropZone({ children }: PoolDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "pool-drop",
  });

  return (
    <div
      ref={setNodeRef}
      className={`grid min-h-[92px] gap-3 transition ${isOver ? "ring-1 ring-[var(--accent)]" : ""}`}
    >
      {children}
    </div>
  );
}

type DiscoveryOrderCardProps = {
  order: (string | null)[];
  enemyMap: Map<string, Enemy>;
  selectedEnemyId: string | null;
  setSelectedEnemyId: (value: string | null) => void;
  availableEnemies: Enemy[];
  eliminatedSet: Set<string>;
  activeDragPlayerId: string | null;
  sensors: SensorDescriptor<PointerSensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  placePlayerInSlot: (playerId: string, index: number) => void;
  startExecution: () => void;
  isDiscoveryComplete: boolean;
  getDiscoveryLabel: (index: number) => string;
  t: (key: string, ...args: string[]) => string;
};

export function DiscoveryOrderCard({
  order,
  enemyMap,
  selectedEnemyId,
  setSelectedEnemyId,
  availableEnemies,
  eliminatedSet,
  activeDragPlayerId,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  placePlayerInSlot,
  startExecution,
  isDiscoveryComplete,
  getDiscoveryLabel,
  t,
}: DiscoveryOrderCardProps) {
  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)] lg:min-h-[calc(100vh-10rem)]">
        <CardBody className="flex h-full flex-col px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl">{t("discoveryOrderTitle")}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{t("discoveryOrderDescription")}</p>
            </div>
          </div>
          <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-4">
              {order.map((slot, index) => {
                const enemy = slot ? enemyMap.get(slot) : null;
                const canPlace = Boolean(selectedEnemyId) && selectedEnemyId !== slot;
                return (
                  <div
                    key={`round-slot-${index}`}
                    role={canPlace ? "button" : undefined}
                    tabIndex={canPlace ? 0 : -1}
                    onClick={() => canPlace && selectedEnemyId && placePlayerInSlot(selectedEnemyId, index)}
                    className={canPlace ? "cursor-pointer" : "cursor-default"}
                  >
                    <DroppableSlot id={`round-${index}`} isActive={canPlace} disabled={false}>
                      <div className="grid w-full items-center gap-4 text-left md:grid-cols-[140px_1fr]">
                        <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                          {getDiscoveryLabel(index)}
                        </div>
                        <div className="flex items-center gap-2 text-base md:text-lg">
                          {enemy ? (
                            <SlotDraggable playerId={enemy.id} name={enemy.name} index={index} />
                          ) : (
                            <>
                              <IconUser className="h-4 w-4 text-[var(--muted)]" />
                              <span>{t("dropOrPlace")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </DroppableSlot>
                  </div>
                );
              })}
            </div>
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg">{t("unusedPlayers")}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {t("remaining", String(availableEnemies.length))}
                  </p>
                </div>
              </div>
              <PoolDropZone>
                {availableEnemies.map((enemy) => (
                  <DraggableEnemy
                    key={enemy.id}
                    id={`pool-${enemy.id}`}
                    label={enemy.name}
                    selected={selectedEnemyId === enemy.id}
                    eliminated={eliminatedSet.has(enemy.id)}
                    dragData={{ type: "pool", playerId: enemy.id }}
                    statusLabel={eliminatedSet.has(enemy.id) ? t("eliminated") : t("ready")}
                    onClick={() =>
                      setSelectedEnemyId(selectedEnemyId === enemy.id ? null : enemy.id)
                    }
                  />
                ))}
              </PoolDropZone>
              <div className="mt-auto flex justify-end pt-2">
                <Button
                  type="button"
                  onPress={startExecution}
                  isDisabled={!isDiscoveryComplete}
                  className="bg-[var(--accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110 disabled:opacity-40"
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconChevronRight className="h-6 w-6" />
                    {t("continue")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <DragOverlay dropAnimation={null}>
        {activeDragPlayerId ? (
          <div className="flex w-full max-w-[320px] items-center justify-between rounded-2xl border border-[var(--accent)] bg-[var(--surface-strong)] px-4 py-3 text-left text-sm shadow-xl">
            <span className="font-medium">{enemyMap.get(activeDragPlayerId)?.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
