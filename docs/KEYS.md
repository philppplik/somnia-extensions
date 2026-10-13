# Signing keys

Decision (maintainer): the private key lives as a GitHub **environment secret** in this repository. Honest consequence: whoever can run the publish workflow on `main` past the reviewer gate, or GitHub itself, can use the key. The setup below limits that.

## Setup (once, by the maintainer)
1. Generate the key on your own machine, never in a repo or chat:
   `openssl genpkey -algorithm ed25519 -out somnia-catalog.pem`
2. Public key as 64 hex characters:
   `openssl pkey -in somnia-catalog.pem -pubout -outform DER | tail -c 32 | xxd -p -c 64`
3. Put it in `keys/public-keys.json` as `{"keys":[{"keyId":"k1","hex":"<64 hex>"}]}` and in `phase1/src/lib/extensions/catalogTrust.ts` of the app (same value).
4. GitHub > repo Settings > Environments > New environment `catalog-signing`:
   - Required reviewers: philppplik (prevent self-review off only if you are the single maintainer, then keep the reviewer gate anyway)
   - Deployment branches: selected branches, `main` only
   - Environment secret `SOMNIA_CATALOG_KEY` = full PEM contents
5. Settings > Branches: protect `main` (PR required, CODEOWNERS review, no force push). Settings > Actions > General: "Require approval for all outside collaborators", workflows from forks get a read-only token and no secrets (the default for fork PRs, do not change it).
6. Make an offline backup of the PEM (encrypted, off GitHub). Delete the local plain file after.

## Rules
- The key is only used by `.github/workflows/publish.yml`. That workflow runs on manual dispatch from `main` only, behind the reviewer gate. No `pull_request` or fork trigger may ever reference the secret.
- Changes to `.github/`, `tools/` and `keys/` need maintainer review (CODEOWNERS), because they decide what gets signed.
- The index is valid for at most 30 days. Run the publish workflow at least every 3 weeks, even without changes, or the app pauses installs and updates (installed extensions keep running).

## Rotation (planned)
1. Generate a second key. Add it as `next` to `keys/public-keys.json` and ship an app release that pins both keys.
2. After that release is widely installed, switch the secret to the new key and publish with `keyId` of the new key.
3. Later release drops the old key.

## Compromise or loss
- Suspected leak: delete the environment secret, revoke nothing by index (the old key still verifies for the 30 days of already issued indexes), ship an app release pinning a new key, publish with it. Tell users to update.
- Lost key with no backup: same path, new key, new app release.
- A separate revocation key (faster emergency blocks) is not set up yet.
