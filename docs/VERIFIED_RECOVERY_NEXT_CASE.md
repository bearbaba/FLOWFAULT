# FLOWFAULT V2 — fresh-case signed negative-to-positive acceptance plan

**NOT EXECUTED. NO TRANSACTION HASH, AI VERDICT OR CASE ID EXISTS YET.** This is a reproducible synthetic fixture for the next Milestone test, separate from the already verified historical Case #2 [RESOLVED proof](evidence/case-2-v2-finalized.json).

## Network and signers

- GenLayer Studionet chain `61999`
- Original HandoffCourt: [`0x02A5476d786f55a215B33d77bdb071acB787182b`](https://studio.genlayer.com/?import-contract=0x02A5476d786f55a215B33d77bdb071acB787182b)
- VerifiedRecovery V2: [`0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`](https://studio.genlayer.com/?import-contract=0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71)
- Owner: `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` (must sign open case/dispute)
- Worker A: `0x60bfdf6315294c7856acdc0b80d7bd40217debff` (must sign A evidence)
- Worker B: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` (must sign B evidence and any authorized B revisions)
- All three are the public distinct signers from existing Court Case #2. The signer must actually control each wallet; public addresses do not grant signing ability.
- Use Normal (Full Consensus) with Simulation Mode off for real evidence.

## Phase 1 — New original Court case (not yet signed)

1. Owner calls `open_case(worker_a,worker_b,task_spec,source_data)` using exact strings below. Save new `case_id` from finalized return; do **not** assume case #3.
2. Worker A calls `submit_evidence(case_id,output,output_sha256)` with exact A artifact and digest.
3. Worker B calls `submit_evidence(case_id,output,output_sha256)` with exact **incorrect B** artifact and digest.
4. Owner calls `open_dispute(case_id,reason)` with the statement below, then calls `adjudicate(case_id)`. Record actual finalized verdict. **Continue V2 only if persisted `REWORK_B`;** another verdict is not a failed transaction and must not be mislabeled as REWORK_B.

### open_case parameters

`worker_a`: `0x60bfdf6315294c7856acdc0b80d7bd40217debff`

`worker_b`: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`

`task_spec` (exact text):

```text
Process synthetic invoices. Worker A must output JSON containing the approvedIds and exact integer approvedTotal. Worker B must independently output JSON containing reportedTotal equal to Worker A's approvedTotal and a summary distinguishing approved and unapproved entries without inventing any amounts. A correct Worker A output with an inconsistent Worker B report requires REWORK_B.
```

`source_data` (exact string):

```json
[{"id":"INV4","amount":31,"approved":true},{"id":"INV5","amount":14,"approved":false},{"id":"INV6","amount":19,"approved":true}]
```

### Worker A submit_evidence

`output`:

```json
{"approvedIds":["INV4","INV6"],"approvedTotal":50}
```

`output_sha256`: `9b8bb2c7e5abcfef535369bad0d183b72d1f4b2df0a3ad66a0e63b297ddc44d7`

### Worker B submit_evidence — deliberately wrong

`output`:

```json
{"reportedTotal":55,"summary":"Approved invoices INV4 (31) and INV6 (19) total 55; INV5 (14) was unapproved."}
```

`output_sha256`: `a9f13785405e4fc70d9e577f5b2acbbe103fb6b56563d5ad3b1631b6467341d4`

### Owner open_dispute

`reason` (exact text):

```text
Worker A's approvedTotal is 50 from approved INV4 (31) and INV6 (19). Worker B reports 55 despite those signed source amounts summing to 50. Determine whether Worker B alone violated the locked agreement using only frozen evidence.
```

**Sanity check:** Approved invoices are 31 + 19 = **50**, not 55. `INV5` amount 14 is unapproved. AI verdict remains nondeterministic and must be taken from persisted state.

## Phase 2 — V2 negative revision; if accepted as REWORK_B

1. Worker B calls `submit_revision(new_case_id, bad_revision, bad_revision_sha256)` on **VerifiedRecovery V2**, not the legacy RecoveryGate. Wait for finalized success and retrieve the actual new attempt ID.
2. Call `assess_revision(actual_attempt_id)`. If persisted `FAIL` or `REVIEW`, verify `finalize_recovery(new_case_id,attempt_id)` is **not authorized**. A rejected finalize may be demonstrated carefully, but do not claim it without a finalized execution failure. An uncertain REVIEW must not be called a FAIL.
3. **Only if first assessment is FAIL or REVIEW**: Worker B calls `submit_revision(new_case_id, good_revision, good_revision_sha256)`; obtain new attempt ID. Call `assess_revision` and record its actual result. Only on stored `PASS`, call `finalize_recovery`.
4. Verify that attempt #1 remains immutable, attempt #2 is current, the older attempt cannot be finalized, and `resolution` hashes match the latest attempt.

### First V2 revision — deliberately still incorrect

`new_output`:

```json
{"reportedTotal":52,"summary":"Corrected approved total 52 from INV4 and INV6."}
```

`new_sha256`: `4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a`

### Second V2 revision — corrected, conditional on first FAIL/REVIEW

`new_output`:

```json
{"reportedTotal":50,"summary":"Approved invoices INV4 (31) and INV6 (19) total 50; INV5 (14) is unapproved. This agrees with Worker A approvedTotal 50."}
```

`new_sha256`: `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`

## Evidence gate — do not claim until observed

| Step | New transaction hash | Finalized result |
| --- | --- | --- |
| Court open / A sign / B sign / dispute / adjudicate | PENDING | PENDING |
| V2 first revision / first assessment | PENDING | PENDING |
| V2 second revision / second assessment | PENDING | PENDING |
| V2 explicit finalization (only on PASS) | PENDING | PENDING |
| Rejected unauthorized/stale/finalize actions | PENDING | PENDING |

Additional `REWORK_A` dependency case must be demonstrated separately; this fixture only tests the B path. Do not change the deployed code or retroactively rewrite a record because AI reaches an unexpected but legitimate result.
