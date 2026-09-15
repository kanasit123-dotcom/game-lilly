# Lilly Game Handoff Memory

Updated: 2026-09-15
Branch: `main`
Remote: `https://github.com/kanasit123-dotcom/game-lilly.git`
Live site: `https://kanasit123-dotcom.github.io/game-lilly/`
Latest completed commit before this memory: see `git log`

## User Intent

- This is a learning game for Lilly, aimed roughly at kindergarten 2-3.
- Do not add more lesson levels. Wait for feedback from real play on the iPad first.
- Lilly especially likes seals, turtles, and rabbits.
- Do not use bears, pigs, hippos, or dogs in production content or rewards. Koala counts as a bear (Thai: หมีโคอาลา) and teddy-bear emoji 🧸 counts too — the koala buddy became a squirrel on 2026-09-15.
- Other animals and insects are acceptable.
- The experience should be cute, calm, readable, touch-friendly, and usable on mobile.

## Current Product State

- There are 124 levels: 92 original levels plus 32 newer teaching levels.
- Newer content includes family terms, Thai vowels/final consonants, English, arithmetic, place value, patterns, feelings, routines, and nature.
- Existing saved progress is stored under localStorage key `lilly-world-v1`; preserve its shape and old level IDs.
- The app is a static JavaScript PWA with no build step.
- Service worker cache is currently `lilly-world-v16`. Bump the version for the next deployed release when shell files change.
- All mini-games are finite. They finish by goal or after `BREAK_SECONDS` (180 s) and offer the next level.

## Character Art

Production transparent PNG cutouts:

- `assets/friends/seal.png`
- `assets/friends/turtle.png`
- `assets/friends/rabbit.png`

Render them through `animalHTML()` in `js/assets.js`. Do not return to emoji for these three characters. The older combined image `assets/lilly-friends.png` remains only as a design/style reference.

The transparent cutouts were created with the built-in ImageGen tool from the original lineup. Prompt intent: isolate one character at a time, preserve identity/colors/outfit/picture-book style, use genuine transparent alpha, and include no text, scenery, border, or other characters.

## Child-facing UI (rewritten 2026-09-15, after the header/dashboard version was found too hard for a 5-year-old)

Rule: Lilly cannot read yet. Every screen must work by pictures + sound alone.

- `js/screens/home.js`: three friend portraits (tap = pick buddy, spoken), one big "เล่นเลย" button to the map, two picture tiles (พักเล่น / ตู้รางวัล), small parent link. No stats, no text lists.
- `js/screens/map.js`: winding path with big level nodes (icon, number, stars) and subject chips with icons. `WORLDS` in `levels.js` adds signposts; the 32 newer lessons sit under "บ้านของเรา" (index 92). Speaks "เลือกด่านที่อยากเล่นได้เลย" on entry.
- `js/screens/menu.js`: only `topBar(title)` + `bindTopBar(el)` (🏠 back button, title, star count). No header nav.
- `js/screens/mini.js`: playroom = big emoji tiles, unlocked first; locked tiles show 🔒 + stars needed and speak the requirement. `BREAK_SECONDS = 180` is the per-round limit (was 90). End screen offers next level / another game / home.
- `js/screens/result.js`: star animation, spoken praise, reward popups, big "ด่านต่อไป", then เล่นอีกรอบ / แผนที่ / พักเล่น.
- `js/screens/game.js`: every game has a big 🔊 button that replays the current question via `replay()` from `audio.js`.

## Daily mission (`js/mission.js`, added 2026-09-15)

- Each day picks 3 levels from 3 subjects (math + thai always, third from en/en/brain/family/life), preferring unplayed levels among the first 4 in difficulty order. Stored in `mini.mission {date, ids, done}`; regenerated when the date changes.
- Completing all 3 awards one sticker (`mini.stickers[YYYY-MM-DD]`), shown as a popup on the result screen and on the `calendar` route (month grid, ◀ ▶ navigation). Home shows the mission card with ✓ marks; the map pins undone mission levels with 📌; the result screen's big button becomes "ภารกิจต่อไป" while a mission level was just played.
- No penalty for skipping days; nothing is locked.

## Audio contract (`js/audio.js`)

