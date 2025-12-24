import { create } from "zustand";
import type { Stage } from "@/types/session";
import { DEFAULT_ENEMY_NAMES, ROUND_DURATION } from "@/utils/constants";

type EndgameResult = "win" | "lose" | null;

type SessionState = {
  stage: Stage;
  enemyNames: string[];
  order: (string | null)[];
  selectedEnemyId: string | null;
  activeDragPlayerId: string | null;
  pointerIndex: number;
  roundNumber: number;
  stageNumber: number;
  isFateBox: boolean;
  timeLeft: number;
  paused: boolean;
  isMirrorStage: boolean;
  eliminatedIds: string[];
  endgameResult: EndgameResult;
};

type SessionActions = {
  setStage: (stage: Stage) => void;
  setEnemyNames: (names: string[]) => void;
  updateEnemyName: (index: number, value: string) => void;
  setOrder: (order: (string | null)[]) => void;
  updateOrder: (updater: (order: (string | null)[]) => (string | null)[]) => void;
  setSelectedEnemyId: (id: string | null) => void;
  setActiveDragPlayerId: (id: string | null) => void;
  setPointerIndex: (value: number) => void;
  setRoundNumber: (value: number) => void;
  setStageNumber: (value: number) => void;
  setIsFateBox: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  setPaused: (value: boolean) => void;
  setIsMirrorStage: (value: boolean) => void;
  setEliminatedIds: (ids: string[]) => void;
  eliminate: (enemyId: string) => void;
  revive: (enemyId: string) => void;
  setEndgameResult: (result: EndgameResult) => void;
  resetDiscovery: (roundCount: number) => void;
  resetExecution: (roundDuration: number) => void;
  resetRoster: () => void;
  startExecution: (roundDuration: number) => void;
};

const initialOrder = Array(DEFAULT_ENEMY_NAMES.length).fill(null) as (string | null)[];

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  stage: "setup",
  enemyNames: DEFAULT_ENEMY_NAMES,
  order: initialOrder,
  selectedEnemyId: null,
  activeDragPlayerId: null,
  pointerIndex: -1,
  roundNumber: 1,
  stageNumber: 1,
  isFateBox: false,
  timeLeft: ROUND_DURATION,
  paused: false,
  isMirrorStage: false,
  eliminatedIds: [],
  endgameResult: null,
  setStage: (stage) => set({ stage }),
  setEnemyNames: (names) => set({ enemyNames: names }),
  updateEnemyName: (index, value) =>
    set((state) => {
      const next = [...state.enemyNames];
      next[index] = value;
      return { enemyNames: next };
    }),
  setOrder: (order) => set({ order }),
  updateOrder: (updater) => set((state) => ({ order: updater(state.order) })),
  setSelectedEnemyId: (id) => set({ selectedEnemyId: id }),
  setActiveDragPlayerId: (id) => set({ activeDragPlayerId: id }),
  setPointerIndex: (value) => set({ pointerIndex: value }),
  setRoundNumber: (value) => set({ roundNumber: value }),
  setStageNumber: (value) => set({ stageNumber: value }),
  setIsFateBox: (value) => set({ isFateBox: value }),
  setTimeLeft: (value) => set({ timeLeft: value }),
  setPaused: (value) => set({ paused: value }),
  setIsMirrorStage: (value) => set({ isMirrorStage: value }),
  setEliminatedIds: (ids) => set({ eliminatedIds: ids }),
  eliminate: (enemyId) =>
    set((state) =>
      state.eliminatedIds.includes(enemyId)
        ? state
        : { eliminatedIds: [...state.eliminatedIds, enemyId] },
    ),
  revive: (enemyId) =>
    set((state) => ({ eliminatedIds: state.eliminatedIds.filter((id) => id !== enemyId) })),
  setEndgameResult: (result) => set({ endgameResult: result }),
  resetDiscovery: (roundCount) =>
    set({
      order: Array(roundCount).fill(null) as (string | null)[],
      selectedEnemyId: null,
      activeDragPlayerId: null,
    }),
  resetExecution: (roundDuration) =>
    set({
      pointerIndex: -1,
      roundNumber: 1,
      stageNumber: 1,
      isFateBox: false,
      timeLeft: roundDuration,
      paused: false,
      isMirrorStage: false,
    }),
  resetRoster: () => set({ eliminatedIds: [] }),
  startExecution: (roundDuration) =>
    set({
      stage: "execution",
      roundNumber: 2,
      stageNumber: 6,
      isFateBox: false,
      pointerIndex: -1,
      timeLeft: roundDuration,
      paused: false,
      isMirrorStage: false,
      selectedEnemyId: null,
    }),
}));
