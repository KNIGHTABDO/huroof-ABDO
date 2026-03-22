# Infrastructure & Runtime Notes

## Overview

`حروف مع عبدو` runs as a Next.js App Router application with a peer-to-peer multiplayer model:

- **UI layer:** `src/app` + `src/components`
- **Game logic layer:** `src/lib/gameState.js`
- **Realtime transport layer:** `src/lib/peerManager.js` (PeerJS/WebRTC)
- **Question/content layer:** `src/lib/questions.js`, `src/lib/arabicLetters.js`

## Realtime Flow

1. Host opens `/game?role=host`
2. Host creates room via PeerJS id `huroof-<ROOM_CODE>`
3. Player joins with `/game?role=player&room=<CODE>&name=<NAME>`
4. Host broadcasts state updates to all peers
5. Player actions (`HEX_CLICK`, `BUZZ`) are sent to host and re-broadcast as canonical game state

## Development Security Guardrails

- Input normalization/validation is centralized in `src/lib/validation.js`
- Production console noise is reduced through environment-gated logging in peer manager
- Game route has error isolation through `src/app/game/error.js`
- Rapid repeated clicks on create/join are throttled client-side on landing page

## Dev Network Configuration

Next.js dev-origin control is configured in `next.config.mjs` via:

- `allowedDevOrigins`
- Optional env override: `DEV_ORIGINS` (comma-separated)

Default local-safe hosts include:

- `localhost`
- `127.0.0.1`
- `192.168.11.108`

## Quality Commands

```bash
npm run lint
npm test
npm run test:coverage
```

## Notes

- HexBoard is intentionally treated as sensitive rendering logic and should be changed only with high caution.
- Keep docs, policy pages, and changelog aligned with shipped behavior.

## Android Packaging (TWA)

Android release is handled from the same repository using Trusted Web Activity (TWA):

- Android Gradle project location: `android/twa` (kept خارج جذر المشروع لتفادي تعارض مجلد `app` مع مسارات Next.js)
- Manifest source: `https://huroof-abdo.vercel.app/site.webmanifest`
- Android guide: `android/README.md`
- Asset links generator: `scripts/generate-assetlinks.mjs`
- Generated association file path: `public/.well-known/assetlinks.json`

Required environment variables for asset links generation:

- `ANDROID_PACKAGE_NAME`
- `ANDROID_SHA256_FINGERPRINT`

## User Distribution Surface

- Public install page: `https://huroof-abdo.vercel.app/install`
- Official binary distribution: `https://github.com/KNIGHTABDO/huroof-ABDO/releases`
- Android launcher/app display name is configured as: `حروف مع عبدو`
