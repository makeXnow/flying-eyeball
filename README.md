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
- `art/natalia-preview.png`: approved gradient concept, also used on the Natalia splash screen.

The main leaderboard includes all runs; the Natalia leaderboard includes only Natalia runs.
A Natalia run occupies one database row, so qualifying on both boards never duplicates it.
The main board is shown first when a score qualifies there; otherwise the Natalia board is shown.
Ties keep the older entry ahead. Players can switch boards and see their saved result before restarting.

## Testing and deployment

Run `npm test` with Node 22.13+ (uses Node's built-in SQLite).
Deploy with `npm run deploy` after authenticating Wrangler to the existing Cloudflare account.
This applies the additive D1 migration before deploying Pages. **Do not deploy the new API before
applying `migrations/0002_natalia.sql`**: the API requires the new `mode` column.

