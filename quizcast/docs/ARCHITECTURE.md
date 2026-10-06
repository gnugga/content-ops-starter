# Architecture (brainstorm + recommendation)

## The core technical problem
The host phone must show **one thing on its own screen** (player UI) and **something different on the
TV** (board). Plain screen mirroring does not do that. Options:

| # | Approach | How the TV gets the board | Pros | Cons |
|---|---|---|---|---|
| 1 | **Web app + cloud room server** | TV/Apple TV/Chromecast/smart-TV browser opens `…/tv?room=ABCD` | Works on any TV/phone, no install, fastest to build, easy for AI agents | Apple TV has no browser; needs AirPlay from a laptop/iPad, or option 2/3 |
| 2 | **Native iOS app + AirPlay external display** | Host iPhone renders a second `UIWindowScene` on the AirPlay screen (not a mirror) | Exactly the vision: the phone casts the board to Apple TV while showing player UI | iOS only; native code; Android needs Cast |
| 3 | **tvOS app** | Apple TV runs the board app and phones connect | Best TV experience, remote-friendly | Extra app and App Store review; Apple only |
| 4 | **Google Cast receiver** | Phone casts a web receiver app to Chromecast/Google TV | Real second screen on Android/Chromecast | Cast SDK setup, Google-only |

### Recommendation
- **MVP = option 1.** Shared TypeScript game engine + WebSocket room server + one web app with two views:
  `/play` (phones) and `/tv` (board). Phones join by scanning the QR shown on the TV.
- **Then wrap the phone app** (Capacitor or Expo/React Native) and add **option 2 (AirPlay second
  screen)** on iOS and **option 4 (Cast)** on Android. The TV view stays the same web page or
  component, so it is mostly reused.
- Because rules live in a pure engine and the server is authoritative, swapping transport/clients later is cheap.

## Proposed stack
```
quizcast/
  packages/
    engine/      # pure TS: state machine, rules, scoring, answer matching. No I/O. Vitest.
    protocol/    # shared message types (zod schemas)
    content/     # question packs (JSON) + validator
  apps/
    server/      # WebSocket rooms (PartyKit / Cloudflare Durable Objects, or Node + ws)
    web/         # React + Vite (+ Tailwind): routes /play and /tv
```
- pnpm workspaces, TypeScript strict, Vitest, ESLint/Prettier.
- One room = one server instance holding the authoritative `GameState`.

## Game state machine
```
LOBBY → DEAL → BET → SWAP → QUESTION_LOOP → ROUND_SCORE → (DEAL | GAME_OVER)
QUESTION_LOOP: ASK → (STEAL_WINDOW) → ANSWER → REVEAL → next
```
Engine API idea: `reduce(state, action) → state` + `viewFor(state, playerId | 'tv') → redacted view`.
`viewFor` is where secrets get removed. It is the most important function to test.

## Messages (sketch)
Client → server: `join{name,avatar}`, `start{settings}`, `bet{allocation}`, `swap{myCat,theirPlayer,theirCat}`,
`steal{}`, `answer{value}`, `vote{ok}`, `host{pause|skip|kick}`.
Server → client: `state{view}` (full redacted view each change; simple and resilient to reconnects),
`error{code}`.

## Trust & fairness
- Correct answers never leave the server before REVEAL.
- Each socket only gets `viewFor(its player)`; the TV gets `viewFor('tv')`.
- The host role only adds the controls in `host{…}`. It never adds visibility.

## Non-goals for MVP
Accounts, payments, matchmaking with strangers, native apps.
