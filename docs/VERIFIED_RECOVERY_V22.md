# FLOWFAULT VerifiedRecovery V2.2 — verified signed PASS → RESOLVED

**STATUS (16 Nov 2026): DEPLOYED ON STUDIONET. EXACT SOURCE ARCHIVED; CODE, ABI AND COURT BINDING VERIFIED. SIGNED `SUBMITTED → PASS → RESOLVED` FULLY ACCEPTED AND ATTESTED FROM `LATEST_FINAL`. Milestone application not submitted.**

The goal is one **stable, honest** end-to-end recovery; not endless contract iterations or fabricated AI verdicts. This version fixes the highest-probability causes of V2/V2.1 repeated technical `REVIEW` while keeping its fail-closed security boundary.

## What live evidence actually proves

| Contract | Signed result | Remaining limitation |
| --- | --- | --- |
| V2 `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71` | Historic Court Case #2: AI PASS → signed RESOLVED. Fresh Case #3: FAIL, correctly rejected FAIL finalization, corrected second artifact led to technical REVIEW | Case #3 V2 frozen terminal REVIEW; cannot reassess |
| V2.1 `0xcbc76A74B062ec16740355170ffE1700932Db636` | New Case #3 correction signed and stored. First assessment and signed technical retry both accepted and stored REVIEW with 2/3 assessment runs used. | Final retry [tx `0x4f5f...2281b`](https://explorer-studio.genlayer.com/tx/0x4f5f5551f4813cc77eede0b62c0277ae8b4b53aaf7a3483dfedbb5601f12281b) eventually FINALIZED / MajorityDisagree (Undetermined); its leader produced PASS, but final V2.1 `get_attempt(1)` remained REVIEW with only 2 stored runs. The leader-only PASS was **not committed**. |
| **V2.2 `0x6a9E026adfD607f087626B06e293e7b277AD3966`** | **Three signed calls accepted (`MAJORITYAGREE`)**: Case #3 correction SUBMITTED → AI PASS (agreement/source/dependency, all with literal evidence IDs) → **RESOLVED**. `LATEST_FINAL` confirms hashes and Court unchanged. [Proof export](evidence/v22-case-3-pass-resolved.json). | One frozen synthetic invoice test case; not a guarantee for unseen prompts or real-world execution. |

