export type DragData =
  | { type: "pool"; playerId: string }
  | { type: "slot"; playerId: string; index: number };
