# Roadmap

## M0: Concept & docs
- [x] Game concept brainstorm
- [x] Architecture options + recommendation
- [x] Agent handoff files (CLAUDE.md, AGENTS.md, HANDOFF.md)

## M1: Engine
- [ ] Monorepo scaffold (pnpm, TS strict, Vitest)
- [ ] Question pack format + validator + sample pack
- [ ] State machine: lobby → deal → bet → swap → questions → score → end
- [ ] Answer matching (multiple choice, fuzzy text, numeric closest)
- [ ] `viewFor()` redaction + tests (no secret leaks)

## M2: Server + phone UI
- [ ] WebSocket room server (create/join by code, reconnect)
- [ ] `/play`: join, bet, swap, answer, host ⚙️ menu
- [ ] Playable end-to-end with several browser tabs

## M3: TV view + casting
- [ ] `/tv`: lobby QR, board/track, question + timer, reveal, scoreboard
- [ ] Test on Chromecast/smart-TV browser and AirPlay from Mac/iPad
- [ ] Sounds + animations

## M4: Content & polish
- [ ] DA + EN packs (≥ 500 questions)
- [ ] Teams mode, kid mode, game length presets
- [ ] Spike: native iOS wrapper with AirPlay second screen
- [ ] Spike: Google Cast receiver