Evidence: [V2 Case #3](evidence/case-3-v2-fail-review.json) · [V2.1 first accepted retry](evidence/v21-case-3-first-retry-review.json).

## Verified live V2.2 deployment and three accepted transactions

**Contract:** [Studio import `0x6a9E026adfD607f087626B06e293e7b277AD3966`](https://studio.genlayer.com/?import-contract=0x6a9E026adfD607f087626B06e293e7b277AD3966) · GenLayer Studionet 61999 · constructor Court `0x02A5476d786f55a215B33d77bdb071acB787182b`.

- [Deployed source archive](../contracts/verified_recovery_v22_deployed.py) matches raw RPC bytes **exactly**, SHA-256 `3651ed0280a03c4c45bc9efda1900f1755c222f63c104fb5579be00a6bb06569`; [developer source](../contracts/verified_recovery_v22.py) matches after CRLF/LF normalization. `LATEST_FINAL stats().version=2.2.0`, `citation_mode=DETERMINISTIC_REFERENCE_IDS`, `max_attempts=2`, `max_assessment_runs=3`, `retry_policy=FORMAT_REVIEW_ONLY`, correct original Court.
- **1 — SUBMITTED:** [Worker B signed `submit_revision(3,...)` tx `0xcfbee2d5…7a380`](https://explorer-studio.genlayer.com/tx/0xcfbee2d522e6babe67d2d1ddaa84a128690fe920dd15c5acd03923755ee7a380), FINALIZED / GenVM SUCCESS / MAJORITYAGREE. Returns **global attempt 1** in new V2.2 storage, with SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`, frozen Court snapshot SHA-256 `ddbc4e41fa32f5e3ecd4dafda5c3b151902a6b296c660fd837832e22219971e7`.
- **2 — PASS:** [Worker B signed `assess_revision(1)` tx `0xe3b43a7e…ba38`](https://explorer-studio.genlayer.com/tx/0xe3b43a7e1414a79f808d1822de844c41b5bc455335b238f3fc8ca8766fc2ba38), FINALIZED / GenVM SUCCESS / MAJORITYAGREE (1 rotation); `LATEST_FINAL get_attempt(1)` confirms PASS on **agreement**, **source**, and **dependency**. All selected reference IDs resolve byte-for-byte to genuine frozen evidence; `assessment_runs=1`, `assessment_history[0].format_fallback=false`, `assessment_sha256=8866fd985e5511c826003ac1d29d607e0339f1bb2b17daa96c1776ec8e7772c3`.
- **3 — RESOLVED:** [`finalize_recovery(3,1)` tx `0x9ef5bd6f…263b`](https://explorer-studio.genlayer.com/tx/0x9ef5bd6f5e4149a6cc4f699da4c7ee0dd403e527f184cfb5ea4139561f9e263b), FINALIZED / GenVM SUCCESS / MAJORITYAGREE (0 rotations). `LATEST_FINAL get_recovery(3)` reports `state=RESOLVED`, `attempts=[1]`, `resolution.attempt_id=1`, `scope=FROZEN_EVIDENCE_ONLY` and both matching immutable SHA-256 values. The original Court remains `DECIDED / REWORK_B` and is not mutated.
- **Evidence:** [Machine-readable independent source, tx, state, and exact-reference verification](evidence/v22-case-3-pass-resolved.json).
- **Limitations:** accepted AI consensus is for this one synthetic frozen-evidence invoice case, not certification of real money movements or all future model outputs; no V2.2 technical retry was required in this positive path. Deployment tx hash was not separately supplied, but deployed source/ABI/stats and finalized writes are directly verified.

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
- [x] Live separate Studionet deployment; on-chain source match, constructor binding, ABI, and branch-only preview address verified.
- [x] Accepted and persisted AI PASS for all three criteria on new V2.2, no retry needed.
- [x] Signed `finalize_recovery` accepted; `LATEST_FINAL RESOLVED` with matching signed revision and snapshot SHA-256.
- [ ] Final reviewer-facing walkthrough/screenshots and truthful Milestone form; **not submitted**.

## Minimal signed acceptance — only on actual V2.2 deployment

The existing **Court Case #3** remains `DECIDED / REWORK_B` with its original signed evidence. V2.2 started with independent empty storage and was verified in a fresh V2.2 attempt, not a newly fabricated Court judgment. The procedure below documents the signed acceptance already completed; it does not request further writes.

1. **DONE:** deployed [`contracts/verified_recovery_v22.py`](../contracts/verified_recovery_v22.py) as a separate GenLayer Studionet contract with constructor `court_address=0x02A5476d786f55a215B33d77bdb071acB787182b`. Record new address and deploy tx. **Do not deploy until the exact HEAD CI is green.**
2. **DONE:** independently read `LATEST_FINAL stats()`: `version=2.2.0`, `max_attempts=2`, `max_assessment_runs=3`, `retry_policy=FORMAT_REVIEW_ONLY`, `citation_mode=DETERMINISTIC_REFERENCE_IDS`, original Court address. Download and archive exact on-chain source; compare to GitHub before signing.
3. **DONE:** original Worker B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` called `submit_revision(3,output,sha256)`. Exact known-good signed artifact:
   ```json
   {"reportedTotal":50,"summary":"Approved invoices INV4 (31) and INV6 (19) total 50; INV5 (14) is unapproved. This agrees with Worker A approvedTotal 50."}
   ```
   SHA-256 `074fdf2305647a4a259f7ff299b024d46d117d5d96ad7157c8f7682c5beb4367`. Read actual returned *new* global attempt ID and verify stored bytes.
4. **DONE:** same Worker B called `assess_revision(actual_attempt_id)` in Normal Full Consensus, Simulation Off. Check transaction status, **validator consensus**, and `LATEST_FINAL get_attempt/get_recovery`. No return value or explorer `FINALIZED` alone is sufficient.
5. **DONE:** only after stored PASS, Worker B called `finalize_recovery(3,actual_attempt_id)` and check `RESOLVED` plus revision/snapshot SHA-256 in `resolution`. Do not count REVIEW/FAIL as closure.
6. **NOT NEEDED:** No V2.2 technical format fallback occurred in this signed path; no retry used. The existing retry limit remains part of the verified code and automated tests.

## Stop/go criterion for submission

**ON-CHAIN GO ACHIEVED:** exact deployed source archive, source/court/ABI verified, signed current V2.2 PASS plus explicit RESOLVED with hashes, and live source-to-reference-ID checks. Both CI workflows must remain green at the final submitted HEAD; a concise demo and reviewer-facing before/after remain the last submission packaging tasks. Label V2/V2.1 signed historical outcomes separately.

**Historical STOP guard preserved:** if a future assessment does not achieve a persisted accepted PASS, do not claim resolution or keep signing transactions indefinitely. The verified V2.2 Case #3 already met the signed acceptance criteria; do not present this single case as proof of universal reliability.

Nothing in FLOWFAULT certifies external real-world execution. Consensus covers the frozen signed case evidence only.
