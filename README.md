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
`/Eyeball` opens the original mode. The same routes work under the app's hosting prefix,
with lowercase names or a trailing slash. The picker is also available at `/special-mode`.
The new faces keep the same wings, movement, collision radius, and nose-outward color bursts.
No additional database migration is needed: modes use the existing `scores.mode` column.

## Testing and deployment

Run `npm test` with Node 22.13+ (uses Node's built-in SQLite).
Deploy with `npm run deploy` after authenticating Wrangler to the existing Cloudflare account.
This applies the additive D1 migration before deploying Pages. **Do not deploy the new API before
applying `migrations/0002_natalia.sql`**: the API requires the new `mode` column.

