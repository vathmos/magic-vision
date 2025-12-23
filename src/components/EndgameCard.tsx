import { Button, Card, CardBody } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay, IconPlayerSkipForward, IconStopwatch, IconSwords } from "@tabler/icons-react";

type EndgameCardProps = {
  stageLabel: string;
  stageTitle: string;
  timeLeft: number;
  paused: boolean;
  opponentName: string | null;
  onWin: () => void;
  onLose: () => void;
  onAdvanceStage: (forceMirror: boolean) => void;
  onTogglePause: () => void;
  t: (key: string, ...args: string[]) => string;
};

export function EndgameCard({
  stageLabel,
  stageTitle,
  timeLeft,
  paused,
  opponentName,
  onWin,
  onLose,
  onAdvanceStage,
  onTogglePause,
  t,
}: EndgameCardProps) {
  return (
    <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
      <CardBody className="flex h-full flex-col items-center justify-center px-8 py-10 text-center">
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{stageLabel}</div>
            <h2 className="text-2xl">{stageTitle}</h2>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            <IconSwords className="h-4 w-4" />
            {t("endgameLabel")}
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl md:text-4xl">{t("endgameTitle")}</h3>
            <p className="text-sm text-[var(--muted)]">{t("endgameDescription", opponentName ?? "")}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-2xl font-semibold">
            <IconStopwatch className="h-8 w-8 text-[var(--muted)]" />
            <div className="rounded-full border border-white/10 px-4 py-2">{timeLeft}s</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
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
              className="border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              <span className="flex items-center justify-center gap-2">
                {paused ? <IconPlayerPlay className="h-4 w-4" /> : <IconPlayerPause className="h-4 w-4" />}
                {paused ? t("resume") : t("pause")}
              </span>
            </Button>
            <Button
              type="button"
              onPress={onWin}
              className="border border-emerald-400/50 bg-emerald-500/20 px-4 py-3 text-xs uppercase tracking-[0.25em] text-emerald-100 transition hover:bg-emerald-500/30"
            >
              {t("iWin")}
            </Button>
            <Button
              type="button"
              onPress={onLose}
              className="border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-xs uppercase tracking-[0.25em] text-rose-100 transition hover:bg-rose-500/25"
            >
              {t("iLose")}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
