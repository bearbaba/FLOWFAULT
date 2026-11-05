# FLOWFAULT — Proof-carrying worker accountability

**When work breaks, responsibility must be provable.**

FLOWFAULT is a two-contract GenLayer **Studionet 61999** experiment with an owner and two separate signed worker identities. The owner defines and freezes a task agreement and synthetic input. Worker A generates a deterministic, hashed extraction; Worker B produces a dependent report with its own signed digest. After both evidence records are frozen, the owner opens a dispute. Independent GenLayer comparative AI consensus records REWORK_A, REWORK_B, SHARED or UNVERIFIABLE. RecoveryGate performs a fresh cross-contract authorization and permits only the worker singled out by a REWORK verdict to submit one signed replacement artifact.

**STATUS: STUDIO MAIN WORKFLOW ACCEPTED ON STUDIONET 61999 (2026-11-05).** Both deployed contract sources match the repository after formatting normalization; Court/Gate schema and linkage checks passed. Case #1 has actual owner and worker signed transactions, persisted comparative AI verdict `REWORK_B`, and RecoveryGate receipt #1 from Worker B. Some signed negative tests and web video remain separate acceptance work. See [signed on-chain evidence ledger](docs/ONCHAIN_EVIDENCE.md).

- Website: https://flowfault-khaiptk1998-8088s-projects.vercel.app
- HandoffCourt: `0x02A5476d786f55a215B33d77bdb071acB787182b`
- RecoveryGate: `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8`
- [Live Studionet source/schema/linkage verification](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799) (PASS, 2026-11-05)
- Initial preflight readbacks (before Case #1): `Court.totals() -> {"cases":0}`, `Gate.stats() -> {"court":"0x02A5476d786f55a215B33d77bdb071acB787182b","receipts":0}`. After real signed workflow: `Court.get_case(1).verdict=REWORK_B`, `Gate.receipt_for(1).status=REWORK_SUBMITTED_NOT_VERIFIED`, `Gate.stats().receipts=1`.
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

## Studio acceptance and evidence

The complete **positive path was performed in GenLayer Studio** with Case #1: signed `open_case`, signed Worker A/B evidence, owner dispute, actual comparative `REWORK_B` decision, and Worker B's signed one-time rework receipt #1. Full methods, exact transaction hashes, final readbacks, and an explicit list of unperformed tests are in [docs/ONCHAIN_EVIDENCE.md](docs/ONCHAIN_EVIDENCE.md). The duplicate receipt rollback was tested in Studio: a second `submit_rework` was rejected with `case already has rework receipt`; the original receipt persisted. See [on-chain evidence ledger](docs/ONCHAIN_EVIDENCE.md). Use the website when ready to record the demo. Do not replace signed Studio evidence with UI claims.

**Limitations:** A Gate receipt proves a new authorized artifact was submitted, NOT that it was verified as correct. Wallet role attestation does not certify external AI-agent identity. Synthetic test workflow only; no funds, worker pay, labor or legal dispute judgment. See docs/STUDIO_RUNBOOK.md.
