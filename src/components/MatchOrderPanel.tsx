import { Card, CardBody, CardHeader, Chip } from "@heroui/react";

type Enemy = {
  id: string;
  name: string;
};

type MatchOrderPanelProps = {
  order: (string | null)[];
  enemyMap: Map<string, Enemy>;
  eliminatedSet: Set<string>;
  nextOpponentIndex: number | null;
  isMirrorStage: boolean;
  getDiscoveryLabel: (index: number) => string;
  t: (key: string, ...args: string[]) => string;
};

export function MatchOrderPanel({
  order,
  enemyMap,
  eliminatedSet,
  nextOpponentIndex,
  isMirrorStage,
  getDiscoveryLabel,
  t,
}: MatchOrderPanelProps) {
  return (
    <Card className="border border-white/10 bg-[var(--surface)] shadow-[0_18px_45px_var(--shadow)]">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <h2 className="text-xl">{t("matchOrder")}</h2>
        <Chip className="border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {t("locked")}
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
                  isNext ? "border-[var(--accent)] bg-[var(--surface-strong)]" : "border-white/10 bg-transparent"
                }`}
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    {getDiscoveryLabel(index)}
                  </div>
                  <div className="font-medium">{enemy ? enemy.name : t("unassigned")}</div>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {enemy && eliminatedSet.has(enemy.id) ? t("eliminated") : isNext ? t("next") : ""}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
