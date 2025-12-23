# Magic Vision

Magic Vision is a simple auto-battler matchmaking predictor for the game Magic Chess: GO GO.

## Using the tool

- Enter player names in setup.
- In discovery, place each player into a stage slot.
- Continue to execution to see the next opponent each round.
- Use Mirror, Skip, and Pause to control the flow.

## Features

- Drag and drop or click-to-place for discovery.
- Swap, replace, and return players to the pool while discovering.
- Deterministic order with a visible pointer and skip logic.
- Endgame view when only one opponent remains.
- English and Indonesian language toggle.
- Light and dark themes.

## Controls

- Mirror: only enabled on player stages when player count is odd. Freezes the pointer.
- Skip: advances the timer and stage with normal rules.
- Pause: stops the timer without changing logic.
- Eliminate/Revive: toggle per player in the roster.

## Getting started

```bash
bun install
bun dev
```

Open `http://localhost:3000`.

## Scripts

- `bun dev` - start the dev server
- `bun run build` - build for production
- `bun run start` - run the production server
- `bun run lint` - lint the codebase

## Tech stack

- Next.js 15
- React 19
- TypeScript
- HeroUI
- dnd-kit
- Tailwind CSS
- Framer Motion
