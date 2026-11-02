# FLOWFAULT — GenLayer Project Reviewer Guide

**Status: source / unsigned preflight phase. No contracts deployed, signed worker evidence or AI verdicts yet.**

Project: https://github.com/bearbaba/FLOWFAULT
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

## Required signed proof (NOT YET PERFORMED)

1. Three wallets: case owner, Worker A, Worker B (distinct). Owner signs fixture case; approved sum is 20.
2. A signs the generated total 20. B signs injected-fault total 27. Owner signs dispute.
3. Run actual GenLayer comparative adjudication and observe its persisted output. REWORK_B is the expected interpretation, not a preprogrammed verdict; if UNVERIFIABLE, investigate, never fake.
4. For an actual REWORK_B, only B signs corrected report total 20. Gate stores REWORK_SUBMITTED_NOT_VERIFIED. A attempts unauthorized revision and is rejected; duplicate attempt rejected; unchanged hash rejected.
5. Separate missing-evidence and ambiguous cases must not authorize a recovery. Record any actual signed errors and persisted state, source fidelity, explorer links and video.

## Disclosures

Wallet worker identities are user assertions and deterministic browser workers, not verified third-party AI agents. The AI judgment applies only to the case's frozen evidence. A replacement artifact receipt means a submission was permitted, not that a correction is accurate. No escrow, legal judgment, labor arbitration, economic settlement or production security audit.
