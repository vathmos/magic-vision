import { ThemeSwitcher } from "@/components/ThemeSwitch";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button, Card, CardBody, CardHeader, Chip, Input } from "@heroui/react";
import {
  IconArrowBackUp,
  IconArrowsExchange,
  IconBat,
  IconChevronRight,
  IconGift,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconRefresh,
  IconSwords,
  IconUser,
  IconUserCancel,
  IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const ROUND_COUNT = 7;
const ROUND_DURATION = 30;

type Stage = "setup" | "discovery" | "execution";

type Enemy = {
  id: string;
  name: string;
};

const initialEnemyNames = Array.from({ length: ROUND_COUNT }, (_, index) => `P${index + 2}`);
const discoveryStageLabels = ["I-2", "I-3", "I-4", "II-1", "II-2", "II-4", "II-5"];

type DragData =
  | { type: "pool"; playerId: string }
  | { type: "slot"; playerId: string; index: number };


function DraggableEnemy({
  id,
  label,
  selected,
  eliminated,
  disabled,
  onClick,
  dragData,
}: {
  id: string;
  label: string;
  selected: boolean;
  eliminated: boolean;
  disabled?: boolean;
  onClick: () => void;
  dragData?: DragData;
}) {
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
      className={`flex w-full items-center justify-between border px-5 py-4.5 text-lg transition-none ${
        selected ? "border-[var(--accent)] bg-[var(--surface-strong)]" : "border-white/10 bg-[var(--surface)]"
      } ${eliminated ? "opacity-50 line-through" : ""} ${isDragging ? "shadow-xl opacity-0" : "shadow-sm"}`}
    >
      <span className="font-medium">{label}</span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {eliminated ? "Eliminated" : "Ready"}
      </span>
    </Button>
  );
}

