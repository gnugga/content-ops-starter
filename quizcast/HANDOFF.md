# HANDOFF

_Last updated: 2026-10-06 by Claude Code_

## Current state
- Milestone **M0 (concept + docs)** done. No code yet.
- Proposed direction: web MVP (phones = web app, TV = `/tv` web page) with a TypeScript game engine
  and a WebSocket room server. Native iOS AirPlay second screen comes later. See
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Last session
- Brainstormed game design → `docs/CONCEPT.md`
- Compared casting/tech options and picked an MVP stack → `docs/ARCHITECTURE.md`
- Set up agent files (`CLAUDE.md`, `AGENTS.md`), roadmap, decision log, question format

## Next tasks (M1)
1. Owner: answer the open questions below (at least name and stack approval).
2. Scaffold the monorepo in `quizcast/` (pnpm workspaces: `packages/engine`, `apps/server`, `apps/web`) and add commands to CLAUDE.md.
3. Implement `packages/engine`: state machine (lobby → deal → allocate → zwap → questions → score → end) + Vitest tests, using the sample pack from `docs/QUESTIONS_FORMAT.md`.

## Open questions (for the owner)
- Final name? ("QuizCast" is a placeholder.)
- OK to start web-first and add native iOS AirPlay later? Or go native iOS from day one?
- Languages at launch: Danish + English?
- Where do questions come from: handwritten, AI-generated and human-reviewed, or licensed?
- Business model: free with paid packs, one-time purchase, or ads?
- Legal: use our own names for mechanics (not "Bezzerwizzer"/"Zwap"), since those are trademarks.

## Gotchas
- This folder sits inside an unrelated repo (`content-ops-starter`). It may move to its own repo later.
