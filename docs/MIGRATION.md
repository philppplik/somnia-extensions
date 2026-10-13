# Migration from somnia/docs/extensions/catalog

1. This repository holds the same 12 packages (hashes unchanged, checked by `tools/lint-entries.mjs`). `download` URLs point here. Entries now also carry `reviewed` and `reviewedBy`.
2. The old index in the somnia repo stays untouched. Existing app versions keep reading it.
3. The first app release with signed-catalog support reads `published/catalog/index.json` here and verifies it. If the network is down it uses the last verified cached index (re-verified, including expiry), never the old unsigned URL.
4. Legacy URL stays for two stable releases after that release. Then the old index is replaced by a stub pointing here and `docs/extensions/catalog/packages` is removed from the somnia repo.
5. Until the real public key is bundled, the app keeps using the legacy index. Bundling the key is the switch.
