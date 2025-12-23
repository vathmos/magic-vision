import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { IconUser, IconUserCancel, IconPlayerPlay, IconSkull, IconCoffin } from "@tabler/icons-react";

type Enemy = {
  id: string;
  name: string;
};

type PlayerRosterCardProps = {
  enemies: Enemy[];
  eliminatedSet: Set<string>;
  activeEnemyCount: number;
  onEliminate: (enemyId: string) => void;
  onRevive: (enemyId: string) => void;
  t: (key: string, ...args: string[]) => string;
};

export function PlayerRosterCard({
  enemies,
  eliminatedSet,
  activeEnemyCount,
  onEliminate,
  onRevive,
  t,
}: PlayerRosterCardProps) {
  return (
    <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl">{t("playerRoster")}</h2>
        </div>
        <Chip className="border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {activeEnemyCount} {t("active")}
        </Chip>
      </CardHeader>
      <CardBody className="px-6 pb-6 pt-0">
        <p className="mt-2 text-sm text-[var(--muted)]">{t("rosterDescription")}</p>
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
                    eliminatedSet.has(enemy.id) ? onRevive(enemy.id) : onEliminate(enemy.id)
                  }
                  variant="bordered"
                  isIconOnly
                  className={`h-9 w-9 p-0 ${
                    eliminatedSet.has(enemy.id)
                      ? "border-[var(--success)] text-[var(--success)]"
                      : "border-[var(--danger)] text-[var(--danger)]"
                  }`}
                  aria-label={
                    eliminatedSet.has(enemy.id) ? t("revivePlayer") : t("eliminatePlayer")
                  }
                >
                  {eliminatedSet.has(enemy.id) ? (
                    <IconCoffin className="h-6 w-6" />
                  ) : (
                    <IconSkull className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
