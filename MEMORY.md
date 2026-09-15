# Lilly Game Handoff Memory

Updated: 2026-09-15
Branch: `main`
Remote: `https://github.com/kanasit123-dotcom/game-lilly.git`
Live site: `https://kanasit123-dotcom.github.io/game-lilly/`
Latest completed commit before this memory: `4d9b1d3`

## User Intent

- This is a learning game for Lilly, aimed roughly at kindergarten 2-3.
- Do not add more lesson levels in the next task. The next focus is improving the main menu/navigation UI.
- Lilly especially likes seals, turtles, and rabbits.
- Do not use bears, pigs, hippos, or dogs in production content or rewards.
- Other animals and insects are acceptable.
- The experience should be cute, calm, readable, touch-friendly, and usable on mobile.

## Current Product State

- There are 124 levels: 92 original levels plus 32 newer teaching levels.
- Newer content includes family terms, Thai vowels/final consonants, English, arithmetic, place value, patterns, feelings, routines, and nature.
- Existing saved progress is stored under localStorage key `lilly-world-v1`; preserve its shape and old level IDs.
- The app is a static JavaScript PWA with no build step.
- Service worker cache is currently `lilly-world-v14`. Bump the version for the next deployed release when shell files change.
- All mini-games are finite. They finish by goal or after a maximum 90-second break and return to learning.

## Character Art

Production transparent PNG cutouts:

- `assets/friends/seal.png`
- `assets/friends/turtle.png`
- `assets/friends/rabbit.png`

Render them through `animalHTML()` in `js/assets.js`. Do not return to emoji for these three characters. The older combined image `assets/lilly-friends.png` remains only as a design/style reference.

The transparent cutouts were created with the built-in ImageGen tool from the original lineup. Prompt intent: isolate one character at a time, preserve identity/colors/outfit/picture-book style, use genuine transparent alpha, and include no text, scenery, border, or other characters.

## Menu Work Next

Primary files:

- `js/screens/menu.js`: shared header markup, route buttons, category metadata.
- `css/lilly.css`: `.lilly-header`, `.lilly-brand`, navigation, responsive behavior.
- `js/screens/home.js`: home content immediately below the menu.
- `js/main.js` and `js/router.js`: route registration and cleanup behavior.

Current routes that must keep working:

- `home`: วันนี้
- `map`: บทเรียน
- `playroom`: พักเล่น
- `rewards`: รางวัล
- `summary`: สำหรับผู้ปกครอง/settings

Recommended direction:

- Keep the restrained desktop header.
- On phones, consider a stable bottom navigation with four child-facing destinations and keep the parent/settings entry separate at the top.
- Preserve `data-route`, `aria-current="page"`, `menuHeader(active)`, and `bindMenu(el)` so screens do not need separate navigation logic.
- Use the bundled Lucide icons through `iconHTML()`. Do not add a new icon dependency.
- Avoid large marketing-style headers, nested cards, pill-heavy controls, or instructional text explaining the UI.
- Keep tap targets at least about 44 px and ensure Thai labels fit at 320, 390, 768, and 1280 px.
- Account for mobile safe areas if adding bottom navigation, and add enough page bottom padding so content is never hidden behind it.

## Recent Mini-game Polish

- Coloring has persistent Undo and keyboard-accessible SVG regions.
- Dress-up has head/face/neck/left/right placement controls and horizontal item trays.
- Garden has a 3-plant goal, clearer feedback, old-save compatibility, and cleanup.
- Fishing has a 5-catch goal, clear feedback, and friends that cannot be caught.
- Balloons and fishing remain playable with motion disabled by showing static targets.
- Parent settings include sound and motion toggles.
- Home shows today's lesson count, break count, and earned stars.

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

Before finishing menu work:

1. Run `node --check` on all JavaScript files.
2. Run `tests/game.cjs`.
3. Inspect `tests/screenshots/home-mobile.png` and any new menu screenshots visually.
4. Run `git diff --check`.
5. Confirm the disliked animals do not appear in production HTML/CSS/JS.
6. Commit and push to `origin/main`, then verify the remote commit hash and GitHub Pages service worker version.

## Important Constraints

- Do not reset or replace the localStorage schema.
- Do not rename existing level IDs or routes.
- Do not remove finite mini-game completion or route cleanup.
- Do not commit `tests/screenshots/` or `design/review/`; both are intentionally ignored.
- Work with existing code and styles rather than introducing a framework or build system for a menu-only change.
