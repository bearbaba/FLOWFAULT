# FLOWFAULT V2 — fresh-case signed negative-to-positive acceptance plan

**FINAL STATE VERIFIED — fresh signed Court Case #3 remains `DECIDED / REWORK_B`; V2 attempt #2 (round 1) persisted FAIL with 3/3 failed criteria, signed finalization of that FAIL rolled back; corrected V2 attempt #3 (round 2) returned and PERSISTED `REVIEW` with `checks=[]` due to invalid AI assessment format/references. Case #3 V2 state is REVIEW, not RESOLVED. Both allowed revision rounds are exhausted, and current deployed code cannot reassess this REVIEW.** This is a reproducible synthetic fixture for the next Milestone test, separate from the already verified historical Case #2 [RESOLVED proof](evidence/case-2-v2-finalized.json).

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
2. **DONE / Accepted and persisted on retry:** the first `assess_revision(2)` transaction was Undetermined and did not persist; the second [signed assessment transaction](https://explorer-studio.genlayer.com/tx/0xcf25c531fb700485041f27872a3cf7cd1978306e753a7abe38ed8a62fbc98f8d) achieved Accepted consensus, returned `FAIL`, and latest-final state now stores all three FAIL checks. `finalize_recovery(case_id=3,attempt_id=2)` was subsequently rejected by a signed transaction with `verified PASS required` rollback; see verified guard below.
3. **DONE / FINALIZED:** After the first persisted FAIL, Worker B signed the distinct second revision: [transaction](https://explorer-studio.genlayer.com/tx/0xfdf4f91c64ec1cbebef79f65d26dd6834a55369f2f597094df31e3febba80fd4), global attempt **3** (Case #3 round **2**). The subsequently signed [`assess_revision(3)` transaction](https://explorer-studio.genlayer.com/tx/0x785906609fb3d0647ccd59ed1297b07aaedb88989da3155e532d1e5d841a157f) achieved Accepted consensus and persisted **REVIEW** with empty checks. There is **no PASS or RESOLVED** for Case #3.
4. **VERIFIED terminal state:** Case #3 round 1 = global attempt 2 remains immutable and FAIL; Case #3 round 2 = global attempt 3 is current, stores REVIEW, and the recovery has no resolution hashes. Historical Case #2 alone contains an independently verified RESOLVED/PASS record. On deployed V2, repeat `assess_revision(3)` is blocked (requires SUBMITTED), third `submit_revision(3)` is blocked (two-attempt limit), and `finalize_recovery(3,3)` requires PASS; do **not** send these predictably failing transactions.

### First V2 revision — deliberately still incorrect

`new_output`:

```json
{"reportedTotal":52,"summary":"Corrected approved total 52 from INV4 and INV6."}
```

`new_sha256`: `4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a`

### Second V2 revision — signed and stored after accepted first FAIL

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
- **Historical checkpoint:** this retry was subsequently signed with Accepted consensus and a persisted FAIL; details below. This remains a real example of a prior Undetermined result, which should not be erased or counted as successfully committed.
- **Engineering risk:** the deployed assessment consensus asks validators to agree on all three reason texts and literal references, which may increase disagreement across AI executions. If retries remain Undetermined, investigate the equivalence principle and prepare a safer updated contract/deployment; **do not silently modify deployed-source archive or misrepresent that the current deployed contract was fixed**.

### Case #3 accepted AI FAIL (persisted) — 2026-11-16 10:47 ICT

- [Transaction `0xcf25c531fb700485041f27872a3cf7cd1978306e753a7abe38ed8a62fbc98f8d`](https://explorer-studio.genlayer.com/tx/0xcf25c531fb700485041f27872a3cf7cd1978306e753a7abe38ed8a62fbc98f8d): authorized Worker B, VerifiedRecovery V2, `assess_revision(2)`, Normal mode, **Accepted consensus (5 initial validators, 0 rotations), FINALIZED / SUCCESS**, returned `FAIL`.
- Independent `LATEST_FINAL get_attempt(2)`: `status=FAIL`, `assessment.verdict=FAIL`, and **all three** `agreement=FAIL`, `source=FAIL`, `dependency=FAIL` with criterion-specific reasons and literal references into the frozen agreement, source, Worker A output and bad revision.
- Frozen approved arithmetic: INV4 (31) + INV6 (19) = 50; unapproved INV5 (14) excluded. Revision reports `reportedTotal=52`, inconsistent with source, original Worker A `approvedTotal=50`, and contract.
- Independent `LATEST_FINAL get_recovery(3)`: `{"attempts":[2],"case_id":3,"latest_attempt":2,"state":"FAIL"}` (**not RESOLVED**).
- Original Court remains `DECIDED / REWORK_B`, attempt #2 snapshot digest `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7` and revision digest `4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a` are unchanged.
- The previous [Undetermined consensus attempt](https://explorer-studio.genlayer.com/tx/0xa5b5abc9057688181f8d7a1750d94f6efaaeaaf784a00ddf516beb839b686a3e) is retained in this ledger as a separate transaction that **did not** persist its proposed FAIL. Accepted and Undetermined must not be conflated.
- **Permitted next step:** Worker B may now submit the **different second correction** listed in this fixture: `reportedTotal=50`, exact 153-byte `new_output`, SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`, subject to the contract's two-attempt limit. Global attempt ID will come from finalized return; do not assume it is 3.
- **Optional extra negative guard:** before that second revision, a deliberate `finalize_recovery(3,2)` may be submitted to show actual rollback on `verified PASS required`. This rejected transaction is **not yet observed**. Because the source guard requires persisted PASS, an attempted finalize cannot validly resolve the existing FAIL; record actual transaction status and state readback rather than inferring.
- **Do not finalize now.** Only a later accepted, persisted PASS on the current second attempt can authorize actual finalization.

### Case #3 rejected FAIL finalization — 2026-11-16 10:53 ICT

- **Signed negative-guard transaction:** [`0x086b96465b8be54d731feaf317add9dd86f1075b8486b793cf9c983f62d4dc4f`](https://explorer-studio.genlayer.com/tx/0x086b96465b8be54d731feaf317add9dd86f1075b8486b793cf9c983f62d4dc4f). Authorized Worker B called `finalize_recovery(case_id=3,attempt_id=2)` on VerifiedRecovery V2, Normal mode, Accepted consensus, 0 rotations and 5 initial validators.
- **Correct guard result:** transaction `FINALIZED` but GenVM execution `ERROR / Rollback`, exact error `verified PASS required`. It is **not** a successful finalization.
- Independent `LATEST_FINAL get_recovery(3)` after rollback: `{"attempts":[2],"case_id":3,"latest_attempt":2,"state":"FAIL"}`, **no** `resolution`.
- Independent `LATEST_FINAL get_attempt(2)` after rollback: `status=FAIL`, stored `agreement/source/dependency` all FAIL, `new_sha256=4cf8445b0d6f1c1fb815b0c11e4fb5d5e27f83fe1b854eb89baaba82e72f656a`, original snapshot SHA-256 `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7`.
- Court `get_case(3)` remains `DECIDED / REWORK_B`. **Security finding supported by on-chain evidence:** a FAIL assessment cannot be used to finalize a recovery; failed finalize did not consume the remaining correction slot.
- **Historical checkpoint:** Worker B subsequently signed and stored the second distinct revision, global attempt #3, Case #3 round 2, with the exact output/digest above. Its AI assessment and eventual resolution are still pending.

### Case #3 second corrected revision signed — 2026-11-16 10:56 ICT

- [`submit_revision(3)` tx `0xfdf4f91c64ec1cbebef79f65d26dd6834a55369f2f597094df31e3febba80fd4`](https://explorer-studio.genlayer.com/tx/0xfdf4f91c64ec1cbebef79f65d26dd6834a55369f2f597094df31e3febba80fd4): authorized Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`, VerifiedRecovery V2, Normal mode, 5 initial validators, 0 rotations, Accepted consensus, **FINALIZED / SUCCESS**; returns global attempt ID **3**.
- `LATEST_FINAL get_attempt(3)`: `case_id=3`, `role=B`, `round=2`, `actor` matches assigned Worker B, `status=SUBMITTED`, `assessment={}`.
- `new_output={"reportedTotal":50,"summary":"Approved invoices INV4 (31) and INV6 (19) total 50; INV5 (14) is unapproved. This agrees with Worker A approvedTotal 50."}`.
- `new_sha256=074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`; frozen snapshot SHA-256 `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7`, identical to round 1.
- `LATEST_FINAL get_recovery(3)={"attempts":[2,3],"case_id":3,"latest_attempt":3,"state":"SUBMITTED"}`. Old `get_attempt(2).status=FAIL` and `assessment.verdict=FAIL` remain persisted with all three checks FAIL; the signed failed-finalization safeguard remains independently proved.
- `LATEST_FINAL stats.attempts=3` counts **global** attempts across all cases; the contract cap of 2 is **per case**. Both rounds of Case #3 are now used.
- **Historical checkpoint:** the second assessment was subsequently submitted and persisted REVIEW, not PASS, as documented below. Do not send another `submit_revision` or `assess_revision(3)` on the deployed contract; both attempts are spent and the current attempt is no longer SUBMITTED.

### Case #3 second AI assessment accepted REVIEW — 2026-11-16 11:00 ICT

- Worker B signed [`assess_revision(3)` tx `0x785906609fb3d0647ccd59ed1297b07aaedb88989da3155e532d1e5d841a157f`](https://explorer-studio.genlayer.com/tx/0x785906609fb3d0647ccd59ed1297b07aaedb88989da3155e532d1e5d841a157f) against VerifiedRecovery V2 `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71` in Normal mode: **FINALIZED / SUCCESS, Accepted consensus**, 0 rotations, 5 initial validators. GenVM returns **REVIEW**, not PASS.
- Actual agreed equivalence output: `{"checks":[],"reason":"Assessment format or evidence references could not be verified.","verdict":"REVIEW"}`. The empty checks indicate the contract's structural/literal-reference validation fallback, **not three criterion-specific AI findings**. No individual claim of semantic agreement/source/dependency FAIL can be inferred from this REVIEW.
- Independent `LATEST_FINAL get_attempt(3)`: `status=REVIEW`, `round=2`, exact second revision digest `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`, same Court snapshot digest `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7`, `assessment.verdict=REVIEW`, `assessment.checks=[]`, `assessment.reason="Assessment format or evidence references could not be verified."`.
- Independent `LATEST_FINAL get_recovery(3)`: `{"attempts":[2,3],"case_id":3,"latest_attempt":3,"state":"REVIEW"}` without `resolution`. `get_attempt(2).status=FAIL` is unchanged, and Court remains `DECIDED / REWORK_B`.
- **The corrected report appears arithmetically consistent** (approved INV4 31 + INV6 19 = 50, INV5 unapproved), but this does **not** prove it passed AI consensus. The REVIEW arose because a valid structured assessment with evidence references was not verified.
- **Deployed V2 limitation (verified against source archive):** `assess_revision` requires current `status=SUBMITTED`, so the REVIEW cannot be reassessed. `submit_revision` enforces `len(r["attempts"]) < 2`, so another revision for Case #3 is prohibited. `finalize_recovery` requires current `PASS` and cannot resolve this REVIEW.
- **Correct next scope:** preserve Case #3 as terminal REVIEW evidence and its original hashes. The separately signed historical Case #2 already has accepted PASS and RESOLVED; do not combine it into Case #3. A fresh Court case is needed for another post-upgrade positive run on the current immutable V2. Any improvement permitting safe retry of purely malformed assessment results requires a **new, explicitly versioned contract deployment with new signed evidence**, not an edit to the historical deployed-source archive.
- Companion machine-readable export: [`docs/evidence/case-3-v2-fail-review.json`](evidence/case-3-v2-fail-review.json).

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
| V2 accepted retry of `assess_revision(2)` | [0xcf25c5…98f8d](https://explorer-studio.genlayer.com/tx/0xcf25c531fb700485041f27872a3cf7cd1978306e753a7abe38ed8a62fbc98f8d) | **FINALIZED / SUCCESS / Accepted**, returned `FAIL`; latest-final `get_attempt(2).status=FAIL`, 3/3 checks FAIL with evidence references, and `get_recovery(3).state=FAIL` |
| V2 second `submit_revision(3)` | [0xfdf4f9…a80fd4](https://explorer-studio.genlayer.com/tx/0xfdf4f91c64ec1cbebef79f65d26dd6834a55369f2f597094df31e3febba80fd4) | **FINALIZED / SUCCESS / Accepted**; returned global attempt `3`, Case #3 round `2`; latest-final attempt3 status SUBMITTED, `get_recovery(3).attempts=[2,3]`, previous attempt2 still FAIL |
| V2 second `assess_revision(3)` | [0x785906…1a157f](https://explorer-studio.genlayer.com/tx/0x785906609fb3d0647ccd59ed1297b07aaedb88989da3155e532d1e5d841a157f) | **FINALIZED / SUCCESS / Accepted**, returned **REVIEW**; latest-final `get_attempt(3)` stores `status=REVIEW`, `assessment={"verdict":"REVIEW","checks":[],"reason":"Assessment format or evidence references could not be verified."}`, and `get_recovery(3).state=REVIEW` |
| V2 explicit finalization of Case #3 | NOT PERFORMED | **Not authorized:** no PASS on current attempt #3; Case #3 remains REVIEW without a resolution. Historical Case #2 was independently RESOLVED. |
| V2 rejected `finalize_recovery(3,2)` after FAIL | [0x086b96…d4dc4f](https://explorer-studio.genlayer.com/tx/0x086b96465b8be54d731feaf317add9dd86f1075b8486b793cf9c983f62d4dc4f) | **FINALIZED / Accepted / ERROR / Rollback**, `verified PASS required`; latest-final recovery and attempt both remain `FAIL`, no resolution |
| Other rejected authorization / stale / duplicate actions | PENDING | PENDING |

Additional `REWORK_A` dependency case must be demonstrated separately; this fixture only tests the B path. Do not change the deployed code or retroactively rewrite a record because AI reaches an unexpected but legitimate result.
