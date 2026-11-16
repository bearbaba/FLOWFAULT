# FLOWFAULT V2 — live Studionet acceptance ledger

**Status: V2 Case #2 signed end-to-end recovery VERIFIED; Milestone acceptance still PARTIAL.** Signed submission, AI consensus assessment, and explicit finalization are all `FINALIZED / SUCCESS`. The persisted V2 state is `RESOLVED`, with the revision/snapshot hashes and exact latest attempt recorded. A newly opened post-upgrade case, negative-path signed evidence, A→B dependency demonstration, and final demo are not yet established. Scope is frozen evidence only; no claim of real-world certification.

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

**This table is the historic pre-transaction 02:45 UTC baseline**, showing V2 was initially empty. Later signed readbacks below prove the Case #2 V2 workflow subsequently reached `RESOLVED`. The historical V1 RecoveryGate receipt remains separate.

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

### Signed evidence (verified transactions; export pending)

| Event | Transaction URL | Finalized state / note |
| --- | --- | --- |
| `submit_revision` Case #2 | [0xe0413cba…14a7c4](https://explorer-studio.genlayer.com/tx/0xe0413cba626ed9b489d977a347769ac6210b372cfc7b0c530b9bc5c25c14a7c4) | **FINALIZED / SUCCESS**, returns `1`; finalized `get_recovery(2)` = `SUBMITTED`, latest_attempt `1` |
| `assess_revision(1)` Case #2 | [0x48f760…841583](https://explorer-studio.genlayer.com/tx/0x48f7604891d21aa0e550e794b680517bd11c793b0665e2702edfe2fec4841583) | **FINALIZED / SUCCESS**, returned `PASS`; finalized `get_attempt(1)` records three `PASS` checks and `get_recovery(2).state=PASS` |
| `finalize_recovery(2,1)` Case #2 | [0x1dc89d…c9531e](https://explorer-studio.genlayer.com/tx/0x1dc89d33cb95d8f51b54224888b604db3142ac7b216123c1cc14d4d244c9531e) | **FINALIZED / SUCCESS**, returned `RESOLVED`; finalized recovery readback confirms state, scope and both SHA-256 hashes |
| JSON evidence export | PENDING | PENDING |

### Signed submission and independent finalized readback — 2026-11-16 09:55 ICT