function DroppableSlot({
  children,
  disabled,
  id,
  isActive,
}: {
  children: ReactNode;
  disabled?: boolean;
  id: string;
  isActive?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[60px] items-center justify-center border p-5 text-center transition md:min-h-[72px] md:p-6 ${
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

function SlotDraggable({
  playerId,
  name,
  index,
}: {
  playerId: string;
  name: string;
  index: number;
}) {
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
      className={`flex items-center gap-2 text-lg font-medium ${
        isDragging ? "opacity-0" : ""
      }`}
    >
      <IconUser className="h-5 w-5 text-[var(--muted)]" />
      {name}
    </div>
  );
}

function toRoman(value: number) {
  const romanMap: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let result = "";
  for (const [num, roman] of romanMap) {
    while (remaining >= num) {
      result += roman;
      remaining -= num;
    }
  }
  return result;
}

function getDiscoveryLabel(index: number) {
  return discoveryStageLabels[index] ?? `Slot ${index + 1}`;
}

function getNextOpponentIndex(
  startIndex: number,
  order: string[],
  eliminated: Set<string>,
) {
  for (let step = 1; step <= order.length; step += 1) {
    const idx = (startIndex + step) % order.length;
    const candidate = order[idx];
    if (!eliminated.has(candidate)) {
      return idx;
    }
  }
  return null;
}

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("setup");
  const [enemyNames, setEnemyNames] = useState<string[]>(initialEnemyNames);
  const [order, setOrder] = useState<(string | null)[]>(Array(ROUND_COUNT).fill(null));
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null);
  const [pointerIndex, setPointerIndex] = useState(-1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [stageNumber, setStageNumber] = useState(1);
  const [isFateBox, setIsFateBox] = useState(false);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [paused, setPaused] = useState(false);
  const [isMirrorStage, setIsMirrorStage] = useState(false);

  const enemies = useMemo<Enemy[]>(
    () =>
      enemyNames.map((name, index) => ({
        id: `enemy-${index}`,
        name: name.trim() || `P${index + 2}`,
      })),
    [enemyNames],
  );

  const enemyMap = useMemo(() => new Map(enemies.map((enemy) => [enemy.id, enemy])), [enemies]);
  const eliminatedSet = useMemo(() => new Set(eliminatedIds), [eliminatedIds]);
  const assignedIds = useMemo(
    () => new Set(order.filter((entry): entry is string => Boolean(entry))),
    [order],
  );

  const isDiscoveryComplete = order.every((slot) => slot !== null);
  const activeEnemyCount = enemies.filter((enemy) => !eliminatedSet.has(enemy.id)).length;
  const activePlayerCount = activeEnemyCount + 1;
  const stagesThisRound = roundNumber === 1 ? 4 : 6;
  const stageType =
    stage === "execution" && !isFateBox
      ? roundNumber === 1
        ? stageNumber === 1
          ? "creep"
          : "player"
        : stageNumber === 3
          ? "creep"
          : "player"
      : isFateBox
        ? "fate"
        : "player";
  const isPlayerStage = stage === "execution" && stageType === "player" && !isFateBox;
  const isCreepStage = stage === "execution" && stageType === "creep" && !isFateBox;
  const canMirror = isPlayerStage && activePlayerCount % 2 === 1;

  const availableEnemies = enemies.filter((enemy) => !assignedIds.has(enemy.id));
  const nextOpponentIndex = useMemo(
    () => (isPlayerStage ? getNextOpponentIndex(pointerIndex, order as string[], eliminatedSet) : null),
    [isPlayerStage, pointerIndex, order, eliminatedSet],
  );
  const nextOpponentId = nextOpponentIndex !== null ? order[nextOpponentIndex] : null;
  const nextOpponent = nextOpponentId ? enemyMap.get(nextOpponentId) : null;
  const stageLabel = isFateBox ? "Fate Box" : `${toRoman(roundNumber)}-${stageNumber}`;
  const stageTitle = isFateBox
    ? "Fate Box"
    : isCreepStage
      ? "Creep stage"
      : isMirrorStage
        ? "Mirror round"
        : "Player stage";

  const handleStartDiscovery = () => {
    setStage("discovery");
    setOrder(Array(ROUND_COUNT).fill(null));
    setSelectedEnemyId(null);
    setPointerIndex(-1);
    setRoundNumber(1);
    setStageNumber(1);
    setIsFateBox(false);
    setEliminatedIds([]);
    setTimeLeft(ROUND_DURATION);
    setPaused(false);
    setIsMirrorStage(false);
  };

  const handleBackToSetup = () => {
    setStage("setup");
    setOrder(Array(ROUND_COUNT).fill(null));
    setSelectedEnemyId(null);
    setPointerIndex(-1);
    setRoundNumber(1);
    setStageNumber(1);
    setIsFateBox(false);
    setEliminatedIds([]);
    setTimeLeft(ROUND_DURATION);
    setPaused(false);
    setIsMirrorStage(false);
  };

  const startExecution = useCallback(() => {
    setStage("execution");
    setRoundNumber(2);
    setStageNumber(6);
    setIsFateBox(false);
    setPointerIndex(-1);
    setSelectedEnemyId(null);
    setTimeLeft(ROUND_DURATION);
    setPaused(false);
    setIsMirrorStage(false);
  }, []);

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

  const swapOrderSlots = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setOrder((prev) => {
      const next = [...prev];
      const temp = next[toIndex];
      next[toIndex] = next[fromIndex];
      next[fromIndex] = temp;
      return next;
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    if (stage === "discovery" && typeof event.over?.id === "string") {
      const match = event.over.id.match(/^round-(\d+)$/);
        if (match) {
          const roundIndex = Number(match[1]);
          const data = event.active.data.current as DragData | undefined;
          if (data?.type === "pool") {
            if (!order[roundIndex]) {
              placePlayerInSlot(data.playerId, roundIndex);
            }
          }
          if (data?.type === "slot") {
            swapOrderSlots(data.index, roundIndex);
          }
        }
    }
    setActiveDragPlayerId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (stage !== "discovery") return;
    const data = event.active.data?.current as DragData | undefined;
    if (data?.playerId) {
      setActiveDragPlayerId(data.playerId);
    }
  };

  const handleDragCancel = () => {
    setActiveDragPlayerId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const advanceStage = useCallback(
    (forceMirror = false) => {
      if (stage !== "execution") return;
      if (isFateBox) {
        setIsFateBox(false);
        setIsMirrorStage(false);
        setRoundNumber((round) => round + 1);
        setStageNumber(1);
        setTimeLeft(ROUND_DURATION);
        return;
      }

      if (isPlayerStage) {
        const nextIndex = getNextOpponentIndex(pointerIndex, order as string[], eliminatedSet);
        const shouldMirror = forceMirror || nextIndex === null;
        if (!shouldMirror && nextIndex !== null) {
          setPointerIndex(nextIndex);
        }
        setIsMirrorStage(shouldMirror);
      } else {
        setIsMirrorStage(false);
      }

      if (stageNumber >= stagesThisRound) {
        setIsFateBox(true);
      } else {
        setStageNumber((current) => current + 1);
      }
      setTimeLeft(ROUND_DURATION);
    },
    [stage, isFateBox, isPlayerStage, pointerIndex, order, eliminatedSet, stageNumber, stagesThisRound],
  );

  useEffect(() => {
    if (stage !== "execution" || paused) return;
    if (timeLeft <= 0) {
      advanceStage();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((time) => time - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, paused, timeLeft, advanceStage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEliminate = (enemyId: string) => {
    if (eliminatedSet.has(enemyId)) return;
    setEliminatedIds((prev) => [...prev, enemyId]);
  };

  const handleRevive = (enemyId: string) => {
    if (!eliminatedSet.has(enemyId)) return;
    setEliminatedIds((prev) => prev.filter((id) => id !== enemyId));
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const gridColumns =
    stage === "setup" || stage === "discovery"
      ? "lg:grid-cols-1"
      : "lg:grid-cols-[1.05fr_1.4fr_1fr]";

  return (
    <div className="min-h-screen px-6 pb-16 pt-10 text-[var(--ink)] md:px-12">
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="flex w-full flex-col gap-6"
      >
        <div className="flex w-full justify-between">
          <Image
            className={`${mounted && resolvedTheme === "dark" ? "invert" : "invert-0"}`}
            src="/magic-vision.svg"
            alt="Magic Vision icon"
            width={88}
            height={88}
          />
          <ThemeSwitcher/>
        </div>
        <div className="max-w-xl space-y-3">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Magic Vision
            </span>
            <h1 className="text-4xl md:text-5xl">Immutable order. Clear next opponent.</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Assign opponents in rounds 1-7, then the order locks and loops forever. The pointer moves only on real
            fights. Mirror rounds freeze everything.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="button"
            onPress={handleBackToSetup}
            isDisabled={stage === "setup"}
            className="border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] transition hover:text-[var(--ink)] disabled:opacity-40"
          >
            <span className="flex items-center gap-2">
              <IconArrowBackUp className="h-4 w-4" />
              Back to Setup
            </span>
          </Button>
          <Button
            type="button"
            onPress={handleStartDiscovery}
            isDisabled={stage === "setup"}
            className="border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] transition hover:text-[var(--ink)] disabled:opacity-40"
          >
            <span className="flex items-center gap-2">
              <IconRefresh className="h-4 w-4" />
              Reset Session
            </span>
          </Button>
        </div>
      </motion.header>

      <motion.main
        variants={panelVariants}
        initial="hidden"
        animate="show"
        className={`mt-10 grid gap-6 ${gridColumns}`}
      >
        {stage === "execution" && (
          <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
            <CardHeader className="flex items-center justify-between px-6 pt-6">
              <h2 className="text-xl">Match Order</h2>
              <Chip className="border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Locked
              </Chip>
            </CardHeader>
            <CardBody className="px-6 pb-6 pt-0">
              <div className="mt-2 space-y-3">
                {order.map((slot, index) => {
                  const enemy = slot ? enemyMap.get(slot) : null;
                  const isNext = nextOpponentIndex === index && !isMirrorStage;
                  return (
                    <div
                      key={`slot-${index}`}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                        isNext
                          ? "border-[var(--accent)] bg-[var(--surface-strong)]"
                          : "border-white/10 bg-transparent"
                      }`}
                    >
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          {getDiscoveryLabel(index)}
                        </div>
                        <div className="font-medium">{enemy ? enemy.name : "Unassigned"}</div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        {enemy && eliminatedSet.has(enemy.id) ? "Eliminated" : isNext ? "Next" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {stage === "setup" && (
          <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
            <CardBody className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl">Set the table</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Player 1 is locked as YOU. Enter players 2-8 to begin discovery.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Player 1"
                    labelPlacement="outside"
                    value="YOU"
                    isDisabled
                    classNames={{
                      label: "text-xs uppercase tracking-[0.18em] text-[var(--muted)]",
                      inputWrapper:
                        "mt-2 border border-white/10 bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--ink)] opacity-80",
                    }}
                  />
                  {enemyNames.map((name, index) => (
                    <Input
                      key={`enemy-name-${index}`}
                      label={`Player ${index + 2}`}
                      labelPlacement="outside"
                      value={name}
                      onChange={(event) =>
                        setEnemyNames((prev) => {
                          const updated = [...prev];
                          updated[index] = event.target.value;
                          return updated;
                        })
                      }
                      classNames={{
                        label: "text-xs uppercase tracking-[0.18em] text-[var(--muted)]",
                        inputWrapper:
                          "mt-2 border border-white/10 bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--ink)]",
                      }}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  onPress={handleStartDiscovery}
                  className="w-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110"
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconPlayerPlay className="h-7 w-7" />
                  </span>
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {stage === "discovery" && (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)] lg:min-h-[calc(100vh-10rem)]">
              <CardBody className="flex h-full flex-col px-6 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl">Discovery Order</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Drag a player into any round slot. You can also swap players between rounds before continuing.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onPress={startExecution}
                    isDisabled={!isDiscoveryComplete}
                    className="bg-[var(--accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110 disabled:opacity-40"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <IconChevronRight className="h-6 w-6" />
                      Continue
                    </span>
                  </Button>
                </div>
                <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="flex flex-col gap-4">
                    {order.map((slot, index) => {
                      const enemy = slot ? enemyMap.get(slot) : null;
                      const isAssigned = Boolean(slot);
                      const canPlace = Boolean(selectedEnemyId) && !isAssigned;
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
                                    <span>
                                      {selectedEnemyId
                                        ? `Selected: ${enemyMap.get(selectedEnemyId)?.name}`
                                        : "Drop or place a player"}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </DroppableSlot>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg">Players</h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                          {availableEnemies.length} remaining
                        </p>
                      </div>
                      <Button
                        type="button"
                        onPress={() => setSelectedEnemyId(null)}
                        className="border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
                      >
                        <span className="flex items-center gap-2">
                          <IconX className="h-3.5 w-3.5" />
                          Clear
                        </span>
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {availableEnemies.map((enemy) => (
                        <DraggableEnemy
                          key={enemy.id}
                          id={`pool-${enemy.id}`}
                          label={enemy.name}
                          selected={selectedEnemyId === enemy.id}
                          eliminated={eliminatedSet.has(enemy.id)}
                          dragData={{ type: "pool", playerId: enemy.id }}
                          onClick={() =>
                            setSelectedEnemyId((current) => (current === enemy.id ? null : enemy.id))
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <DragOverlay dropAnimation={null}>
              {activeDragPlayerId ? (
                <div className="flex w-full max-w-[320px] items-center justify-between rounded-2xl border border-[var(--accent)] bg-[var(--surface-strong)] px-4 py-3 text-left text-sm shadow-xl">
                  <span className="font-medium">{enemyMap.get(activeDragPlayerId)?.name}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Dragging</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {stage === "execution" && (
          <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
            <CardBody className="px-6 py-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{stageLabel}</div>
                      <h2 className="text-3xl">{stageTitle}</h2>
                    </div>
                    <div className="rounded-full border border-white/10 px-4 py-2 text-2xl font-semibold">
                      {timeLeft}s
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-[var(--surface-strong)] p-6">
                    {isFateBox && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          <IconGift className="h-4 w-4" />
                          Fate Box
                        </div>
                        <div className="text-2xl font-semibold">Choose your fate</div>
                      </div>
                    )}
                    {isCreepStage && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          <IconBat className="h-4 w-4" />
                          Creep stage
                        </div>
                        <div className="text-2xl font-semibold">Choose your preferred items</div>
                      </div>
                    )}
                    {isPlayerStage && isMirrorStage && (
                      <div className="space-y-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Self match</div>
                        <div className="text-2xl font-semibold">Mirror engaged. Pointer frozen.</div>
                        <p className="text-sm text-[var(--muted)]">
                          Mirror stages never advance the matchmaking pointer.
                        </p>
                      </div>
                    )}
                    {isPlayerStage && !isMirrorStage && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          <IconSwords className="h-4 w-4" />
                          Next opponent
                        </div>
                        <div className="flex items-center gap-2 text-2xl font-semibold">
                          <IconUser className="h-6 w-6 text-[var(--muted)]" />
                          {nextOpponent?.name}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button
                      type="button"
                      isDisabled={!canMirror}
                      onPress={() => advanceStage(true)}
                      className="border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <IconArrowsExchange className="h-4 w-4" />
                        Mirror
                      </span>
                    </Button>
                    <Button
                      type="button"
                      onPress={() => advanceStage(false)}
                      className="bg-[var(--accent)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:brightness-110"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <IconPlayerSkipForward className="h-4 w-4" />
                        Skip
                      </span>
                    </Button>
                    <Button
                      type="button"
                      onPress={() => setPaused((current) => !current)}
                      className="border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--ink)] md:col-span-2"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {paused ? <IconPlayerPlay className="h-4 w-4" /> : <IconPlayerPause className="h-4 w-4" />}
                        {paused ? "Resume" : "Pause"}
                      </span>
                    </Button>
                  </div>
                </div>
            </CardBody>
          </Card>
        )}

        {stage === "execution" && (
          <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
            <CardHeader className="flex items-center justify-between px-6 pt-6">
              <div className="flex items-center gap-2">
                <IconUser className="h-5 w-5 text-[var(--muted)]" />
                <h2 className="text-xl">Player Roster</h2>
              </div>
              <Chip className="border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {activeEnemyCount} active
              </Chip>
            </CardHeader>
            <CardBody className="px-6 pb-6 pt-0">
              <p className="mt-2 text-sm text-[var(--muted)]">
                Eliminate or revive players. Eliminated players stay in the order but are skipped.
              </p>
              <div className="mt-6 grid gap-3">
                {enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-left text-sm"
                  >
                    <span
                      className={`flex items-center gap-2 font-medium ${
                        eliminatedSet.has(enemy.id) ? "text-[var(--muted)] line-through" : ""
                      }`}
                    >
                      <IconUser className="h-4 w-4 text-[var(--muted)]" />
                      {enemy.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onPress={() =>
                          eliminatedSet.has(enemy.id) ? handleRevive(enemy.id) : handleEliminate(enemy.id)
                        }
                        variant="bordered"
                        isIconOnly
                        className={`h-9 w-9 p-0 ${
                          eliminatedSet.has(enemy.id)
                            ? "border-[var(--success)] text-[var(--success)]"
                            : "border-[var(--danger)] text-[var(--danger)]"
                        }`}
                        aria-label={eliminatedSet.has(enemy.id) ? "Revive player" : "Eliminate player"}
                      >
                        {eliminatedSet.has(enemy.id) ? (
                          <IconPlayerPlay className="h-6 w-6" />
                        ) : (
                          <IconUserCancel className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </motion.main>
    </div>
  );
}
