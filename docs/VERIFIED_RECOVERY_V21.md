# FLOWFAULT VerifiedRecovery V2.1 — deployed release under live acceptance

**Release gate: ON-CHAIN V2.1 SOURCE VERIFIED; FIRST SIGNED CORRECTION AND FIRST ACCEPTED FORMAT-FALLBACK REVIEW STORED; BOUNDED RETRY AND FINALIZATION PENDING.**
This is a **new Intelligent Contract**. It does not upgrade, reset, mutate, or replace the existing Studionet VerifiedRecovery V2 at `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`. The original HandoffCourt is unchanged. Do not submit a Milestone claiming V2.1 PASS/RESOLVED before signed assessment and finalization checks below.

## Why V2.1 exists — verified failure in V2

In freshly created original Court Case #3, signed GenLayer adjudication persisted `REWORK_B`. V2 round 1 produced a persisted, evidence-cited `FAIL`; attempting to finalize it rolled back as designed. V2 round 2 contained a corrected integer total (50) but accepted AI consensus produced a **format/reference validation fallback**: `{"verdict":"REVIEW","checks":[],"reason":"Assessment format or evidence references could not be verified."}`. V2 prohibits reassessing a stored `REVIEW` and has a two-revision cap, so Case #3 cannot be resolved there.

