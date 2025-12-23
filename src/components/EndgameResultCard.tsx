import { Button, Card, CardBody } from "@heroui/react";
import { IconCircleCheck, IconMoodSad, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

type EndgameResult = "win" | "lose";

type EndgameResultCardProps = {
  result: EndgameResult;
  opponentName: string | null;
  onRestart: () => void;
  onBackToSetup: () => void;
  t: (key: string, ...args: string[]) => string;
};

export function EndgameResultCard({
  result,
  opponentName,
  onRestart,
  onBackToSetup,
  t,
}: EndgameResultCardProps) {
  const isWin = result === "win";
  return (
    <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
      <CardBody className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            {isWin ? <IconCircleCheck className="h-5 w-5 text-emerald-300" /> : <IconMoodSad className="h-5 w-5 text-rose-300" />}
            {t(isWin ? "endgameWinLabel" : "endgameLoseLabel")}
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl">{t(isWin ? "endgameWinTitle" : "endgameLoseTitle")}</h2>
            <p className="text-sm text-[var(--muted)]">{t(isWin ? "endgameWinDescription" : "endgameLoseDescription", opponentName ?? "")}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              type="button"
              onPress={onRestart}
              className="bg-[var(--accent)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:brightness-110"
            >
              <span className="flex items-center justify-center gap-2">
                <IconRefresh className="h-4 w-4" />
                {t("restart")}
              </span>
            </Button>
            <Button
              type="button"
              onPress={onBackToSetup}
              className="border border-white/10 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              <span className="flex items-center justify-center gap-2">
                <IconPlayerPlay className="h-4 w-4" />
                {t("backToSetup")}
              </span>
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
