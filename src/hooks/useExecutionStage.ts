import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Stage } from "@/types/session";

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
  stage: Stage;
  setStage: Dispatch<SetStateAction<Stage>>;
  order: (string | null)[];
  eliminatedSet: Set<string>;
  roundDuration: number;
};

export function useExecutionStage({
  stage,
  setStage,
  order,
  eliminatedSet,
  roundDuration,
}: UseExecutionStageParams) {
  const [pointerIndex, setPointerIndex] = useState(-1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [stageNumber, setStageNumber] = useState(1);
  const [isFateBox, setIsFateBox] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [paused, setPaused] = useState(false);
  const [isMirrorStage, setIsMirrorStage] = useState(false);

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
    setPointerIndex(-1);
    setRoundNumber(1);
    setStageNumber(1);
    setIsFateBox(false);
    setTimeLeft(roundDuration);
    setPaused(false);
    setIsMirrorStage(false);
  }, [roundDuration]);

  const startExecution = useCallback(() => {
    setStage("execution");
    setRoundNumber(2);
    setStageNumber(6);
    setIsFateBox(false);
    setPointerIndex(-1);
    setTimeLeft(roundDuration);
    setPaused(false);
    setIsMirrorStage(false);
  }, [roundDuration, setStage]);

  const advanceStage = useCallback(
    (forceMirror = false) => {
      if (stage !== "execution") return;
      if (isFateBox) {
        setIsFateBox(false);
        setIsMirrorStage(false);
        setRoundNumber((round) => round + 1);
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
        setStageNumber((current) => current + 1);
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
      stageNumber,
      stagesThisRound,
      roundDuration,
    ],
  );

  const togglePause = useCallback(() => {
    setPaused((current) => !current);
  }, []);

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
    [],
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
