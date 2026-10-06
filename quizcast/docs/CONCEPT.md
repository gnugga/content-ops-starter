# Game concept (brainstorm)

## Pitch
Living-room trivia where **everyone plays on their phone** and the **TV is the game board**.
The host's phone starts the room and casts the board to the TV, but the host is just another player.
The board-game feeling (shared board, tension, reveals) stays, and the paperwork goes away (secret
bets, scoring, timers).

## Core loop (Bezzerwizzer-inspired, our own names)
1. **Deal**: each player gets a private hand of 4 categories (e.g. Food, Film, Sport, Science).
2. **Bet**: on their phone, each player secretly assigns point values **1–4** to their categories
   (high value on what you know best). Hidden from everyone, host included.
3. **Swap** (Bezzerwizzer's "Zwap"): each player may swap one of their categories with one from an opponent
   to dump a bad category on them or steal a good one. The TV shows *that* a swap happened, not the bets.
4. **Questions**: the TV goes player by player, category by value order. The question is shown on the
   TV and the active player answers on their phone.
5. **Steal token** (Bezzerwizzer's "Bezzerwizzer" token): once per round, any other player can jump
   in on someone else's question. Right means bonus points; wrong costs a step.
6. **Score**: points move tokens along the track on the TV. First to the finish line wins.

Why phones make it better: bets are truly secret, scoring is automatic, and timers and reveals can
be dramatic on the big screen.

## Answer types
| Type | Input on phone | Scoring |
|---|---|---|
| Multiple choice | 4 buttons | automatic |
| Free text | keyboard | fuzzy match against accepted answers; otherwise vote |
| Number / year | number pad | exact or closest wins |
| Order / sort | drag list | automatic |
| Judge (fallback) | free text | other players vote 👍/👎 on their phones |

Avoid "the host judges" as the default: the host is playing and should not have extra power.

## Screens
**TV (shared, no secrets)**
- Lobby: big room code + QR to join, avatars appearing
- Board: track with player tokens, whose turn it is, category icon + value (after reveal)
- Question + countdown timer, then answer reveal with animation and sound
- Scoreboard between rounds, final podium

**Phone (every player, including the host)**
- Join: name, avatar, color
- Private hand + bet allocation (drag values onto categories)
- Swap picker, steal button (shown live while someone else answers)
- Answer input for the current question type
- Small personal recap ("you gained 3")

**Host-only extras on the host phone** (tucked into a ⚙️ menu so normal play is the same as everyone else's)
- Start the game, pick question packs and game length
- Pause / skip question / kick player / end game
- Start casting (AirPlay / Cast button) or show the "open this URL on your TV" instructions
- The host's phone never receives answers or other players' bets early (server enforces this)

## Party features (later)
- 2–8 players; **teams mode** (one phone per team, or several phones per team that vote)
- Kid mode / family packs with age-appropriate questions
- Language packs: Danish + English first
- Game length presets: Quick (15 min), Normal (30), Long (45+)
- Spectator / "audience" phones that can vote on judge questions
- Reconnect: a phone that drops can rejoin the same seat with the room code
- Custom packs: friends write their own questions (great for birthdays/office parties)
- "No TV" fallback: one tablet in the middle acts as the board

## Ideas parking lot
- Daily online challenge with the same questions for everyone
- Category draft instead of random deal
- Power-ups (double points, 50/50, extra time) bought with round bonuses
- Seasonal packs (Christmas, Eurovision, World Cup)
- AI-assisted pack generation with human review
