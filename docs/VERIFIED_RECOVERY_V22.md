# FLOWFAULT VerifiedRecovery V2.2 — release-candidate acceptance gate

**STATUS: SOURCE IMPLEMENTED, BUILD/UNIT TESTS + GENLAYER UNSIGNED SCHEMA GREEN. NOT DEPLOYED.**

The goal is one **stable, honest** end-to-end recovery; not endless contract iterations or fabricated AI verdicts. This version fixes the highest-probability causes of V2/V2.1 repeated technical `REVIEW` while keeping its fail-closed security boundary.

## What live evidence actually proves

| Contract | Signed result | Remaining limitation |
| --- | --- | --- |
| V2 `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71` | Historic Court Case #2: AI PASS → signed RESOLVED. Fresh Case #3: FAIL, correctly rejected FAIL finalization, corrected second artifact led to technical REVIEW | Case #3 V2 frozen terminal REVIEW; cannot reassess |
| V2.1 `0xcbc76A74B062ec16740355170ffE1700932Db636` | New Case #3 correction signed and stored. First assessment and signed technical retry both accepted and stored REVIEW with 2/3 assessment runs used. | Last retry [tx `0x4f5f...2281b`](https://explorer-studio.genlayer.com/tx/0x4f5f5551f4813cc77eede0b62c0277ae8b4b53aaf7a3483dfedbb5601f12281b) was observed COMMITTING / NOMAJORITY at read time; leader returned REVIEW, but `LATEST_FINAL` still had only 2 runs. Do not call this a successful third assessment or a PASS. |
| V2.2 candidate | Source and deterministic tests only. **No contract address or signed V2.2 verdict** | Requires new deployment and independently verified live acceptance |

Evidence: [V2 Case #3](evidence/case-3-v2-fail-review.json) · [V2.1 first accepted retry](evidence/v21-case-3-first-retry-review.json).

## Concrete fix — remove model-generated verbatim quotation requirements

The V2.1 AI response had to produce three separate semantic decisions, a correctly sized rationale for each, **and** multiple verbatim textual quotes with strict field/length restrictions. The code repeatedly stored `checks=[]`, meaning the validator rejected output format or references. The precise root cause cannot be proven because raw LLM responses were not preserved; adding more retries alone is not a remedy.

V2.2 changes exactly this fragile interface:

1. Request **native JSON**: `gl.nondet.exec_prompt(prompt, response_format="json")`. GenLayer [documents this option](https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms) but still requires independent field validation.
2. Build a **deterministic reference bank** from the frozen original Court snapshot and signed correction. Only exact bounded fragments of `agreement`, `source`, `original_a`, `original_b`, and `revision` can be cited.
3. AI selects simple reference IDs, e.g. `["source:1","revision:1"]`, with its verdict and reason. **It cannot author its own literal quote bytes.** Contract validates ID existence, required field coverage, three unique criteria, verdict enums, rationale bounds, distinct references and literal mapping.
4. After validation, code expands references back into actual frozen bytes before storing, and validates the comparative result again. Any malformed or unsupported response remains **REVIEW**; it never becomes PASS by default. Independent validator comparisons must still agree on the substance, not identical prose.
5. V2.1 security stays: original signer only, frozen Court snapshot hash, SHA-256 checked correction, at most 2 revisions, at most 3 assessment runs per revision, immutable audit, current persisted PASS required for `finalize_recovery`, and A→B dependency caveat.

**Not a guaranteed fix:** unsigned GenLayer schema/shim tests cannot prove that live validators will produce substantive and accepted PASS. The evidence-ID approach reduces formatting failure, but the contract must still refuse an unsupported PASS.

## Quality gate before another wallet signature

- [x] New versioned [source](../contracts/verified_recovery_v22.py), unchanged V2/V2.1 deployed archives.
- [x] Strict [V2.2 tests](../tests/test_verified_recovery_v22.py) covering valid/invalid JSON, forged IDs, wrong field, duplicate IDs, canonical exact quotes, retry bounds, signer authorization, immutable snapshot and finalization.
- [x] [GenLayer schema CI](../scripts/schema-check.mjs) checks the V2.2 ABI.
- [x] Browser-side version gate accepts 2.2.0 only if the contract advertises `citation_mode=DETERMINISTIC_REFERENCE_IDS`.
- [ ] Full deploy / live new source match / constructor verification and preview update (not done).
- [ ] Accepted AI assessment that is actually stored as PASS on new V2.2, or explicit safe STOP if REVIEW/FAIL/NoMajority.
- [ ] Signed `finalize_recovery` producing `RESOLVED`, with independent `LATEST_FINAL` hash-bound resolution.
- [ ] Final reviewer walkthrough and truthful Milestone application.

## Minimal signed acceptance — only on actual V2.2 deployment

The existing **Court Case #3** remains `DECIDED / REWORK_B` with its original signed evidence. A new VerifiedRecovery V2.2 contract has independent new storage; reusing this old immutable Court case is honest when clearly labeled as a fresh V2.2 attempt, *not* pretending to create a fresh Court judgment.

1. Deploy [`contracts/verified_recovery_v22.py`](../contracts/verified_recovery_v22.py) as a separate GenLayer Studionet contract with constructor `court_address=0x02A5476d786f55a215B33d77bdb071acB787182b`. Record new address and deploy tx. **Do not deploy until the exact HEAD CI is green.**
2. Independently read `LATEST_FINAL stats()`: `version=2.2.0`, `max_attempts=2`, `max_assessment_runs=3`, `retry_policy=FORMAT_REVIEW_ONLY`, `citation_mode=DETERMINISTIC_REFERENCE_IDS`, original Court address. Download and archive exact on-chain source; compare to GitHub before signing.
3. Original Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` calls `submit_revision(3,output,sha256)`. Exact known-good signed artifact:
   ```json
   {"reportedTotal":50,"summary":"Approved invoices INV4 (31) and INV6 (19) total 50; INV5 (14) is unapproved. This agrees with Worker A approvedTotal 50."}
   ```
   SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`. Read actual returned *new* global attempt ID and verify stored bytes.
4. **Same Worker B** calls `assess_revision(actual_attempt_id)` in Normal Full Consensus, Simulation Off. Check transaction status, **validator consensus**, and `LATEST_FINAL get_attempt/get_recovery`. No return value or explorer `FINALIZED` alone is sufficient.
5. **Only after stored PASS** call `finalize_recovery(3,actual_attempt_id)` and check `RESOLVED` plus revision/snapshot SHA-256 in `resolution`. Do not count REVIEW/FAIL as closure.
6. If and only if *technical format fallback* REVIEW persists, at most one signer-only `retry_format_review` is allowed in this acceptance sprint before further root-cause debugging. **Do not repeatedly deploy or ask for unlimited wallet signatures.**

## Stop/go criterion for submission

**GO:** identical deployed source; both CI green at the submitted HEAD; signed current V2.2 PASS plus explicit RESOLVED with hashes; short understandable before/after and failure-path screenshots or references. Label V2/V2.1 signed historical outcomes separately.

**STOP:** if no accepted persisted PASS after initial V2.2 assessment and one authorized technical retry, keep PR Draft, preserve all truthfully observed failures, and diagnose from chain/GenVM traces before another code or deployment change. No fabricated verdict, dummy data or unverified claim. The goal is quality rather than chasing a 9/10 narrative.

Nothing in FLOWFAULT certifies external real-world execution. Consensus covers the frozen signed case evidence only.
