# FLOWFAULT V2 — fresh-case signed negative-to-positive acceptance plan

**IN PROGRESS — fresh Court Case #3 and both worker evidence submissions, plus Owner dispute, signed and verified at finality; AI adjudication and V2 revisions remain pending.** This is a reproducible synthetic fixture for the next Milestone test, separate from the already verified historical Case #2 [RESOLVED proof](evidence/case-2-v2-finalized.json).

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

1. **DONE / FINALIZED:** Owner called `open_case(worker_a,worker_b,task_spec,source_data)` using the exact strings below. Returned and independently persisted **Case ID #3**, confirmed by latest-final `get_case(3)`. [Signed transaction](https://explorer-studio.genlayer.com/tx/0x9cb6ef264f37ffae82ded480af5b7281bf4ac7863a0297e97530d5fad013b22f).
2. **DONE / FINALIZED:** Worker A called `submit_evidence(case_id=3,output,output_sha256)` with the exact A artifact/digest below. [Signed transaction](https://explorer-studio.genlayer.com/tx/0xe374185b455195f0676f686cd1ddfb5c886fe94dc7765d5ef29983d7f8a7c1ba) returned `A`; latest-final `get_case(3)` stores the identical output and digest.
3. **DONE / FINALIZED:** Worker B signed `submit_evidence(case_id=3,output,output_sha256)` with the deliberately inconsistent B artifact and digest. [Signed transaction](https://explorer-studio.genlayer.com/tx/0x154b4036445940ecba3f04c0bfb985f27e2a97c69ed68541973326ff041a6d13) returned `B`; latest-final `get_case(3)` stores identical B output and digest.
4. **Owner dispute DONE / FINALIZED:** Owner called `open_dispute(case_id=3,reason)` with the exact statement below. [Transaction](https://explorer-studio.genlayer.com/tx/0xe7c1eaf0f3ad201b37a8f8e583151815f358143b9c47e9cefc20cb8b242992cc) was FINALIZED / SUCCESS; latest-final Court stage is `DISPUTED` and verdict still `PENDING`. **Next write: `adjudicate(3)`**. Continue V2 only if its persisted verdict becomes `REWORK_B`; do not predict AI consensus.

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

### Case #3 observed initial-state readback — 2026-11-16

- Signed `open_case` transaction: [0x9cb6ef264f37ffae82ded480af5b7281bf4ac7863a0297e97530d5fad013b22f](https://explorer-studio.genlayer.com/tx/0x9cb6ef264f37ffae82ded480af5b7281bf4ac7863a0297e97530d5fad013b22f), Normal execution, five initial validators, `FINALIZED / SUCCESS`, returned `3`.
- Verified latest-final Court `get_case(3)`: owner `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`, Worker A `0x60bfdf6315294c7856acdc0b80d7bd40217debff`, Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`.
- Task and source exactly match this fixture. Source digest: `96e2a5374e92c68d6f59e91f02192cedd40536b1282af289dcbf616b116f2094`.
- Verified latest-final stage `OPEN`, verdict `PENDING`, worker A/B output fields and hashes empty. Court `totals.cases=3`.
- Verified latest-final V2 `get_recovery(3)` = `{"attempts":[],"case_id":3,"latest_attempt":0,"state":"NOT_STARTED"}`.
- **Historical checkpoint:** Worker A was pending at the time of `open_case`; its signed transaction has since finalized and been verified below.

### Case #3 Worker A finalized evidence — 2026-11-16 10:20 ICT

- Signed transaction: [`0xe374185b455195f0676f686cd1ddfb5c886fe94dc7765d5ef29983d7f8a7c1ba`](https://explorer-studio.genlayer.com/tx/0xe374185b455195f0676f686cd1ddfb5c886fe94dc7765d5ef29983d7f8a7c1ba), Normal execution, accepted consensus, `FINALIZED / SUCCESS`, return `A`.
- Signer: `0x60bfdf6315294c7856acdc0b80d7bd40217debff` (assigned Worker A); Court `0x02A5476d786f55a215B33d77bdb071acB787182b`.
- `LATEST_FINAL get_case(3)` persisted `a_output={"approvedIds":["INV4","INV6"],"approvedTotal":50}` and `a_sha256=9b8bb2c7e5abcfef535369bad0d183b72d1f4b2df0a3ad66a0e63b297ddc44d7`. Digest was also independently recomputed from the exact 50-character UTF-8 output.
- Court stage remains `OPEN`, verdict `PENDING`, and B output/digest still empty.
- **Historical checkpoint:** Worker B was pending immediately after A; the signed Worker B submission was later finalized and verified below. Owner dispute and Court adjudication remain pending.

### Case #3 Worker B finalized evidence — 2026-11-16 10:23 ICT

- Signed transaction: [`0x154b4036445940ecba3f04c0bfb985f27e2a97c69ed68541973326ff041a6d13`](https://explorer-studio.genlayer.com/tx/0x154b4036445940ecba3f04c0bfb985f27e2a97c69ed68541973326ff041a6d13), Normal mode, accepted consensus, `FINALIZED / SUCCESS`, returned `B`.
- Signer: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` (assigned Worker B); contract: HandoffCourt.
- Independently read `LATEST_FINAL get_case(3)`: `b_output={"reportedTotal":55,"summary":"Approved invoices INV4 (31) and INV6 (19) total 55; INV5 (14) was unapproved."}` and `b_sha256=a9f13785405e4fc70d9e577f5b2acbbe103fb6b56563d5ad3b1631b6467341d4`.
- Worker A artifact remains `approvedTotal=50`; source contains approved INV4=31 and INV6=19, totaling 50 (unapproved INV5=14). The B report is deliberately inconsistent but *no AI responsibility verdict has been recorded yet*.
- Court remains `stage=OPEN`, `verdict=PENDING`, `dispute=""`; VerifiedRecovery V2 `get_recovery(3)` remains `NOT_STARTED` with no attempts.
- **Historical checkpoint:** Owner dispute was pending after B signed; the owner subsequently opened the dispute successfully (details below). Next is a separate `adjudicate(3)` AI-consensus transaction.

### Case #3 Owner dispute finalized — 2026-11-16 10:25 ICT

- Owner-signed transaction: [`0xe7c1eaf0f3ad201b37a8f8e583151815f358143b9c47e9cefc20cb8b242992cc`](https://explorer-studio.genlayer.com/tx/0xe7c1eaf0f3ad201b37a8f8e583151815f358143b9c47e9cefc20cb8b242992cc), Normal execution, accepted consensus, `FINALIZED / SUCCESS`, `open_dispute(case_id=3, reason)` returned `null`.
- Signer: owner `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`. The exact reason stored in `LATEST_FINAL get_case(3).dispute` matches the fixture above.
- The independently read finalized Court state is now `stage=DISPUTED`, `verdict=PENDING`; both original A and B artifacts remain unchanged. `LATEST_FINAL get_recovery(3)` still reports `NOT_STARTED` with no V2 attempts.
- **Next:** on the original HandoffCourt, call `adjudicate(3)` in Normal (Full Consensus); inspect the actual persisted verdict before attempting V2 `submit_revision`. A `REWORK_B` verdict is expected from the arithmetic but **not guaranteed** by AI.

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
| Court `open_case` | [0x9cb6ef…13b22f](https://explorer-studio.genlayer.com/tx/0x9cb6ef264f37ffae82ded480af5b7281bf4ac7863a0297e97530d5fad013b22f) | **FINALIZED / SUCCESS**; latest-final Court `get_case(3)` confirms owner, assigned workers, immutable task/source, `stage=OPEN`, `verdict=PENDING` |
| Court Worker A `submit_evidence` | [0xe37418…a7c1ba](https://explorer-studio.genlayer.com/tx/0xe374185b455195f0676f686cd1ddfb5c886fe94dc7765d5ef29983d7f8a7c1ba) | **FINALIZED / SUCCESS**, returned `A`; latest-final `get_case(3)` confirms A output and SHA-256 |
| Court Worker B `submit_evidence` | [0x154b40…1a6d13](https://explorer-studio.genlayer.com/tx/0x154b4036445940ecba3f04c0bfb985f27e2a97c69ed68541973326ff041a6d13) | **FINALIZED / SUCCESS**, returned `B`; latest-final `get_case(3)` confirms B output and SHA-256 |
| Court Owner `open_dispute(3)` | [0xe7c1ea…992cc](https://explorer-studio.genlayer.com/tx/0xe7c1eaf0f3ad201b37a8f8e583151815f358143b9c47e9cefc20cb8b242992cc) | **FINALIZED / SUCCESS**; latest-final `get_case(3).stage=DISPUTED`, reason stored, verdict `PENDING` |
| Court AI `adjudicate(3)` | PENDING | PENDING |
| V2 first revision / first assessment | PENDING | PENDING |
| V2 second revision / second assessment | PENDING | PENDING |
| V2 explicit finalization (only on PASS) | PENDING | PENDING |
| Rejected unauthorized/stale/finalize actions | PENDING | PENDING |

Additional `REWORK_A` dependency case must be demonstrated separately; this fixture only tests the B path. Do not change the deployed code or retroactively rewrite a record because AI reaches an unexpected but legitimate result.
