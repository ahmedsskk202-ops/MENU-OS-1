# Menu OS License

Issues, verifies and revokes Menu OS licenses. It's a static admin panel (`public/`) plus
Netlify Functions (`netlify/functions/`), and it stores licenses and its signing key in
Netlify Blobs. It was adapted from the Construction OS license panel.

What it adds over that panel:

- **Lifetime licenses** (Generate → "Lifetime (never expires)"). The token has no expiry date.
- **Revocation.** Deleting a license revokes it: `/api/verify` answers `revoked`, and Menu OS
  locks itself at its next check (every 6 hours by default, and on every restart).
- **Product tag.** Tokens are stamped `product: "menu-os"`, so tokens for other products are refused.
- **Signed receipts.** Every verify answer carries a signed receipt. Menu OS caches it to
  keep running through internet outages (7 days by default), and it can't be forged or extended.
- **`GET /api/public-key`** returns the Ed25519 public key used to check licenses and receipts.

## Deploy to Netlify

1. Put this folder on Netlify. Either push it to a Git repo and "Import from Git", or run
   `npx netlify deploy --prod` inside the folder. It needs Functions, so a plain
   drag-and-drop of `public/` is not enough.
2. Site settings → Environment variables:
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`: the panel login.
   - `ADMIN_JWT_SECRET`: any long random string (it signs panel sessions).
   - Optional but recommended: `LICENSE_PRIVATE_KEY` and `LICENSE_PUBLIC_KEY` (Ed25519 PEM,
     with `\n` for newlines). Without them the site generates a key pair in Netlify Blobs
     the first time it runs. That works, but if that Blobs store is ever lost, every
     license already issued stops verifying. Setting the keys yourself lets you keep a backup.
3. Redeploy after setting the variables.

## Connect Menu OS

On each Menu OS server, add this to `apps/web/.env.local`:

```
MENU_OS_LICENSE_SERVER="https://<your-site>.netlify.app"
```

Restart it, open `http://<menu-os-address>/license`, and paste the key or open the `.lic` file.
Until a license is activated, every page redirects to `/license` and every API answers `403 LICENSE_REQUIRED`.

## Tests

```
npm test        # e2e of all functions (lifetime, revocation, receipts, product check)
npm run smoke   # signing / verification
```
