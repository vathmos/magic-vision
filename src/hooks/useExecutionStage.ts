import { useCallback, useEffect, useMemo } from "react";
import { useSessionStore } from "@/store/sessionStore";

function getNextOpponentIndex(startIndex: number, order: string[], eliminated: Set<string>) {
  for (let step = 1; step <= order.length; step += 1) {
    const idx = (startIndex + step) % order.length;
    const candidate = order[idx];
    if (!eliminated.has(candidate)) {
      return idx;
    }
  }
  return null;
}

type UseExecutionStageParams = {
  eliminatedSet: Set<string>;
  roundDuration: number;
};

export function useExecutionStage({
  eliminatedSet,
  roundDuration,
}: UseExecutionStageParams) {
  const stage = useSessionStore((state) => state.stage);
  const order = useSessionStore((state) => state.order);
  const pointerIndex = useSessionStore((state) => state.pointerIndex);
  const roundNumber = useSessionStore((state) => state.roundNumber);
  const stageNumber = useSessionStore((state) => state.stageNumber);
  const isFateBox = useSessionStore((state) => state.isFateBox);
  const timeLeft = useSessionStore((state) => state.timeLeft);
  const paused = useSessionStore((state) => state.paused);
  const isMirrorStage = useSessionStore((state) => state.isMirrorStage);
  const setPointerIndex = useSessionStore((state) => state.setPointerIndex);
  const setRoundNumber = useSessionStore((state) => state.setRoundNumber);
  const setStageNumber = useSessionStore((state) => state.setStageNumber);
  const setIsFateBox = useSessionStore((state) => state.setIsFateBox);
  const setTimeLeft = useSessionStore((state) => state.setTimeLeft);
  const setPaused = useSessionStore((state) => state.setPaused);
  const setIsMirrorStage = useSessionStore((state) => state.setIsMirrorStage);
  const startExecutionState = useSessionStore((state) => state.startExecution);
  const resetExecutionState = useSessionStore((state) => state.resetExecution);

  const orderIds = useMemo(
    () => (order.every((entry) => entry !== null) ? (order as string[]) : []),
    [order],
  );
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

  const nextOpponentIndex = useMemo(
    () => (isPlayerStage && orderIds.length ? getNextOpponentIndex(pointerIndex, orderIds, eliminatedSet) : null),
    [isPlayerStage, pointerIndex, orderIds, eliminatedSet],
  );

  const resetExecution = useCallback(() => {
    resetExecutionState(roundDuration);
  }, [roundDuration, resetExecutionState]);

  const startExecution = useCallback(() => {
    startExecutionState(roundDuration);
  }, [roundDuration, startExecutionState]);

  const advanceStage = useCallback(
    (forceMirror = false) => {
      if (stage !== "execution") return;
      if (isFateBox) {
        setIsFateBox(false);
        setIsMirrorStage(false);
        setRoundNumber(roundNumber + 1);
        setStageNumber(1);
        setTimeLeft(roundDuration);
        return;
      }

      if (isPlayerStage && orderIds.length) {
        const nextIndex = getNextOpponentIndex(pointerIndex, orderIds, eliminatedSet);
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
        setStageNumber(stageNumber + 1);
      }
      setTimeLeft(roundDuration);
    },
    [
      stage,
      isFateBox,
      isPlayerStage,
      pointerIndex,
      orderIds,
      eliminatedSet,
      roundNumber,
      stageNumber,
      stagesThisRound,
      roundDuration,
      setIsFateBox,
      setIsMirrorStage,
      setPointerIndex,
      setRoundNumber,
      setStageNumber,
      setTimeLeft,
    ],
  );

  const togglePause = useCallback(() => {
    setPaused(!paused);
  }, [paused, setPaused]);

  const hydrateExecution = useCallback(
    (state: {
      pointerIndex: number;
      roundNumber: number;
      stageNumber: number;
      isFateBox: boolean;
      timeLeft: number;
      paused: boolean;
      isMirrorStage: boolean;
    }) => {
      setPointerIndex(state.pointerIndex);
      setRoundNumber(state.roundNumber);
      setStageNumber(state.stageNumber);
      setIsFateBox(state.isFateBox);
      setTimeLeft(state.timeLeft);
      setPaused(state.paused);
      setIsMirrorStage(state.isMirrorStage);
    },
    [
      setPointerIndex,
      setRoundNumber,
      setStageNumber,
      setIsFateBox,
      setTimeLeft,
      setPaused,
      setIsMirrorStage,
    ],
  );

  useEffect(() => {
    if (stage !== "execution" || paused) return;
    if (timeLeft <= 0) {
      advanceStage();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, paused, timeLeft, advanceStage, setTimeLeft]);

  return {
    pointerIndex,
    roundNumber,
    stageNumber,
    isFateBox,
    isMirrorStage,
    timeLeft,
    paused,
    isPlayerStage,
    isCreepStage,
    nextOpponentIndex,
    startExecution,
    resetExecution,
    advanceStage,
    togglePause,
    hydrateExecution,
  };
}
