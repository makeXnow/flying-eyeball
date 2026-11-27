# Flying Eyeball

Global leaderboard flying eyeball game!

## Note
This is the first working stable fun version.

## Development
This project is a PWA-ready web game using HTML5 Canvas and Tailwind CSS.

## Natalia mode

Open `/Natalia` (also `/natalia`, with an optional trailing slash) under the app URL.
Natalia uses the same movement, collision size, rewards, and animated wings as classic mode.
Fruit pickups blend their colors across her face, fading over 2.25 seconds.

- `art/natalia-face.png`: transparent face sprite with direct eye contact.
- `art/natalia-preview.png`: approved gradient concept.
- `art/natalia-splashscreen.png`: splash screen used only for Natalia mode.

The main leaderboard includes all runs; the Natalia leaderboard includes only Natalia runs.
A Natalia run occupies one database row, so qualifying on both boards never duplicates it.
The main board is shown first when a score qualifies there; otherwise the Natalia board is shown.
Ties keep the older entry ahead. Players can switch boards and see their saved result before restarting.

## Special modes

Open `/SpecialMode` to choose Eyeball, Milana, Giavana, Lorenzo, Melanie, or Natalia.
Each person has a direct URL (`/Milana`, `/Giavana`, `/Lorenzo`, `/Melanie`, `/Natalia`),
a transparent sprite at `art/<name>-face.png`, and a separate leaderboard with main-board eligibility.
Each face mode also uses its own matching illustrated splash screen at
`art/<name>-splashscreen.png`, preloaded and selected before the first paint.
`/Eyeball` opens the original mode. The same routes work under the app's hosting prefix,
with lowercase names or a trailing slash. The picker is also available at `/special-mode`.
The new faces keep the same wings, movement, collision radius, and nose-outward color bursts.
Each face has optimized smile and surprise assets at `art/<name>-face-smile.webp` and
`art/<name>-face-surprise.webp`. The picker gently rocks and alternates expressions every
second, with staggered timing and a still smile for reduced-motion preferences.
Starting delays use randomly assigned slots separated by `1 second / number of faces`
(currently 0, 0.2, 0.4, 0.6, and 0.8 seconds). All decoded faces start on a shared frame,
and the spacing automatically adjusts when the character list grows.
Each face card gets 1–4 randomly selected fruit decorations in random corner positions on each visit.
During gameplay, any active fruit-color burst shows the surprised expression; the smile
returns after the last burst expires (2.25 seconds after the most recent pickup), or on reset.
No additional database migration is needed: modes use the existing `scores.mode` column.

## Testing and deployment

Run `npm test` with Node 22.13+ (uses Node's built-in SQLite).
Deploy with `npm run deploy` after authenticating Wrangler to the existing Cloudflare account.
This applies the additive D1 migration before deploying Pages. **Do not deploy the new API before
applying `migrations/0002_natalia.sql`**: the API requires the new `mode` column.

