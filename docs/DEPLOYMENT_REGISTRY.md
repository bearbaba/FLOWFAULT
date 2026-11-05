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
