# FLOWFAULT — Verified GenLayer Studionet deployments

**Environment:** GenLayer Studionet, chain ID **61999**  
**Production application:** https://flowfault-eight.vercel.app  
**Demo walkthrough:** https://youtu.be/VlPv2M0jXjg

## On-chain contracts

| Contract | Address | Explorer |
| --- | --- | --- |
| **HandoffCourt** | `0x02A5476d786f55a215B33d77bdb071acB787182b` | [Inspect Court](https://explorer-studio.genlayer.com/address/0x02A5476d786f55a215B33d77bdb071acB787182b) |
| **RecoveryGate** | `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8` | [Inspect Gate](https://explorer-studio.genlayer.com/address/0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8) |

The [live Studionet preflight](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799) validated the deployed source against the committed contracts after formatting normalization, checked the GenVM ABI schemas, and confirmed that `RecoveryGate.stats().court` points to HandoffCourt.

## Finalized product state

| Case | Court result | Gate result |
| --- | --- | --- |
| **#1 · Studio workflow** | `DECIDED / REWORK_B` | Receipt #1 · Worker B |
| **#2 · Website workflow** | `DECIDED / REWORK_B` | Receipt #2 · Worker B |

Both recovery receipts have status `REWORK_SUBMITTED_NOT_VERIFIED`, recording the worker's signed replacement submission and output digest.

The app independently checks wallet signatures, transaction execution, and persisted latest-final state before displaying `FINALIZED / VERIFIED`.

## Repeat deployment verification

```bash
FLOWFAULT_COURT_ADDRESS=0x02A5476d786f55a215B33d77bdb071acB787182b \
FLOWFAULT_RECOVERY_ADDRESS=0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8 \
npm run preflight
```

For exact signed transactions, hashes, decisions and the separate transaction-security test records, see the [on-chain evidence ledger](ONCHAIN_EVIDENCE.md).


## Separate VerifiedRecovery releases (16 Nov 2026)

| Intelligent Contract | Studionet address | Evidence status |
| --- | --- | --- |
| **VerifiedRecovery V2.0** | `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71` | Live, deployed source attested. Historic Court Case #2 PASS → RESOLVED; fresh Court Case #3 FAIL → terminal REVIEW. [Full signed ledger](VERIFIED_RECOVERY_LIVE_ACCEPTANCE.md). |
| **VerifiedRecovery V2.1** | [`0xcbc76A74B062ec16740355170ffE1700932Db636`](https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636) | **Independent live source attestation COMPLETE:** new contract source archived byte-for-byte, developer source matches after CRLF/LF normalization; `LATEST_FINAL stats()` verifies version `2.1.0`, original Court binding, 2 revision attempts, 3 AI runs, format-only retry. New V2.1 recovery began independently at `NOT_STARTED`; the first [Worker B signed revision tx](https://explorer-studio.genlayer.com/tx/0xa8edcf2e1fd53ce3d7513fb969da8bc12b73a2e530fb6653f9dc8aa5ba389aa8) has now persisted as global attempt **1**, after first accepted assessment and signed format retry, current `LATEST_FINAL get_recovery(3).state=REVIEW` with `assessment_runs=2`. A further attempt at retry [finalized with MajorityDisagree](https://explorer-studio.genlayer.com/tx/0x4f5f5551f4813cc77eede0b62c0277ae8b4b53aaf7a3483dfedbb5601f12281b), and its leader-only PASS was **not committed**. [Signed state export](evidence/v21-case-3-attempt-1-submitted.json). [Machine-readable deployment proof](evidence/v21-deployment-attestation.json). Full deploy tx hash not yet provided. |
| **VerifiedRecovery V2.2** | [`0x6a9E026adfD607f087626B06e293e7b277AD3966`](https://studio.genlayer.com/?import-contract=0x6a9E026adfD607f087626B06e293e7b277AD3966) | **SIGNED LIVE PASS → RESOLVED.** Code source/ABI/constructor verified; all three on-chain writes FINALIZED/SUCCESS/MAJORITYAGREE; 1/3 assessment runs, all three evidence-cited criteria PASS; `LATEST_FINAL get_recovery(3).state=RESOLVED` with both linked SHA-256 checks. [Signed machine-readable evidence](evidence/v22-case-3-pass-resolved.json) · [V2.2 acceptance runbook](VERIFIED_RECOVERY_V22.md). |

V2.1 is a *new contract address* attached to the unchanged HandoffCourt; its storage does not rewrite V2 Case #3. The Milestone branch preview's `FLOWFAULT_VERIFIED_RECOVERY_ADDRESS` was switched only for `milestone/verified-rework`, not production. A read-only `/api/verify-v21` endpoint on the branch independently supplied public deployed source, schema, and latest-final `stats`. On-chain bytes matched exactly with [archived deployed source](../contracts/verified_recovery_v21_deployed.py), SHA-256 `0262a6e3b6425bacd9abce60ed212b671c9dfd5ddaa2443863b29aa106b2d950`; the developer [V2.1 candidate](../contracts/verified_recovery_v21.py) matched after CRLF/LF normalization. Source, constructor, version, ABI and policy checks **passed**. Signed V2.1 correction and two assessment runs are confirmed; Case #3 remains REVIEW and must **not** be presented as RESOLVED.

**V2.1 Studio:** https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636


## VerifiedRecovery V2.2 — 16 Nov 2026, independent chain verification

New immutable contract [`0x6a9E026adfD607f087626B06e293e7b277AD3966`](https://studio.genlayer.com/?import-contract=0x6a9E026adfD607f087626B06e293e7b277AD3966), **Studionet 61999**; original HandoffCourt address unchanged. Exact [deployed RPC code archive](../contracts/verified_recovery_v22_deployed.py) SHA-256 `3651ed0280a03c4c45bc9efda1900f1755c222f63c104fb5579be00a6bb06569`, byte-for-byte matched against source returned by chain, and [candidate source](../contracts/verified_recovery_v22.py) matched after line-ending normalization. `stats()` verified `version=2.2.0`, `citation_mode=DETERMINISTIC_REFERENCE_IDS`, correct Court and bounded retry policy. Case #3 is explicitly a new V2.2 recovery round using an **existing finalized immutable** Court case, not a new Court case.

Three accepted signed transactions from Worker B:

1. [`submit_revision(3,...)` — `0xcfbee2d5…7a380`](https://explorer-studio.genlayer.com/tx/0xcfbee2d522e6babe67d2d1ddaa84a128690fe920dd15c5acd03923755ee7a380), stored attempt ID 1, SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`.
2. [`assess_revision(1)` — `0xe3b43a7e…ba38`](https://explorer-studio.genlayer.com/tx/0xe3b43a7e1414a79f808d1822de844c41b5bc455335b238f3fc8ca8766fc2ba38), `LATEST_FINAL` **PASS** in agreement/source/dependency, 1 assessment run, zero format fallbacks, reference IDs independently validated against frozen input bytes.
3. [`finalize_recovery(3,1)` — `0x9ef5bd6f…263b`](https://explorer-studio.genlayer.com/tx/0x9ef5bd6f5e4149a6cc4f699da4c7ee0dd403e527f184cfb5ea4139561f9e263b), `LATEST_FINAL` **RESOLVED**, with signed correction SHA-256 and Court snapshot SHA-256 `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7` in `resolution`.

All three were `FINALIZED / GenVM SUCCESS / MAJORITYAGREE`. Original Court remains `DECIDED/REWORK_B`. [Machine-readable complete acceptance evidence](evidence/v22-case-3-pass-resolved.json). The milestone branch preview points to V2.2; existing production app and historical V2/V2.1 deployments remain unchanged. This evidence is for a synthetic frozen-evidence invoice example; not real-world financial execution.
