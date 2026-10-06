# HANDOFF

_Last updated: 2026-10-06 by Claude Code_

## Current state
- M0 done. M1 in progress: engine written (untested).
- Proposed direction: web MVP (phones = web app, TV = `/tv` web page) with a TypeScript game engine
  and a WebSocket room server. Native iOS AirPlay second screen comes later. See
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Last session
- Renamed project to **KnowledgeWar**. Owner approved web-first.
- Scaffolded pnpm workspace + `packages/engine` (types, seeded rng, answer matching, pack validator, reducer, `viewFor`). Typechecks. **No tests yet.**
- Brainstormed game design → `docs/CONCEPT.md`
- Compared casting/tech options and picked an MVP stack → `docs/ARCHITECTURE.md`
- Set up agent files (`CLAUDE.md`, `AGENTS.md`), roadmap, decision log, question format

## Next tasks (M1)
1. Write Vitest tests for `packages/engine` (full round, steal, swap, kick, viewFor redaction, match) and run `pnpm test`.
2. Add a sample question pack (see `docs/QUESTIONS_FORMAT.md`) as a test fixture.
3. Resolve the "local" question below, then update `docs/ARCHITECTURE.md`.

## Open questions (for the owner)
- Owner said "I want this project to be local". Unclear: local Wi-Fi play with no cloud server, its own repo, or not on GitHub? Ask before M2 server work.
- Languages at launch: Danish + English?
- Where do questions come from: handwritten, AI-generated and human-reviewed, or licensed?
- Business model: free with paid packs, one-time purchase, or ads?
- Legal: use our own names for mechanics (not "Bezzerwizzer"/"Zwap"), since those are trademarks.

## Gotchas
- This folder sits inside an unrelated repo (`content-ops-starter`). It may move to its own repo later.
