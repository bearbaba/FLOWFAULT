# FLOWFAULT — Proof-carrying worker accountability

**When work breaks, responsibility must be provable.**

FLOWFAULT is a two-contract GenLayer **Studionet 61999** experiment with an owner and two separate signed worker identities. The owner defines and freezes a task agreement and synthetic input. Worker A generates a deterministic, hashed extraction; Worker B produces a dependent report with its own signed digest. After both evidence records are frozen, the owner opens a dispute. Independent GenLayer comparative AI consensus records REWORK_A, REWORK_B, SHARED or UNVERIFIABLE. RecoveryGate performs a fresh cross-contract authorization and permits only the worker singled out by a REWORK verdict to submit one signed replacement artifact.

**STATUS: TWO STUDIO CONTRACTS DEPLOYED & READBACK-VERIFIED; SIGNED WORKFLOW ACCEPTANCE IN PROGRESS.** Both deployed sources match the repository after whitespace normalization; their schemas and finalized state reads passed, and RecoveryGate points to the exact HandoffCourt address. These checks are not evidence of an AI decision or a signed worker recovery.

- Website: https://flowfault-khaiptk1998-8088s-projects.vercel.app
- HandoffCourt: `0x02A5476d786f55a215B33d77bdb071acB787182b`
- RecoveryGate: `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8`
- [Live Studionet source/schema/linkage verification](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799) (PASS, 2026-11-05)
- Readbacks at verification: `Court.totals() -> {"cases":0}`, `Gate.stats() -> {"court":"0x02A5476d786f55a215B33d77bdb071acB787182b","receipts":0}`
- [Deployment registry](docs/DEPLOYMENT_REGISTRY.md)

## Why GenLayer matters

Attribution across dependent work products can be ambiguous. The Court uses independently interpreted source, task terms and immutable worker outputs to determine which worker bears a clearly supported rework obligation; uncertainty is UNVERIFIABLE. A separate Gate gives the verdict a real, limited on-chain consequence. No generic text classification demo, and no promise of automatically verified remediation.

## Implementation

- contracts/handoff_court.py: immutable case, one signed artifact per worker, SHA-256 consistency, dispute snapshot, comparative consensus and read-only recovery permission.
- contracts/recovery_gate.py: allowlisted worker/case, only single REWORK_A/B verdicts, one replacement per case, immutable receipt with REWORK_SUBMITTED_NOT_VERIFIED.
- lib/workers.js: actual deterministic local sample computations. NOT external autonomous AI agents. Fault injection for a measurable incorrect B output.
- src/: responsive Vite website; wallet signing, transaction hash persistence, FINALIZED execution + stored-state confirmation, public read-only inspection.
- api/: server-side allowlisted latest-final chain reads. Every signature comes from the user's wallet.
- tests/: offline positive/negative checks; do not mistake them for GenVM tests.

## Local checks

Requires Node.js 22+.

    npm install
    npm test
    npm run build
    npm run dev

Production Vercel is configured with server-side FLOWFAULT_COURT_ADDRESS and FLOWFAULT_RECOVERY_ADDRESS. The public API reads latest-final data without a wallet. Run `npm run preflight` with the addresses shown above to independently reproduce the deployed-source, schema, and linkage checks.

## Studio acceptance before Projects

1. Court and Gate deployments and their readback linkage have been verified (see above).
2. On the website, case owner uses a distinct address from Worker A and Worker B. Create case with sample source. Worker A generates and signs approvedTotal 20.
3. Worker B generates deliberately incorrect reportedTotal 27 and signs with Worker B wallet. Owner signs dispute. GenLayer may return REWORK_B, SHARED or UNVERIFIABLE; only actual persisted verdict counts.
4. If decision is REWORK_B, only B may submit corrected JSON with reportedTotal 20; Gate stores one receipt. Wrong worker, unchanged output, repeat and ambiguous verdict must reject.
5. Repeat with correct output and/or incomplete evidence as negative controls. Capture FINALIZED execution AND persisted readbacks; do not invent a transaction hash or AI outcome.
6. Publish a short web-only video and reviewer guide after actual accepted evidence.

**Limitations:** A Gate receipt proves a new authorized artifact was submitted, NOT that it was verified as correct. Wallet role attestation does not certify external AI-agent identity. Synthetic test workflow only; no funds, worker pay, labor or legal dispute judgment. See docs/STUDIO_RUNBOOK.md.
