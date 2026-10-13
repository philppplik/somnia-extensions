# Somnia extensions

The reviewed extension catalog for [Somnia](https://github.com/philppplik/somnia). The app reads a **signed** index from the `published` branch of this repository and refuses it unless the signature, expiry and serial check out.

- `catalog/entries.json`  source list of reviewed extensions (edited by PR)
- `catalog/revoked.json`  revocations (edited by PR)
- `packages/`  the `.zip` packages, pinned by SHA-256 in the index
- `keys/public-keys.json`  public signing keys (the app bundles the same keys)
- `tools/`  build, sign, verify and lint scripts (Node 22, no dependencies)
- `published` branch  the signed `catalog/index.json` + `index.json.sig`, written only by the publish workflow

## What the signature means
It proves the index was produced by the Somnia release key and that package bytes match the pins. It does **not** prove an extension is safe. Review (docs/REVIEW.md) is the safety mechanism.

## Submit an extension
Open a PR that adds the ZIP under `packages/` and an entry in `catalog/entries.json`. Fill in the PR template. CI checks hashes and metadata and never has access to any secret. Read docs/REVIEW.md first. While there is a single maintainer, extensions with worker code, `project.write` or network access are not accepted yet.

## Report a problem
Use the "Extension security report" issue template. See SECURITY.md.

## Maintainers
- docs/KEYS.md: signing key setup, rotation, loss
- docs/MIGRATION.md: how the catalog moved out of the somnia repo

Run checks locally: `node tools/lint-entries.mjs && node --test test/tools.test.mjs`

License: MIT.
