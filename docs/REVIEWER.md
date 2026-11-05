# FLOWFAULT — GenLayer Project Reviewer Guide

**Status: source/schema and linkage verified; full positive-path signed Studio execution recorded on 2026-11-05.** Case #1 persisted `DECIDED / REWORK_B`; RecoveryGate receipt #1 persisted `REWORK_SUBMITTED_NOT_VERIFIED`. [Full real transaction ledger](ONCHAIN_EVIDENCE.md) · [preflight](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799). Certain negative tests remain undocumented and must not be claimed.

Project: https://github.com/bearbaba/FLOWFAULT
Website: https://flowfault-khaiptk1998-8088s-projects.vercel.app
Court: `0x02A5476d786f55a215B33d77bdb071acB787182b`
Gate: `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8`
Network: GenLayer Studionet 61999.

## Distinct problem and actual work

An owner freezes an agreement and input source. Two separate worker wallets sign different evidence records. The bundled lib/workers.js executes real deterministic calculations on a synthetic invoice fixture, not a mocked AI result: A extracts approved IDs and sum; B generates a dependent report from A. A testing switch creates a measurable, intentionally faulty B report. The frozen on-chain source + artifacts + dispute are interpreted by GenLayer comparative AI consensus as REWORK_A / REWORK_B / SHARED / UNVERIFIABLE. Separate RecoveryGate checks the Court's live permission and permits only the singled-out worker to submit one replacement artifact. The receipt says REWORK_SUBMITTED_NOT_VERIFIED, NOT “fixed” or “accepted.”

## Method and return map

| UI action | Contract call | Inputs | State/readback |
|---|---|---|---|
| Open task | HandoffCourt.open_case | worker A, worker B, full task spec, source text | int case ID; freezes source SHA and assigned wallets |
| Worker upload | HandoffCourt.submit_evidence | case ID, output, sha256(output) | A or B role; one signed frozen artifact per worker |
| Dispute | HandoffCourt.open_dispute | case ID, reason | stage=DISPUTED; owner only, both artifacts required |
| AI verdict | HandoffCourt.adjudicate | case ID | REWORK_A/B, SHARED, UNVERIFIABLE; stage=DECIDED |
| Inspect case | HandoffCourt.get_case | case ID | JSON owner, workers, full frozen source/artifacts, digest, verdict |
| Check recovery | HandoffCourt.recovery_permission | case ID, actor | JSON allowed bool, role, verdict, original_sha256 |
| Sign correction | RecoveryGate.submit_rework | case ID, replacement text and hash | int receipt ID; only exactly one authorized worker |
| Inspect receipt | RecoveryGate.receipt_for | case ID | JSON receipt or empty string |
| Receipt details | RecoveryGate.get_receipt | receipt ID | JSON actor, role, original/new hashes and status |

Browser: src/main.js; deterministic workers: lib/workers.js; pure state verification: lib/verification.js. Backend: api/state.js allowlisted finalized reads, api/tx.js verifies transaction execution. The source and worker data remain synthetic and public; no confidential jobs, wages or real dispute decisions.

## Signed Studio acceptance (performed)

- Owner created Case #1, Worker A signed total `20`, Worker B signed intentionally incorrect total `27`, owner opened a dispute.
- GenLayer comparative AI adjudication returned and persisted `REWORK_B` with consensus `Accepted` and GenVM `SUCCESS`.
- RecoveryGate authorized Worker B only and persisted receipt #1 for a corrected submitted total `20` with status `REWORK_SUBMITTED_NOT_VERIFIED`.
- A separate owner/worker address collision attempt was finalized with GenVM rollback (real negative test).
- [Transaction-by-transaction evidence and latest-final readback](ONCHAIN_EVIDENCE.md).

The signed duplicate-rework rejection is now evidenced: the second `submit_rework(1, ...)` finalized with GenVM rollback `case already has rework receipt`, and a subsequent `LATEST_FINAL` `receipt_for(1)` retained the original receipt. See [evidence ledger](ONCHAIN_EVIDENCE.md). An additional `open_dispute(1)` attempt was rejected at GenVM with `[rollback] owner only`; finalized Court and Gate state remained unchanged (see the evidence ledger). The supplied transaction details did not show a `From` address, so signer attribution remains subject to explorer confirmation. Independent unauthorized RecoveryGate rework on a new Case, unchanged-hash rejection, ambiguous verdict and web video remain unperformed.

## Disclosures

Wallet worker identities are user assertions and deterministic browser workers, not verified third-party AI agents. The AI judgment applies only to the case's frozen evidence. A replacement artifact receipt means a submission was permitted, not that a correction is accurate. No escrow, legal judgment, labor arbitration, economic settlement or production security audit.
