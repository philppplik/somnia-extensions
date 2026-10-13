# Review checklist

Risk tier decides review depth.

| Tier | What | Reviewers |
| --- | --- | --- |
| 0 | Declarative only (themes, snippets), no permissions | 1, automated checks |
| 1 | Panels and/or low permissions (`commands`, `project.read`, `selection`, `ui.notify`, `storage`), no worker code, no network | 1, full source read |
| 2 | Worker code or `project.write` | 2, full source read, reproducible build |
| 3 | Network, `ai.query`, `git.commit`, or any read + network combination | 2, reproducible build, per-origin justification, listed as "new" for one publish cycle before updates |

Single-maintainer rule: until two reachable reviewers exist, Tier 2 and 3 stay closed ("not accepting executable or network extensions yet"). Saying no is a valid outcome.

## Every submission
1. Author identity: look at the GitHub account (age, history). Record it in the PR.
2. Read all source, the manifest, every contribution and all panel HTML/scripts. No obfuscation. Bundled or minified code needs the exact source tree, tag and build steps. Unreadable is a valid reason to reject.
3. Explain every permission in the PR. Remove what is not needed.
4. Build the ZIP from the tagged source, compute SHA-256 from the final bytes yourself. Never accept an author's supplied hash.
5. Validate with Somnia's package parser (ZIP and expanded size under 2 MB, 200 files, one manifest, no unsafe paths).
6. LICENSE and README present. Version is new, no overwrite of a published version.
7. Reviewers do not approve their own extensions. Review notes stay in the PR.
8. Set `reviewed: true` and `reviewedBy` only after the above. `reviewedBy` is a name or team, 1 to 80 characters.

## After listing
Tier 2/3 entries are re-reviewed on every version update. Entries with no update in 18 months or with a user report are re-checked or delisted.

## Revocation
Add `{ "id", "versions": [exact versions], "reason" }` to `catalog/revoked.json` (no ranges), merge, run the publish workflow. Takes effect in the app on its next index refresh. There is no push channel.