- `speak(text, lang)` returns a Promise that resolves when speech ends. It defers the actual `speak()` 60 ms after `cancel()` (iOS/Chrome drop the utterance otherwise), calls `resume()` first, and still speaks with `u.lang` when no matching voice object is found yet.
- `speakPrompt(text, lang)` = speak + remember for the 🔊 button. `setReplay(fn)` lets an engine replay a whole sequence. `replay()` is what the button calls. The router clears it on every route change.
- `langOf(text)` picks en-US when Latin letters are present, otherwise th-TH.
- `js/games/lesson.js` reads intro + every teaching card, then each question prompt + every option in order with a yellow `.reading` highlight; tapping a card/option re-reads it; a correct answer auto-advances after the explanation is spoken (no "next" button).
- Sound can be switched off on the parent page (`preferences.sound`). If "no sound" is reported, check that toggle first.

## Recent Mini-game Polish

- Coloring has persistent Undo and keyboard-accessible SVG regions.
- Dress-up has head/face/neck/left/right placement controls and horizontal item trays.
- Garden has a 3-plant goal, clearer feedback, old-save compatibility, and cleanup.
- Fishing has a 5-catch goal, clear feedback, and friends that cannot be caught.
- Balloons and fishing remain playable with motion disabled by showing static targets.
- Parent settings include sound and motion toggles.
- Home shows the three friends, one play button, playroom/rewards tiles and the star total; daily counts live only in localStorage (`dailyActivity`).

## Verification

The main regression script is `tests/game.cjs`. It covers all 124 levels, all 14 mini-games, saved-state compatibility, responsive layouts, keyboard controls, reduced motion, transparent assets, and offline loading.

Use the Codex bundled Playwright runtime on this machine:

```powershell
$env:NODE_PATH='C:\Users\kanas\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& 'C:\Users\kanas\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tests/game.cjs
```

Local preview currently uses:

```text
http://127.0.0.1:5173/
```

Before finishing any UI work:

1. Run `node --check` on all JavaScript files.
2. Run `tests/game.cjs`.
3. Inspect `tests/screenshots/home-mobile.png` and any new menu screenshots visually.
4. Run `git diff --check`.
5. Confirm the disliked animals do not appear in production HTML/CSS/JS.
6. Commit and push to `origin/main`, then verify the remote commit hash and GitHub Pages service worker version.

## For the next graphics / design pass (read before touching any screen)

The previous visual redesign (header nav, dashboard stats, text-only level list, radio buttons) looked polished but a 5-year-old could not use it, so it was replaced. Improve the look freely — palette, illustrations, backgrounds, icons, animations, typography — but keep these rules:

- Child screens (home, map, playroom, rewards, result, calendar, every game) stay picture-first: big tap targets (≥ 56 px), one obvious primary action, no statistics, tables, paragraphs, tabs, radio/checkbox controls or text-only lists. Those belong on the parent page (`summary`) only.
- Keep the DOM hooks the app and `tests/game.cjs` rely on: `.home-friends`, `[data-buddy]`, `#play`, `.mission-level`, `#calendar`, `.map-wrap`/`.node`/`.chip`, `.playroom-item[data-mini]`, `#back`, `#replay`, `#finish-break`, `#return-lesson`, `#finish-today`, `.result` with `#next/#again/#map/#break`, `#practice`, `.learning-answer`, `.reading`, `#st-cal`, `.cal-day.got`.
- Keep every spoken cue: screens speak on entry, lessons read prompt + options, the 🔊 button replays. Never remove `speakPrompt`/`setReplay` calls from engines.
- Use `animalHTML()` for seal/turtle/rabbit; new character art goes in `assets/friends/` as transparent PNG with the same ids.
- Avoid emoji newer than iOS 15 (🩷 🫧 🪿 …) — older iPads render them as boxes.
- `css/lilly.css` is the theme layer; game geometry lives in `css/style.css`. Prefer editing lilly.css.
- Bump `CACHE` in `sw.js` and run `tests/game.cjs` before pushing.

## Known follow-ups (not started)

1. Parent page is reachable with a single tap; the sound checkbox there silences the whole game. Make entering `summary` a 2-second hold like the reset button.
2. Replace 🩷 (`js/games/quiz.js` colors) and 🫧 (`js/mini/aquarium.js`) with widely supported emoji.
3. Backup/restore progress with a short code so iPad and phone can share stars and stickers.
4. Voice recording in reading levels (listen → repeat → play back own voice).

## Important Constraints

- Do not reset or replace the localStorage schema.
- Do not rename existing level IDs or routes.
- Do not remove finite mini-game completion or route cleanup.
- Do not commit `tests/screenshots/` or `design/review/`; both are intentionally ignored.
- Work with existing code and styles rather than introducing a framework or build system.
- Keep every child-facing screen picture-first with spoken guidance; no stats, tables or text lists for the child (those belong on the parent page only).
