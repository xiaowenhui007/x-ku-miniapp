# 爪爪手记 · 云端安心接力

Existing Site: `appgprj_6ad16fee04108191a4f0062d681d035c`.

## Runtime

Vinext/Cloudflare Worker, native Sites D1 (`DB`) and R2 (`BUCKET`). `/index.html` is the cloud UI; `/local.html` preserves the original browser-local demo and its storage key. Existing local data is never read or migrated by the cloud UI. All initial card creation uses a reviewed fictional fixture. QR rendering is bundled locally and makes no third-party request.

The user approved the public shell and both per-card invitation modes. `SHARING_ENABLED` is now true. This gates creation of new invitations only; it is not a global kill switch. Revoke existing invitations to stop their access. The UI does not claim external collaboration is live while this platform gate remains in place. No production invitations were created during implementation. Existing user-created card/photo data was preserved.

## Security

Sites dispatch verifies and injects identity headers. The backend matches the normalized, signed-in owner email against a SHA-256 digest bound during setup, then scopes owner rows to the Site-stable identity ID. The digest is an identifier check, not a password. Missing identity cannot administer cards. The service bypass token does not supply owner identity and is not accepted as owner authorization.

Invitations support email-bound signed-in access and high-entropy bearer link access. Only token hashes are stored; a newly minted token is shown once. Every caregiver request is card-scoped, checked for expiry/revocation, and cannot edit card arrangements or administer invitations. Revocation and expiry are also checked atomically at writes. Link fragments avoid putting the token into ordinary server URLs; the UI clears them and keeps the active token only in session storage. Links can still be forwarded: a bearer invitation permits anyone holding it to read that card/photos and write care records until expiry or revocation.

Mutations require same-origin Origin headers. Responses are no-store; protected photos are fetched with authorization and served with nosniff. Uploads are bounded to 1 MB with MIME/signature validation and 100 photos per card. Client canvas recompression strips original image metadata. There are 500 event entries per card. Concurrent record changes use compare-and-swap versions; notes have retry idempotency keys. Failed uploads release their reserved database slot. The UI reports errors without substituting local fake synchronization.

## Checks

- `node --test tests/cloud-api.test.mjs`: SQLite-backed D1 integration/security/concurrency tests, in-memory R2.
- `node tests/comprehensive.cjs`: 32 original-demo regression checks (DOM stub, not browser).
- `node tests/smoke.cjs`: original-demo smoke tests.
- `node --check public/cloud-app.js`
- `node /home/agent/.codex/plugins/cache/openai-curated-remote/sites/1.0.0/scripts/build-site.mjs`

Drizzle migrations are schema-only and packaged by the Sites build integration. Never rewrite an applied migration.

## Verification limits

Browser QA was attempted but the cloud browser's localhost origin approval gate was cancelled because its security check was unavailable. No alternate browser route was used. Production deployment status establishes publication, not signed-in end-to-end collaboration. Public-edge identity checks were completed with the protected API temporarily gated: forged identity headers still yielded authenticated:false/isOwner:false; card/photo routes remained denied. The final release restores per-card authorization and invitation creation. Actual caregiver multi-account UI testing remains unverified.

First-use guidance appears on the cloud page: create reviewed fictional card → choose/share invitation once enabled → caregiver login/check-in → owner views the same card’s records. Logged-out email invite users get an explicit top-level sign-in link with a fixed same-origin return path; tokens are never included in the authentication redirect. A self-only CSP on the cloud HTML restricts scripts/connections without blocking Sites embedding.
