import { DiscoveryOrderCard } from "@/components/DiscoveryOrderCard";
import { ExecutionStageCard } from "@/components/ExecutionStageCard";
import { MatchOrderPanel } from "@/components/MatchOrderPanel";
import { PlayerRosterCard } from "@/components/PlayerRosterCard";
import { ThemeSwitcher } from "@/components/ThemeSwitch";
import { useDiscoveryOrder } from "@/hooks/useDiscoveryOrder";
import { useExecutionStage } from "@/hooks/useExecutionStage";
import { useRoster } from "@/hooks/useRoster";
import type { Stage } from "@/types/session";
import { createTranslator, type Language } from "@/utils/i18n";
import { getDiscoveryLabel, toRoman } from "@/utils/stages";
import { Button, Card, CardBody, Input, Select, SelectItem } from "@heroui/react";
import { IconArrowBackUp, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

const ROUND_COUNT = 7;
const ROUND_DURATION = 30;

type Enemy = {
  id: string;
  name: string;
};

const initialEnemyNames = Array.from({ length: ROUND_COUNT }, (_, index) => `P${index + 2}`);

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [stage, setStage] = useState<Stage>("setup");
  const [enemyNames, setEnemyNames] = useState<string[]>(initialEnemyNames);

  const enemies = useMemo<Enemy[]>(
    () =>
      enemyNames.map((name, index) => ({
        id: `enemy-${index}`,
        name: name.trim() || `P${index + 2}`,
      })),
    [enemyNames],
  );

  const enemyMap = useMemo(() => new Map(enemies.map((enemy) => [enemy.id, enemy])), [enemies]);
  const {
    eliminatedSet,
    activeEnemyCount,
    activePlayerCount,
    eliminate,
    revive,
    resetRoster,
  } = useRoster({ enemies });
  const {
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
  } = useDiscoveryOrder({ stage, enemies, roundCount: ROUND_COUNT });
  const {
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
  } = useExecutionStage({ stage, setStage, order, eliminatedSet, roundDuration: ROUND_DURATION });

  const canMirror = isPlayerStage && activePlayerCount % 2 === 1;
  const nextOpponentId = nextOpponentIndex !== null ? order[nextOpponentIndex] : null;
  const nextOpponent = nextOpponentId ? enemyMap.get(nextOpponentId) : null;
  const t = useMemo(() => createTranslator(language), [language]);
  const stageLabel = isFateBox ? t("stageFate") : `${toRoman(roundNumber)}-${stageNumber}`;
  const stageTitle = isFateBox
    ? t("stageFateTitle")
    : isCreepStage
      ? t("stageCreepTitle")
      : isMirrorStage
        ? t("stageMirrorTitle")
        : t("stagePlayerTitle");

  const handleStartDiscovery = () => {
    setStage("discovery");
    resetDiscovery();
    resetExecution();
    resetRoster();
  };

  const handleBackToSetup = () => {
    setStage("setup");
    resetDiscovery();
    resetExecution();
    resetRoster();
  };

  const handleStartExecution = () => {
    clearSelection();
    startExecution();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <div className="flex items-center gap-3">
            <Select
              variant="bordered"
              aria-label={t("switchLanguage")}
              selectedKeys={[language]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                if (value === "en" || value === "id") {
                  setLanguage(value);
                }
              }}
              className="w-[88px]"
            >
              <SelectItem key="en">EN</SelectItem>
              <SelectItem key="id">ID</SelectItem>
            </Select>
            <ThemeSwitcher />
          </div>
        </div>
        <div className="max-w-xl space-y-3">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Magic Vision
            </span>
            <h1 className="text-4xl md:text-5xl">{t("appTagline")}</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {t("appDescription")}
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
              {t("backToSetup")}
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
              {t("resetSession")}
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
          <MatchOrderPanel
            order={order}
            enemyMap={enemyMap}
            eliminatedSet={eliminatedSet}
            nextOpponentIndex={nextOpponentIndex}
            isMirrorStage={isMirrorStage}
            getDiscoveryLabel={getDiscoveryLabel}
            t={t}
          />
        )}

        {stage === "setup" && (
          <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
            <CardBody className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl">{t("setTheTable")}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {t("setupDescription")}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={`${t("player")} 1`}
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
                      label={`${t("player")} ${index + 2}`}
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
          <DiscoveryOrderCard
            order={order}
            enemyMap={enemyMap}
            selectedEnemyId={selectedEnemyId}
            setSelectedEnemyId={setSelectedEnemyId}
            availableEnemies={availableEnemies}
            eliminatedSet={eliminatedSet}
            activeDragPlayerId={activeDragPlayerId}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            placePlayerInSlot={placePlayerInSlot}
            startExecution={handleStartExecution}
            isDiscoveryComplete={isDiscoveryComplete}
            getDiscoveryLabel={getDiscoveryLabel}
            t={t}
          />
        )}

        {stage === "execution" && (
          <ExecutionStageCard
            stageLabel={stageLabel}
            stageTitle={stageTitle}
            timeLeft={timeLeft}
            isFateBox={isFateBox}
            isCreepStage={isCreepStage}
            isPlayerStage={isPlayerStage}
            isMirrorStage={isMirrorStage}
            nextOpponent={nextOpponent ?? null}
            canMirror={canMirror}
            paused={paused}
            onAdvanceStage={advanceStage}
            onTogglePause={togglePause}
            t={t}
          />
        )}

        {stage === "execution" && (
          <PlayerRosterCard
            enemies={enemies}
            eliminatedSet={eliminatedSet}
            activeEnemyCount={activeEnemyCount}
            onEliminate={eliminate}
            onRevive={revive}
            t={t}
          />
        )}
      </motion.main>
    </div>
  );
}
