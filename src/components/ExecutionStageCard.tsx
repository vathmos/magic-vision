import { Button, Card, CardBody } from "@heroui/react";
import {
  IconArrowsExchange,
  IconBat,
  IconGift,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconSwords,
  IconUser,
} from "@tabler/icons-react";

type Enemy = {
  id: string;
  name: string;
};

type ExecutionStageCardProps = {
  stageLabel: string;
  stageTitle: string;
  timeLeft: number;
  isFateBox: boolean;
  isCreepStage: boolean;
  isPlayerStage: boolean;
  isMirrorStage: boolean;
  nextOpponent: Enemy | null;
  canMirror: boolean;
  paused: boolean;
  onAdvanceStage: (forceMirror: boolean) => void;
  onTogglePause: () => void;
  t: (key: string, ...args: string[]) => string;
};

export function ExecutionStageCard({
  stageLabel,
  stageTitle,
  timeLeft,
  isFateBox,
  isCreepStage,
  isPlayerStage,
  isMirrorStage,
  nextOpponent,
  canMirror,
  paused,
  onAdvanceStage,
  onTogglePause,
  t,
}: ExecutionStageCardProps) {
  return (
    <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
      <CardBody className="px-6 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{stageLabel}</div>
              <h2 className="text-3xl">{stageTitle}</h2>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-2xl font-semibold">{timeLeft}s</div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[var(--surface-strong)] p-6">
            {isFateBox && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  <IconGift className="h-4 w-4" />
                  {t("stageFate")}
                </div>
                <div className="text-2xl font-semibold">{t("fateResolved")}</div>
                <p className="text-sm text-[var(--muted)]">{t("fateDescription")}</p>
              </div>
            )}
            {isCreepStage && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  <IconBat className="h-4 w-4" />
                  {t("creepStageLabel")}
                </div>
                <div className="text-2xl font-semibold">{t("creepTitle")}</div>
                <p className="text-sm text-[var(--muted)]">{t("creepDescription")}</p>
              </div>
            )}
            {isPlayerStage && isMirrorStage && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{t("mirrorStageLabel")}</div>
                <div className="text-2xl font-semibold">{t("mirrorTitle")}</div>
                <p className="text-sm text-[var(--muted)]">{t("mirrorDescription")}</p>
              </div>
            )}
            {isPlayerStage && !isMirrorStage && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  <IconSwords className="h-4 w-4" />
                  {t("nextOpponent")}
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
              onPress={() => onAdvanceStage(true)}
              className="border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex items-center justify-center gap-2">
                <IconArrowsExchange className="h-4 w-4" />
                {t("mirror")}
              </span>
            </Button>
            <Button
              type="button"
              onPress={() => onAdvanceStage(false)}
              className="bg-[var(--accent)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:brightness-110"
            >
              <span className="flex items-center justify-center gap-2">
                <IconPlayerSkipForward className="h-4 w-4" />
                {t("skip")}
              </span>
            </Button>
            <Button
              type="button"
              onPress={onTogglePause}
              className="border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--ink)] md:col-span-2"
            >
              <span className="flex items-center justify-center gap-2">
                {paused ? <IconPlayerPlay className="h-4 w-4" /> : <IconPlayerPause className="h-4 w-4" />}
                {paused ? t("resume") : t("pause")}
              </span>
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
