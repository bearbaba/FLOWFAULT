# FLOWFAULT V2 — fresh-case signed negative-to-positive acceptance plan

**IN PROGRESS — signed fresh Case #3 Court workflow finalized `REWORK_B`; first VerifiedRecovery V2 revision recorded as global attempt #2 (Case #3 round 1). First `assess_revision(2)` execution returned FAIL on all criteria, but consensus was UNDETERMINED after 3 rotations, and latest-final attempt/recovery remain SUBMITTED: the FAIL has NOT been persisted.** This is a reproducible synthetic fixture for the next Milestone test, separate from the already verified historical Case #2 [RESOLVED proof](evidence/case-2-v2-finalized.json).

## Network and signers

- GenLayer Studionet chain `61999`
- Original HandoffCourt: [`0x02A5476d786f55a215B33d77bdb071acB787182b`](https://studio.genlayer.com/?import-contract=0x02A5476d786f55a215B33d77bdb071acB787182b)
- VerifiedRecovery V2: [`0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`](https://studio.genlayer.com/?import-contract=0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71)
- Owner: `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` (must sign open case/dispute)
- Worker A: `0x60bfdf6315294c7856acdc0b80d7bd40217debff` (must sign A evidence)
- Worker B: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` (must sign B evidence and any authorized B revisions)
- All three are the public distinct signers from existing Court Case #2. The signer must actually control each wallet; public addresses do not grant signing ability.
- Use Normal (Full Consensus) with Simulation Mode off for real evidence.

## Phase 1 — New original Court case (all 5 signed steps verified)

1. **DONE / FINALIZED:** Owner called `open_case(worker_a,worker_b,task_spec,source_data)` using the exact strings below. Returned and independently persisted **Case ID #3**, confirmed by latest-final `get_case(3)`. [Signed transaction](https://explorer-studio.genlayer.com/tx/0x9cb6ef264f37ffae82ded480af5b7281bf4ac7863a0297e97530d5fad013b22f).
2. **DONE / FINALIZED:** Worker A called `submit_evidence(case_id=3,output,output_sha256)` with the exact A artifact/digest below. [Signed transaction](https://explorer-studio.genlayer.com/tx/0xe374185b455195f0676f686cd1ddfb5c886fe94dc7765d5ef29983d7f8a7c1ba) returned `A`; latest-final `get_case(3)` stores the identical output and digest.
3. **DONE / FINALIZED:** Worker B signed `submit_evidence(case_id=3,output,output_sha256)` with the deliberately inconsistent B artifact and digest. [Signed transaction](https://explorer-studio.genlayer.com/tx/0x154b4036445940ecba3f04c0bfb985f27e2a97c69ed68541973326ff041a6d13) returned `B`; latest-final `get_case(3)` stores identical B output and digest.
4. **DONE / FINALIZED:** Owner opened the dispute with the exact reason below. [Transaction](https://explorer-studio.genlayer.com/tx/0xe7c1eaf0f3ad201b37a8f8e583151815f358143b9c47e9cefc20cb8b242992cc); verified historical `DISPUTED / PENDING` state. 5. **DONE / FINALIZED:** Owner invoked `adjudicate(3)`; [transaction](https://explorer-studio.genlayer.com/tx/0x5ee0c168cac54a23fec52d411a7534de31664f0bdd4dc49099b0ea95cba85975) returned `REWORK_B`. Independent `LATEST_FINAL get_case(3)` now reads `DECIDED / REWORK_B`, and `recovery_permission(3,Worker B).allowed=true`.

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
- **Historical checkpoint:** Owner adjudication was pending at this point; it has since finalized and the live Court verdict is `REWORK_B`. See verified adjudication below.

### Case #3 signed AI adjudication — 2026-11-16 10:27 ICT

- [`adjudicate(3)` transaction `0x5ee0c168cac54a23fec52d411a7534de31664f0bdd4dc49099b0ea95cba85975`](https://explorer-studio.genlayer.com/tx/0x5ee0c168cac54a23fec52d411a7534de31664f0bdd4dc49099b0ea95cba85975). Owner `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`, Normal mode, 5 initial validators, 0 rotations, Accepted consensus, `FINALIZED / SUCCESS`, returned `REWORK_B`.
- Independent `LATEST_FINAL get_case(3)`: `stage=DECIDED`, `verdict=REWORK_B`. The frozen task, source, and A/B evidence remain unchanged.
- Independent `LATEST_FINAL recovery_permission(3,0xd6b8a3a5eb329410d9504784812b8569afa8c2af)`: `{"case_id":3,"role":"B","allowed":true,"verdict":"REWORK_B"}` (plus matching actor and original B digest).
- Independent `LATEST_FINAL VerifiedRecovery.get_recovery(3)`: `{"attempts":[],"case_id":3,"latest_attempt":0,"state":"NOT_STARTED"}`. **No V2 revision is signed yet.**
- **Next:** on VerifiedRecovery `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`, responsible Worker B submits deliberately incorrect new_output `{"reportedTotal":52,"summary":"Corrected approved total 52 from INV4 and INV6."}` with exact SHA-256 `4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a`. Independently recomputed UTF-8 SHA-256. Then read actual new attempt ID and run AI assessment. Its final verdict must not be preclaimed.

### Rejected legacy Court write — 2026-11-16 10:31 ICT (expected safeguard, not a V2 revision)

- [Transaction `0xf4d939016bec755c641dee611f92835ab9687edcf05b579d3da5b6562a2a5b17`](https://explorer-studio.genlayer.com/tx/0xf4d939016bec755c641dee611f92835ab9687edcf05b579d3da5b6562a2a5b17) was signed by assigned Worker B and reached **`FINALIZED`, but execution `ERROR` / `Rollback`** with message `evidence window closed`. **Do not count as a successful V2 submission.**
- The attempted method was **HandoffCourt `submit_evidence(case_id=3, ...)`**, NOT VerifiedRecovery V2 `submit_revision`. Court blocks artifact changes after case reaches `DECIDED`.
- Independent latest-final `get_case(3)` still reads `DECIDED / REWORK_B`, original Worker B evidence still `reportedTotal=55` and its original SHA-256 unchanged.
- Independent latest-final V2 `get_recovery(3)` still reads `NOT_STARTED`, `latest_attempt=0`, `attempts=[]`. Worker B `recovery_permission.allowed=true` remains unchanged.
- **Correct next action:** open VerifiedRecovery V2 at `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71` and call **`submit_revision`**, not `submit_evidence`, with `case_id=3`, the same 80-byte `new_output={"reportedTotal":52,"summary":"Corrected approved total 52 from INV4 and INV6."}`, and SHA-256 `4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a`. Wait for actual new attempt ID, then call V2 `assess_revision`.
- This is useful **Court late-write rejection evidence only**, not a test of V2 hash mismatch, V2 wrong-wallet authorization, or V2 AI FAIL / REVIEW.

## Phase 2 — V2 negative revision; now eligible after persisted REWORK_B

1. **DONE / FINALIZED:** Worker B called `submit_revision(case_id=3, bad_revision, bad_revision_sha256)` on **VerifiedRecovery V2**. [Transaction](https://explorer-studio.genlayer.com/tx/0xde33a8e14ef8a8809a47bf12118e5f8d860218808469765e912aa9796e8d8a8c) succeeded, returned **global attempt ID `2`** (Case #3 round `1`), and latest-final `get_attempt(2)` and `get_recovery(3)` confirmed exact signed content and digests.
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

### Case #3 V2 first signed revision — 2026-11-16 10:34 ICT

- **Confirmed live signed V2 transaction:** [`0xde33a8e14ef8a8809a47bf12118e5f8d860218808469765e912aa9796e8d8a8c`](https://explorer-studio.genlayer.com/tx/0xde33a8e14ef8a8809a47bf12118e5f8d860218808469765e912aa9796e8d8a8c). Correct destination VerifiedRecovery V2 `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`, method `submit_revision`; authorized Worker B, Normal execution, 5 initial validators, `FINALIZED / SUCCESS`. Return value **`2`**.
- Independently confirmed from `LATEST_FINAL get_attempt(2)`: `id=2`, `case_id=3`, `round=1`, `role=B`, signer `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`, `status=SUBMITTED`, `assessment={}`.
- `new_output={"reportedTotal":52,"summary":"Corrected approved total 52 from INV4 and INV6."}`, `new_sha256=4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a`.
- The new attempt frozen Court snapshot digest is `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7`; frozen Court verdict remains `REWORK_B`.
- Independently confirmed from `LATEST_FINAL get_recovery(3)`: `{"attempts":[2],"case_id":3,"latest_attempt":2,"state":"SUBMITTED"}`.
- **Important:** global attempt `2` is **round 1 of Case #3**, not the second revision for this case. The contract supports a maximum of 2 attempts **per case**. Existing global attempt `1` belongs to historical Case #2.
- **Next real signed action:** `assess_revision(attempt_id=2)` on VerifiedRecovery V2. The report value 52 conflicts with the locked approved total 50, but actual AI consensus remains **pending**. Do not assert FAIL or REVIEW until persisted final readback confirms it; do not finalize.

### Case #3 first AI assessment — UNDETERMINED / not persisted, 2026-11-16 10:39 ICT

- Transaction: [`0xa5b5abc9057688181f8d7a1750d94f6efaaeaaf784a00ddf516beb839b686a3e`](https://explorer-studio.genlayer.com/tx/0xa5b5abc9057688181f8d7a1750d94f6efaaeaaf784a00ddf516beb839b686a3e) on VerifiedRecovery V2, authorized Worker B, method `assess_revision(2)`. Explorer reports `FINALIZED`, **`Consensus Result: Undetermined`**, 3 rotations, 5 initial validators. GenVM leader execution reports `SUCCESS` and returns `"FAIL"`, with proposed assessment `agreement=FAIL`, `source=FAIL`, `dependency=FAIL`, citing the frozen agreement, source and A output.
- **Authoritative independent readback, `LATEST_FINAL`:** `get_attempt(2).status=SUBMITTED`, `get_attempt(2).assessment={}`, `get_recovery(3)={"attempts":[2],"case_id":3,"latest_attempt":2,"state":"SUBMITTED"}`. There is **no persisted FAIL**, no resolution, no second attempt yet. Court `get_case(3)` still `DECIDED / REWORK_B`.
- **Critical distinction:** `FINALIZED` transaction status and successful leader execution do **not** prove that an `Undetermined` consensus result was committed; GenLayer's equivalence principle docs explicitly state an undetermined transaction does not modify contract state: https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle .
- **Correct next action:** retry `assess_revision(attempt_id=2)` as a **new transaction** against VerifiedRecovery V2, Normal/Full Consensus, without resubmitting the revision. Check both consensus outcome and `LATEST_FINAL` state. Proceed to round 2 only if accepted consensus actually persists `FAIL` or `REVIEW`; do not call `finalize_recovery` or claim the negative-path test succeeded based only on the leader return.
- **Engineering risk:** the deployed assessment consensus asks validators to agree on all three reason texts and literal references, which may increase disagreement across AI executions. If retries remain Undetermined, investigate the equivalence principle and prepare a safer updated contract/deployment; **do not silently modify deployed-source archive or misrepresent that the current deployed contract was fixed**.

## Evidence gate — do not claim until observed

| Step | New transaction hash | Finalized result |
| --- | --- | --- |
| Court `open_case` | [0x9cb6ef…13b22f](https://explorer-studio.genlayer.com/tx/0x9cb6ef264f37ffae82ded480af5b7281bf4ac7863a0297e97530d5fad013b22f) | **FINALIZED / SUCCESS**; latest-final Court `get_case(3)` confirms owner, assigned workers, immutable task/source, `stage=OPEN`, `verdict=PENDING` |
| Court Worker A `submit_evidence` | [0xe37418…a7c1ba](https://explorer-studio.genlayer.com/tx/0xe374185b455195f0676f686cd1ddfb5c886fe94dc7765d5ef29983d7f8a7c1ba) | **FINALIZED / SUCCESS**, returned `A`; latest-final `get_case(3)` confirms A output and SHA-256 |
| Court Worker B `submit_evidence` | [0x154b40…1a6d13](https://explorer-studio.genlayer.com/tx/0x154b4036445940ecba3f04c0bfb985f27e2a97c69ed68541973326ff041a6d13) | **FINALIZED / SUCCESS**, returned `B`; latest-final `get_case(3)` confirms B output and SHA-256 |
| Court Owner `open_dispute(3)` | [0xe7c1ea…992cc](https://explorer-studio.genlayer.com/tx/0xe7c1eaf0f3ad201b37a8f8e583151815f358143b9c47e9cefc20cb8b242992cc) | **FINALIZED / SUCCESS**; latest-final `get_case(3).stage=DISPUTED`, reason stored, verdict `PENDING` |
| Court AI `adjudicate(3)` | [0x5ee0c1…85975](https://explorer-studio.genlayer.com/tx/0x5ee0c168cac54a23fec52d411a7534de31664f0bdd4dc49099b0ea95cba85975) | **FINALIZED / SUCCESS**; persisted `DECIDED / REWORK_B`, live `recovery_permission` authorizes Worker B |
| Rejected late Court `submit_evidence(3)` | [0xf4d939…a5b17](https://explorer-studio.genlayer.com/tx/0xf4d939016bec755c641dee611f92835ab9687edcf05b579d3da5b6562a2a5b17) | **FINALIZED / ERROR / Rollback**; `evidence window closed`; Court and V2 finalized state unchanged (not V2 revision) |
| V2 first `submit_revision(3)` | [0xde33a8…8d8a8c](https://explorer-studio.genlayer.com/tx/0xde33a8e14ef8a8809a47bf12118e5f8d860218808469765e912aa9796e8d8a8c) | **FINALIZED / SUCCESS**, returned global attempt ID `2`; `get_attempt(2)` status `SUBMITTED`, case `3`, round `1`, and verified hashes |
| V2 first `assess_revision(2)` | [0xa5b5ab…686a3e](https://explorer-studio.genlayer.com/tx/0xa5b5abc9057688181f8d7a1750d94f6efaaeaaf784a00ddf516beb839b686a3e) | **FINALIZED / consensus UNDETERMINED**, leader GenVM returned `FAIL` with 3/3 checks FAIL, but `LATEST_FINAL get_attempt(2)` is still `SUBMITTED`, `assessment={}`, and `get_recovery(3).state=SUBMITTED`; **no accepted/persisted FAIL** |
| V2 second revision / second assessment | PENDING | PENDING |
| V2 explicit finalization (only on PASS) | PENDING | PENDING |
| Rejected unauthorized/stale/finalize actions | PENDING | PENDING |

Additional `REWORK_A` dependency case must be demonstrated separately; this fixture only tests the B path. Do not change the deployed code or retroactively rewrite a record because AI reaches an unexpected but legitimate result.