Sources: [signed Case #3 transaction ledger](VERIFIED_RECOVERY_NEXT_CASE.md) · [independent latest-final evidence export](evidence/case-3-v2-fail-review.json). **Do not misrepresent Case #3 as resolved or assume its corrected revision passed.** A separate historical Case #2 reached live PASS → RESOLVED on V2; see [Case #2 evidence](evidence/case-2-v2-finalized.json).

## Scoped changes

| Safety invariant | V2.1 rule |
| --- | --- |
| Only responsible worker may submit a correction | Preserved; SHA-256 of exact submitted bytes must match |
| No mutable task rules | Frozen original Court agreement/source and signed A/B outputs; same snapshot digest rechecked before each assessment |
| Submission cap | Still **2 different revisions per Case**, never extended by retry |
| Initial assessment | `assess_revision(attempt_id)` can run only on the current `SUBMITTED` attempt **signed by its original revision submitter**; unrelated callers cannot consume assessments |
| Retry eligible | **Only** `REVIEW` with **empty `checks`** and the *exact*, deterministic malformed-format/reference reason |
| Semantic REVIEW | Three validated checks with a REVIEW criterion are final for the attempt; **cannot** use technical retry |
| FAIL or PASS | **Cannot** be retried by `retry_format_review`; they remain immutable |
| Who may retry | **Only the signer of that exact corrective revision**, and only while it is the current attempt |
| Retry limit | **Initial assessment + at most 2 retries = 3 total AI runs per revision** |
| Audit | Each accepted assessment run adds an immutable run number, verdict, fallback flag and SHA-256 of canonical assessment; prior history stays on-chain |
| Resolution | Current stored `PASS` required; `FAIL`, `REVIEW`, and `Undetermined` are never treated as PASS |
| A→B dependency | Original rule preserved: A PASS leaves `UPSTREAM_VERIFIED_B_REVIEW_REQUIRED`, not full B closure |

The new `retry_format_review(attempt_id)` is a **separate explicit write method**. It does not replace `assess_revision`, mutate the correction text or digest, or override any valid assessment. The new `stats()` advertises `version: "2.1.0"`, `max_attempts: 2`, `max_assessment_runs: 3`, `retry_policy: "FORMAT_REVIEW_ONLY"`. The comparative consensus principle focuses on the three criterion decisions while still requiring evidence-grounded reasons and real literal citations; this may reduce incidental disagreement over wording, but live consensus is not guaranteed.

## Files

- **V2.1 source candidate:** [`contracts/verified_recovery_v21.py`](../contracts/verified_recovery_v21.py). This is the file to use in Studio. Do not upload `verified_recovery_deployed.py` or change its archived V2 source.
- **Behavior tests:** [`tests/test_verified_recovery_v21.py`](../tests/test_verified_recovery_v21.py), including 10 new retry-specific tests plus the original recovery cases. Tests run under a GenLayer shim; they are **not proof of live validator behavior**.
- **Updated comparison/wallet UI:** [`recovery.html`](../recovery.html) and [`src/recovery.js`](../src/recovery.js), backwards-compatible with a configured V2 address and exposing retry only when V2.1 actually reports that policy.
- **On-chain deployment check:** [`scripts/verify-recovery-v21.mjs`](../scripts/verify-recovery-v21.mjs) checks source text, Court binding, policy and optionally actual finalized attempts.
- **Schema CI:** [`scripts/schema-check.mjs`](../scripts/schema-check.mjs) requires that the versioned new contract expose `retry_format_review`.

## Independent deployment attestation — 16 November 2026 (COMPLETED)

- New contract: [`0xcbc76A74B062ec16740355170ffE1700932Db636`](https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636). User supplied Studio screenshot showing `FINALIZED` deployment and the `retry_format_review` method; full deploy transaction hash has not yet been supplied.
- Vercel milestone-branch preview only (production unchanged): [recovery interface](https://flowfault-jmxutcx6i-khaiptk1998-8088s-projects.vercel.app/recovery.html). Config on that preview points to the new V2.1 contract.
- Public RPC code fetched independently via [read-only source attestation](https://flowfault-jmxutcx6i-khaiptk1998-8088s-projects.vercel.app/api/verify-v21): exact source SHA-256 **`0262a6e3b6425bacd9abce60ed212b671c9dfd5ddaa2443863b29aa106b2d950`**. [Deployed source archive](../contracts/verified_recovery_v21_deployed.py) matches the RPC bytes exactly. [Developer candidate](../contracts/verified_recovery_v21.py) matches after CRLF/LF normalization.
- `LATEST_FINAL stats()`: `{"version":"2.1.0","max_attempts":2,"max_assessment_runs":3,"retry_policy":"FORMAT_REVIEW_ONLY","criteria":["agreement","source","dependency"],"court":"0x02A5476d786f55a215B33d77bdb071acB787182b","attempts":0}`.
- Deployed ABI: `submit_revision`, `assess_revision`, `retry_format_review`, `finalize_recovery`, `get_attempt`, `get_recovery`, `stats`.
- `LATEST_FINAL get_recovery(3)` on **new V2.1**: `{"attempts":[],"case_id":3,"latest_attempt":0,"state":"NOT_STARTED"}`. Same Court Case #3 remains `DECIDED / REWORK_B` and responsible Worker B remains unchanged.
- [Machine-readable independent deployment checks](evidence/v21-deployment-attestation.json), all source/policy/ABI/initial-state checks passed.
- **V2.1 first corrective transaction is now signed and stored**; it is not yet a successful V2.1 PASS or RESOLVED. See verified submission below.

## Deploy on GenLayer Studionet (wallet signing required)

1. Review the candidate source on the intended GitHub commit and wait for both GitHub CI workflows to succeed. Do not import an older V2 file in place of V2.1.
2. Open [GenLayer Studio](https://studio.genlayer.com/) on **Studionet, chain ID 61999**. Use *New Contract → Add From File* (or paste the **exact candidate source**) and deploy **`VerifiedRecovery`** from `contracts/verified_recovery_v21.py`.
3. Constructor `court_address`: **`0x02A5476d786f55a215B33d77bdb071acB787182b`**. Sign with a wallet you control in **Normal** mode, Simulation Mode off. Save the **new contract address** and deploy transaction hash; `FINALIZED` alone does not prove successful execution.
4. Verify `stats()` live: `version=2.1.0`, `max_attempts=2`, `max_assessment_runs=3`, `retry_policy=FORMAT_REVIEW_ONLY`, criteria `agreement/source/dependency`, original Court binding. Reject any mismatch.
5. Independently download the **deployed source bytes**, compare normalized candidate source, archive the exact deployed bytes as a **new** `contracts/verified_recovery_v21_deployed.py` only after actual deployment, and record its SHA-256 and deployment details. Never replace `verified_recovery_deployed.py`.
6. To verify locally against the actual V2.1 address:
   ```bash
   FLOWFAULT_COURT_ADDRESS=0x02A5476d786f55a215B33d77bdb071acB787182b \
   FLOWFAULT_VERIFIED_RECOVERY_ADDRESS=<ACTUAL_NEW_V21_ADDRESS> \
   npm run verify:recovery:v21
   ```
   For a populated recovery, also set `FLOWFAULT_VERIFY_CASE=3`. This command is **read-only**.
7. Configure a **separate Vercel preview** `FLOWFAULT_VERIFIED_RECOVERY_ADDRESS` to the new address; do not modify the production V1 deployment before live acceptance. `/recovery.html` checks the linked contract's version/policy and reads `LATEST_FINAL`.

## V2.1 first signed revision — Accepted and persisted, 16 November 2026

- Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` signed [`submit_revision(3,corrected_output,corrected_sha256)` tx `0xa8edcf2e1fd53ce3d7513fb969da8bc12b73a2e530fb6653f9dc8aa5ba389aa8`](https://explorer-studio.genlayer.com/tx/0xa8edcf2e1fd53ce3d7513fb969da8bc12b73a2e530fb6653f9dc8aa5ba389aa8) to the **new V2.1** address, Normal consensus, 5 initial validators, zero rotations, **FINALIZED / SUCCESS / MAJORITYAGREE**, return value **1**.
- Independent `LATEST_FINAL get_attempt(1)`: `case_id=3`, `round=1`, `role=B`, authorized Worker B signer, `new_output` contains `reportedTotal=50`, exact SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`, frozen snapshot SHA-256 `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7`.
- `get_attempt(1).status=SUBMITTED`, `assessment={}`, `assessment_history=[]`, `assessment_runs=0`. `LATEST_FINAL get_recovery(3)={"attempts":[1],"case_id":3,"latest_attempt":1,"state":"SUBMITTED"}`.
- Original Court remains `DECIDED / REWORK_B`; new V2.1 `stats().version=2.1.0`, `retry_policy=FORMAT_REVIEW_ONLY` remain correct.
- [Machine-readable independently verified submission](evidence/v21-case-3-attempt-1-submitted.json).
- **Next unsigned action:** Worker B `assess_revision(attempt_id=1)` on **new V2.1 contract**. Do not submit another revision, call technical retry before an eligible persisted format-fallback REVIEW, or finalize without current persisted PASS. On consensus Undetermined, independently confirm the unchanged state before resubmitting the assessment.

## V2.1 first AI assessment — Accepted technical REVIEW with auditable retry eligibility

- [`assess_revision(1)` signed tx `0xcbb5ff4e78f43b65335c8c3ab92a9da580320435cf075ce8c88d503d667db37d`](https://explorer-studio.genlayer.com/tx/0xcbb5ff4e78f43b65335c8c3ab92a9da580320435cf075ce8c88d503d667db37d) was signed by Worker B on V2.1, Normal mode, **FINALIZED / SUCCESS / MAJORITYAGREE** (0 rotations, 5 initial validators). Returned **REVIEW**.
- AI equivalence output and persisted attempt assessment: `{"checks":[],"reason":"Assessment format or evidence references could not be verified.","verdict":"REVIEW"}`. This is a *format/reference validation fallback*; do **not** describe it as a substantive assessment of all three criteria or as an accepted PASS.
- Independent `LATEST_FINAL get_attempt(1)`: `status=REVIEW`, `assessment_runs=1`, `assessment_history=[{"assessment_sha256":"717e13de050520655af943e7f4ca368cf33ef19bc9d5c11c3d6b5e7af39cb40c","format_fallback":true,"run":1,"verdict":"REVIEW"}]`. Revision SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367` and frozen Court snapshot SHA-256 `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7` remain unchanged.
- Independent `LATEST_FINAL get_recovery(3)`: `{"attempts":[1],"case_id":3,"latest_attempt":1,"state":"REVIEW"}`. `stats()` still advertises `max_assessment_runs=3` and `retry_policy=FORMAT_REVIEW_ONLY`; only **1/3** assessment runs used.
- **Correct next action:** original correction signer Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` signs `retry_format_review(attempt_id=1)` on the **new V2.1 contract**; no extra revision and no finalize. This is the first real live test of bounded retry logic and its audit trail; subsequent outcome remains unknown.
- [Machine-readable proof of persisted REVIEW and retry eligibility](evidence/v21-case-3-initial-review.json).

## Signed acceptance on the NEW V2.1 address — continued checks

The same **immutable original HandoffCourt Case #3** can be reused as a *new, independent V2.1 recovery*, because the V2.1 deployment has its own fresh storage. This does **not** alter or repair the terminal REVIEW in historical V2. It avoids inventing a new Court adjudication solely to replay the previously validated task.

- **DONE / verified historically:** V2.1 started at `get_recovery(3).state=NOT_STARTED`, `attempts=[]` and original Court `DECIDED/REWORK_B`.
- **DONE / verified:** Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` signed `submit_revision(3, corrected_output, SHA256)` on **NEW V2.1 address**, using the correct report:
  ```json
  {"reportedTotal":50,"summary":"Approved invoices INV4 (31) and INV6 (19) total 50; INV5 (14) is unapproved. This agrees with Worker A approvedTotal 50."}
  ```
  Exact SHA-256: `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`. This started the new deployment's own round 1 and returned its **actual new global attempt ID = 1** (not the old V2 global attempt ID 3).
- **DONE:** same Worker B signer ran `assess_revision(1)` in Normal full consensus; persisted technical format/reference `REVIEW`, with assessment audit run 1/3. Next is the separate `retry_format_review(1)` write on V2.1, not a duplicate initial assessment. If consensus is Undetermined, **no stored assessment** can be claimed; retry the uncommitted transaction only after final-state verification.
- **If `REVIEW` due to invalid assessment structure/quotes**, the *original signing Worker B* can call `retry_format_review(attempt_id)` at most **twice** on the *same* attempt, with each accepted retry's audit stored. **Do not use this method for a valid semantic REVIEW, FAIL or PASS.** The retry method cannot guarantee PASS.
- **Only if Accepted consensus has persisted `PASS`** may anyone call `finalize_recovery(3,attempt_id)`. Verify the finalized `RESOLVED` state and matching snapshot/revision SHA-256. If PASS is not obtained, keep the true FAIL/REVIEW outcome and stop. If correction rounds remain, a separate, truly distinct revision may be submitted under existing limits, never as a bypass.
- Record signed transaction hashes, status, execution, consensus (including rotation), `LATEST_FINAL` readbacks, old V2 vs new V2.1 address, screenshot/demo and evidence export. Update the PR only with completed facts.

## Frontend and transaction-finality safeguards

The preview `/recovery.html` only enables initial assessment for the authorized submitting worker on V2.1, whereas the already deployed V2 remains backward-compatible. Read-only browsing does not require a wallet. The transaction-status API now exposes the consensus result (`MajorityAgree`, `NoMajority`, etc.) alongside GenVM execution and the stored status. A finalized transaction whose leader returned successfully but validators recorded `NoMajority` is **not** classified as a committed success. Every write also requires matching `LATEST_FINAL` readback before displaying success. This addresses the live V2 Undetermined scenario from Case #3 without retroactively relabeling it.

## Release checklist (all required before Milestone submission)

- [x] Versioned V2.1 source on GitHub; archived V2 source unchanged
- [x] New retry gate, two-attempt cap, signer restriction and assessment audit implemented
- [x] Pure/shim tests and JS UI wiring implemented (CI results must be checked for the final commit)
- [x] V2.1 new address deployed on Studionet; chain code and latest-final methods/stats verified (full deployment transaction hash still to be recorded)
- [x] Deployed **exact** source archive captured + constructor/version/binding checked from `LATEST_FINAL`
- [ ] At least one signed V2.1 PASS and explicit RESOLVED, or honestly document any limitation (**first signed revision stored; AI assessment pending**)
- [ ] Signed format-fallback retry — now **eligible** after real accepted `REVIEW`; no retry signed yet. Do **not** manufacture a malformed LLM response
- [ ] Browser wallet walkthrough and evidence export tested on live new address
- [ ] Final PR/CI green, concise before/after demo and accurately scoped Milestone evidence
- [ ] **Only then** submit GenLayer Builder Milestone; no milestone submitted by this PR

**Security boundary:** this release improves recovery from *unverifiable AI output*, not from a substantive judgment. It intentionally makes no claim about real-world off-chain execution, payouts, or unseen external events.
