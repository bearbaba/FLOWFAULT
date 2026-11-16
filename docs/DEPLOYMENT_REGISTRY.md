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
| **VerifiedRecovery V2.1** | [`0xcbc76A74B062ec16740355170ffE1700932Db636`](https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636) | **Independent live source attestation COMPLETE:** new contract source archived byte-for-byte, developer source matches after CRLF/LF normalization; `LATEST_FINAL stats()` verifies version `2.1.0`, original Court binding, 2 revision attempts, 3 AI runs, format-only retry. New `get_recovery(3)` remains `NOT_STARTED`; signed V2.1 workflow still pending. [Machine-readable deployment proof](evidence/v21-deployment-attestation.json). Full deploy tx hash not yet provided. |

V2.1 is a *new contract address* attached to the unchanged HandoffCourt; its storage does not rewrite V2 Case #3. The Milestone branch preview's `FLOWFAULT_VERIFIED_RECOVERY_ADDRESS` was switched only for `milestone/verified-rework`, not production. A read-only `/api/verify-v21` endpoint on the branch independently supplied public deployed source, schema, and latest-final `stats`. On-chain bytes matched exactly with [archived deployed source](../contracts/verified_recovery_v21_deployed.py), SHA-256 `0262a6e3b6425bacd9abce60ed212b671c9dfd5ddaa2443863b29aa106b2d950`; the developer [V2.1 candidate](../contracts/verified_recovery_v21.py) matched after CRLF/LF normalization. Source, constructor, version, ABI and policy checks **passed**. Signed V2.1 positive-path transactions remain pending.

**V2.1 Studio:** https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636

