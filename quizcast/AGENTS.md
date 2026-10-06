# AGENTS.md: QuizCast (for Codex and other agents)

Same instructions as [CLAUDE.md](CLAUDE.md). Read that file; it is the single source of truth.

Short version:
1. Read `HANDOFF.md` first. It has the current state and next tasks.
2. Work only inside `quizcast/`.
3. Game rules live in a pure, tested engine; server is authoritative; no hidden info leaks to any
   phone, including the host's.
4. Before you stop: update `HANDOFF.md` (last session, next 3 tasks, open questions), tick
   `docs/ROADMAP.md`, log decisions in `docs/DECISIONS.md`, commit.
