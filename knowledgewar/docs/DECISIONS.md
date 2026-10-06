# Decision log

Format: `## D<n>: title` · status (proposed/accepted/replaced) · date · one-paragraph why.

## D1: Web-first MVP, native casting later
proposed · 2026-10-06 · A web app with `/play` and `/tv` works on every device, needs no install, and
is fastest to iterate. True AirPlay second screen from the host iPhone needs native iOS, so it comes
after the game is fun.

## D2: Pure engine + authoritative server
proposed · 2026-10-06 · Rules in a pure TS package make them testable and reusable across web, native
and server. The server owns state and sends redacted views so nobody (host included) can cheat.

## D3: Host is a normal player
proposed · 2026-10-06 · The host gets controls (start/pause/skip/kick) but no extra information.
Judged answers are decided by player votes, not the host.

## D4: Own names for mechanics
proposed · 2026-10-06 · "Bezzerwizzer" and "Zwap" are trademarks. We use generic or our own names
(Bet, Swap, Steal) and our own wording of the rules.
