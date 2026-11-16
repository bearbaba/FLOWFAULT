# FLOWFAULT — Verified Rework and Evidence-Based Resolution

Implementation baseline: [`d61d80fc`](https://github.com/bearbaba/FLOWFAULT/tree/d61d80fc3bd4bdaa5b598255cb6436c6387922e9).

## What changed

The original RecoveryGate stores one authorized replacement and explicitly stops at `REWORK_SUBMITTED_NOT_VERIFIED`. The new **VerifiedRecovery** contract attaches to the same HandoffCourt and assesses signed revisions against the original immutable agreement and source. It records criterion-level results and literal evidence references before allowing an explicit resolution.

| Original | New implementation |
| --- | --- |
| One unassessed replacement | Up to two distinct, sequential, assessed revisions |
| Submission receipt | `PASS`, `FAIL`, or `REVIEW`, with three criterion checks |
| No recovery completion | Explicit finalization binds the latest passing attempt and both hashes |
| No dependency completion rule | B PASS may resolve the frozen-evidence case; A PASS remains `UPSTREAM_VERIFIED_B_REVIEW_REQUIRED` |
| Original explorer | Additional `/recovery.html` comparison, history, assessment and JSON evidence export |

This is a **new contract deployment**, not an upgrade to either original contract. Original Court decisions and V1 receipts remain untouched. V2 attempts begin independently; legacy receipts are never represented as verified repairs. A V2 resolution concerns only the frozen evidence, not actual off-chain performance.

## Fixed policy

- Responsible worker only; REWORK_A/REWORK_B required. SHARED and UNVERIFIABLE do not authorize recovery.
- The original task specification and source are the acceptance criteria. No owner override or mutable rubric exists.
- Two attempts maximum, fixed in this contract release. No extra attempt is granted by timeout or REVIEW.
- Only an assessed FAIL/REVIEW permits another distinct revision. PASS cannot be replaced; assessed attempts cannot be rerolled.
- All three checks must PASS: agreement, source support and role-specific dependency consistency.
- Every check must reference exact revision text plus relevant frozen evidence. Invalid structure or missing/made-up quotes yields REVIEW.
- Reference existence is validated deterministically; whether the reference supports the conclusion remains an AI-consensus judgment.
- Any uncertain check produces REVIEW even when another check fails.
- Finalization rechecks Court snapshot and exact latest attempt. It cannot close an A→B dependency after only A's repair.
- Following A verification, downstream B review remains an explicit unresolved step; this release does not implement automatic downstream resubmission.

## Validation completed locally

- 18 Python behavior tests against a GenLayer shim (authorization, hashes, snapshot changes, rounds, stale attempts, uncertain assessment, finalization and A/B dependency distinction).
- 19 JavaScript tests, including recovery eligibility and exact persisted-state verification.
- Vite production build.
- Unsigned Studionet schema generation for the three contracts, including the new VerifiedRecovery ABI.

These are implementation checks. Signed V2 acceptance is still pending; the historical V1 ledger does not establish V2 execution.

## Deploy in Studio

1. Use the exact bytes of `contracts/verified_recovery.py` from the final reviewed commit.
2. Select GenLayer Studionet. Deploy `VerifiedRecovery` with `court_address`:
   `0x02A5476d786f55a215B33d77bdb071acB787182b`.
3. Record deployment transaction and new contract address. Do not replace the V1 Gate address.
4. Run read-only source/binding verification:

   ```bash
   FLOWFAULT_COURT_ADDRESS=0x02A5476d786f55a215B33d77bdb071acB787182b \
   FLOWFAULT_VERIFIED_RECOVERY_ADDRESS=<new-address> npm run verify:recovery
   ```

5. Set `FLOWFAULT_VERIFIED_RECOVERY_ADDRESS` in the Vercel environment being tested and redeploy that environment. Retain existing Court/Gate variables.
6. Open `/recovery.html`. It checks the version, two-attempt policy, criteria and Court binding before enabling signing. The source-verification script separately verifies exact source bytes.

## Signed acceptance sequence

Use a **new case** for the main milestone demonstration so it is visibly new work. Case #2 may be used for an initial smoke test, but do not conflate its historic V1 receipt with a V2 verdict.

1. Create a task and original evidence using the existing workflow; obtain a persisted REWORK_B decision.
2. As the responsible B wallet, submit a still-incorrect report with its exact SHA-256. Assess it; record actual result. A failed or undetermined consensus transaction must not be reported as a stored verdict.
3. If the result is FAIL/REVIEW, submit a genuinely corrected report as round 2 and assess it.
4. If PASS is actually stored, finalize using that exact attempt ID. Verify `RESOLVED` and the revision/snapshot hashes independently.
5. Separately demonstrate REVIEW (ambiguous source), wrong-wallet rejection on an eligible fresh case, and A repair resulting only in `UPSTREAM_VERIFIED_B_REVIEW_REQUIRED`.
6. Inspect all readbacks with `npm run verify:recovery`, setting `FLOWFAULT_VERIFY_CASE` to the real Case ID. Export the UI evidence JSON. Record transaction hashes, execution results, and final states in a new evidence ledger.

Do not promise a predetermined AI result. Use a separate case if the two-attempt policy is exhausted; do not delete or rewrite history.

## Milestone submission gate

Portal **milestone v1** is the submission sequence; **VerifiedRecovery V2** is the product release. Before submission, link the actual diff/PR, deployed source proof, signed positive/negative evidence and a short new demo. Verify the accepted project snapshot against the portal to establish the precise before/after boundary. Keep the Changes & Improvements field under 1,000 characters and describe only verified delivered behavior.

## Deployment verified — 16 November 2026

- VerifiedRecovery: `0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71`.
- Latest-final stats: version `2.0.0`, max attempts `2`, criteria `agreement/source/dependency`, attempt count `0` at verification.
- Court binding: `0x02A5476d786f55a215B33d77bdb071acB787182b`.
- `contracts/verified_recovery_deployed.py` preserves exact source bytes retrieved from chain, SHA-256 `7581207c462bc57cc3456e1a00cc72b2709e76e8cb4852d0f1d4945b5717d82b`.
- Editable source differs only by CRLF versus LF and final newline. Both byte-level archive matching and line-ending-normalized development source matching are required by the verifier.
- Deployment is established; signed revision/assessment/finalization evidence is pending.
