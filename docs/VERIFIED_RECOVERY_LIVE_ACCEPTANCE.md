# FLOWFAULT V2 — live Studionet acceptance ledger

**Status: PARTIAL, not milestone-ready.** This document separates observed finalized reads from user-signed transactions that have not yet been executed. Do not claim a PASS or completed case based on synthetic fixture results.

## Immutable baseline and deployment

- Original approved implementation baseline: [`d61d80fc`](https://github.com/bearbaba/FLOWFAULT/tree/d61d80fc3bd4bdaa5b598255cb6436c6387922e9).
- V2 implementation: [PR #1](https://github.com/bearbaba/FLOWFAULT/pull/1), branch `milestone/verified-rework`.
- Network: GenLayer Studionet, chain ID `61999`.
- V2 VerifiedRecovery: [`0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`](https://studio.genlayer.com/?import-contract=0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71).
- Existing HandoffCourt: `0x02A5476d786f55a215B33d77bdb071acB787182b`.
- Existing RecoveryGate (V1, not replaced): `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8`.
- Deployment source archive: [`contracts/verified_recovery_deployed.py`](../contracts/verified_recovery_deployed.py), with exact source and normalized developer source matching described in [VERIFIED_RECOVERY.md](VERIFIED_RECOVERY.md).

## Finalized public reads — 2026-11-16 02:45 UTC

Read through the V2 preview's GET-only `/api/state` using `LATEST_FINAL`; independently repeat these reads before signing or claiming a test result.

| Read | Observed persisted result |
| --- | --- |
| `GET /api/state?op=config` | `configured=true`, `recoveryConfigured=true`, chain `61999`, Court and VerifiedRecovery addresses match above |
| `scope=recovery&method=stats` | version `2.0.0`, max attempts `2`, criteria `agreement/source/dependency`, Court bound correctly, `attempts=0` |
| `scope=court&method=get_case&a0=2` | Case `2`, stage `DECIDED`, verdict `REWORK_B` |
| `scope=recovery&method=get_recovery&a0=2` | `{"attempts":[],"case_id":2,"latest_attempt":0,"state":"NOT_STARTED"}` |

**What this proves:** V2 preview configuration, GenLayer read connectivity, the frozen V1 Court case and empty V2 attempt history. **What this does not prove:** signed revision, AI assessment, finalization, or real-world correctness. The historical V1 RecoveryGate receipt is separate from V2.

## Case #2 — reproducible *smoke test*, not the whole milestone

- Responsible Worker B public address: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`. Only its signer can submit a revision for Case #2.
- Frozen A output: `{"approvedIds":["INV1","INV3"],"approvedTotal":20}`.
- Frozen B output duplicates A, violating the independent `reportedTotal` report requirement.
- Frozen source: approved `INV1` amount 12, unapproved `INV2` amount 6, approved `INV3` amount 8.

For the **first V2 smoke attempt**, submit this exact UTF-8 single-line `new_output` (copy without extra whitespace or newlines):

```json
{"reportedTotal":20,"summary":"Independent check of source: approved invoices INV1 (12) and INV3 (8) total 20; INV2 (6) is not approved. This matches Worker A approvedTotal 20."}
```

Expected SHA-256 of the **exact text** above (178 UTF-8 bytes):

```text
0503cb5d7d19ab6c8628c228a6c43c66f41a47b8d3d35999c21309f45438cbe4
```

### Signed Studio steps

1. Open the V2 Studio contract link above, select **Normal (Full Consensus)** and ensure **Simulation Mode is off** if generating signed milestone evidence.
2. Select the **Worker B** wallet matching the address above. Call `submit_revision` with `case_id=2`, exact `new_output`, and `new_sha256`. Save the finalized transaction hash. If an unexpected status appears, stop: never infer successful submission from a pending transaction.
3. Call `get_recovery(2)`. Its `latest_attempt` is the authoritative attempt ID (not necessarily `1` on a contract with other users). Record it, then call `get_attempt(latest_attempt)` to verify signer and digest.
4. Call `assess_revision(latest_attempt)` in full consensus. Read back `get_attempt(latest_attempt)` and `get_recovery(2)`. Record actual `PASS`, `FAIL`, or `REVIEW`; **no verdict is predetermined**.
5. **Only if persisted PASS:** call `finalize_recovery(case_id=2,attempt_id=latest_attempt)`; read `get_recovery(2)` again and verify `RESOLVED`, `resolution.attempt_id`, revision SHA-256 and frozen snapshot SHA-256. If FAIL or REVIEW, no finalization is authorized; assess the cited reasons before choosing a different round-2 revision.
6. Save transaction URLs, finalized readbacks, and a `/recovery.html` JSON export. A V2 signed smoke test on this historic Case #2 is not a new-case end-to-end demo.

### Signed evidence (fill only after successful real transactions)

| Event | Transaction URL | Finalized state / note |
| --- | --- | --- |
| `submit_revision` Case #2 | PENDING | PENDING |
| `assess_revision` current attempt | PENDING | PENDING |
| `finalize_recovery` (only on PASS) | PENDING | PENDING |
| JSON evidence export | PENDING | PENDING |

## Milestone completion criteria (not yet observed)

- A **new post-upgrade Court case**, with signed original artifacts and finalized dispute verdict, enters V2.
- A real FAIL or REVIEW case does **not** resolve; if a later distinct revision passes, only the latest passing revision can resolve.
- An `REWORK_A` case must stop at `UPSTREAM_VERIFIED_B_REVIEW_REQUIRED`, never automatically close the dependent B workflow.
- Negative checks are signed or reproducibly reverted: wrong-wallet submission, hash mismatch, duplicate/stale attempt, and attempt cap.
- All statuses are taken from finalized contract state, not predicted AI output or simulation.
- Record the new-case IDs, transaction URLs, finalized snapshots, commit SHA, deployment/source checks, and a short demo before moving PR out of Draft or submitting the Milestone.

This ledger intentionally contains **no fabricated transactions or claims of PASS**.