- Transaction: [`0xe0413cba626ed9b489d977a347769ac6210b372cfc7b0c530b9bc5c25c14a7c4`](https://explorer-studio.genlayer.com/tx/0xe0413cba626ed9b489d977a347769ac6210b372cfc7b0c530b9bc5c25c14a7c4).
- `submit_revision(case_id=2, new_output, new_sha256)` returned **`1`**; execution `SUCCESS`, consensus `Accepted`, transaction `FINALIZED` in Normal mode.
- Caller: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`, the designated Worker B.
- Finalized readback `get_recovery(2)`: `{"attempts":[1],"case_id":2,"latest_attempt":1,"state":"SUBMITTED"}`.
- Finalized readback `get_attempt(1)`: `case_id=2`, `round=1`, `role=B`, `status=SUBMITTED`, `assessment={}`; matching signer and identical `new_output`.
- Stored revision digest: `0503cb5d7d19ab6c8628c228a6c43c66f41a47b8d3d35999c21309f45438cbe4`.
- Stored frozen Court snapshot digest: `8579ae65ac74ae81a2c411f4d52f8d25321ca7bb2d66e0371dfd3ae8025fb787`.
- `stats.attempts=1` in a separate finalized read.

**Historical checkpoint:** assessment was pending immediately after this submission; subsequent signed assessment and finalized resolution are documented below.

### Signed assessment and independent finalized readback — 2026-11-16 09:58 ICT

- Transaction: [`0x48f7604891d21aa0e550e794b680517bd11c793b0665e2702edfe2fec4841583`](https://explorer-studio.genlayer.com/tx/0x48f7604891d21aa0e550e794b680517bd11c793b0665e2702edfe2fec4841583).
- Caller: Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`; `assess_revision(1)` executed in Normal mode with 5 initial validators, 1 rotation, `Accepted` consensus, `FINALIZED / SUCCESS`, and returned `PASS`.
- Independent finalized `get_attempt(1)` confirms `status=PASS`, `assessment.verdict=PASS`; criterion results: `agreement=PASS`, `source=PASS`, `dependency=PASS`; each has literal evidence references to revision and frozen inputs.
- Frozen source arithmetic: approved INV1 (12) + approved INV3 (8) = 20; unapproved INV2 (6) excluded. The revision reports 20, consistent with A's original 20.
- Independent finalized `get_recovery(2)`: `{"attempts":[1],"case_id":2,"latest_attempt":1,"state":"PASS"}`.
- Revision digest remains `0503cb5d7d19ab6c8628c228a6c43c66f41a47b8d3d35999c21309f45438cbe4`, Court snapshot digest remains `8579ae65ac74ae81a2c411f4d52f8d25321ca7bb2d66e0371dfd3ae8025fb787`.
- **Historical checkpoint:** `finalize_recovery(2,1)` was eligible after PASS and has since been signed and verified as `RESOLVED`; see the next section.

### Signed finalization and independent finalized readback — 2026-11-16 10:03 ICT

- Transaction: [`0x1dc89d33cb95d8f51b54224888b604db3142ac7b216123c1cc14d4d244c9531e`](https://explorer-studio.genlayer.com/tx/0x1dc89d33cb95d8f51b54224888b604db3142ac7b216123c1cc14d4d244c9531e).
- Caller: Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`. `finalize_recovery(case_id=2,attempt_id=1)` in Normal mode, 5 initial validators, 0 rotations; consensus `Accepted`, transaction `FINALIZED / SUCCESS`, returned `RESOLVED`.
- Independent `LATEST_FINAL` read of `get_recovery(2)`: `state=RESOLVED`, `attempts=[1]`, `latest_attempt=1`. The persisted `resolution` records `attempt_id=1`, `scope=FROZEN_EVIDENCE_ONLY`.
- `resolution.revision_sha256=0503cb5d7d19ab6c8628c228a6c43c66f41a47b8d3d35999c21309f45438cbe4` exactly matches `get_attempt(1).new_sha256`.
- `resolution.snapshot_sha256=8579ae65ac74ae81a2c411f4d52f8d25321ca7bb2d66e0371dfd3ae8025fb787` exactly matches `get_attempt(1).snapshot_sha256`.
- The same `get_attempt(1)` remains `status=PASS`, and all three `agreement/source/dependency` checks remain PASS.
- The original Court `get_case(2)` still records `stage=DECIDED` and `verdict=REWORK_B` (V1 evidence was not overwritten). V2 resolution is a separate on-chain record.

**Validated outcome:** a complete live, signed, evidence-scoped V2 `REWORK_B` recovery on a pre-existing Court case. This does **not** establish the new-case milestone, A→B or negative-path tests yet.

## Milestone completion criteria (not yet observed)

- A **new post-upgrade Court case**, with signed original artifacts and finalized dispute verdict, enters V2.
- A real FAIL or REVIEW case does **not** resolve; if a later distinct revision passes, only the latest passing revision can resolve.
- An `REWORK_A` case must stop at `UPSTREAM_VERIFIED_B_REVIEW_REQUIRED`, never automatically close the dependent B workflow.
- Negative checks are signed or reproducibly reverted: wrong-wallet submission, hash mismatch, duplicate/stale attempt, and attempt cap.
- All statuses are taken from finalized contract state, not predicted AI output or simulation.
- Record the new-case IDs, transaction URLs, finalized snapshots, commit SHA, deployment/source checks, and a short demo before moving PR out of Draft or submitting the Milestone.

This ledger records only verified transactions and finalized readbacks. Remaining tests are explicitly flagged as unverified; no fabricated transaction or consensus result is included.
