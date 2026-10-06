# CLAUDE.md: KnowledgeWar

You are working on **KnowledgeWar**, a phone party trivia game (Bezzerwizzer-like) where a host phone
casts the board/questions to a TV and still plays as a normal player.

This project is worked on by **both Claude Code and Codex**. Keep the handoff files accurate so
the other agent can continue without re-reading everything.

## Read order (keep it cheap)
1. `HANDOFF.md`: current state, next tasks, open questions. Usually enough.
2. Only if needed: `docs/ROADMAP.md`, `docs/DECISIONS.md`, then `docs/CONCEPT.md` / `docs/ARCHITECTURE.md`.

## Rules
- All game code lives under `knowledgewar/`. Do not touch the rest of this repo (an unrelated Next.js site).
- Game rules go in the pure engine (`packages/engine`) with no network/UI code. Server and clients only
  call the engine. Unit-test the engine.
- The server is authoritative. Clients never get hidden info (other players' bets, the correct
  answer before reveal). **This also applies to the host's phone**: the host is a player.
- TypeScript everywhere, strict mode. Small files, small PRs.
- Record any non-trivial choice in `docs/DECISIONS.md` (one short entry).

## Before ending a session (required)
Update `HANDOFF.md`:
- "Last session": 3–6 bullets on what changed
- "Next tasks": the top 3, concrete
- "Open questions": add/remove
- Tick boxes in `docs/ROADMAP.md`
Commit with a clear message.

## Commands
Run from `knowledgewar/`: `pnpm install`, `pnpm test`, `pnpm typecheck`.
