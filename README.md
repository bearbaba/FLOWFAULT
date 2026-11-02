# FLOWFAULT — Proof-carrying worker accountability

**When work breaks, responsibility must be provable.**

FLOWFAULT is a two-contract GenLayer **Studionet 61999** experiment with an owner and two separate signed worker identities. The owner defines and freezes a task agreement and synthetic input. Worker A generates a deterministic, hashed extraction; Worker B produces a dependent report with its own signed digest. After both evidence records are frozen, the owner opens a dispute. Independent GenLayer comparative AI consensus records REWORK_A, REWORK_B, SHARED or UNVERIFIABLE. RecoveryGate performs a fresh cross-contract authorization and permits only the worker singled out by a REWORK verdict to submit one signed replacement artifact.

**STATUS: SOURCE IMPLEMENTED, NOT YET DEPLOYED.** There are no contract addresses, accepted AI decisions, signed recovery receipts or public Production URL. The web app must not claim any success until actual Studio deployment and FINALIZED state readbacks.

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

After deploying Court then Gate, configure server-only variables FLOWFAULT_COURT_ADDRESS and FLOWFAULT_RECOVERY_ADDRESS in Vercel. Run npm run preflight with those addresses. Read-only verification does not need a wallet.

## Studio acceptance before Projects

1. Court deploy with no constructor args; save source and exact address.
2. Gate deploy with constructor court_address equal to verified Court address.
3. On website, case owner uses a distinct address from Worker A and Worker B. Create case with sample source. Worker A generates and signs approvedTotal 20.
4. Worker B generates deliberately incorrect reportedTotal 27 and signs with Worker B wallet. Owner signs dispute. GenLayer may return REWORK_B, SHARED or UNVERIFIABLE; only actual persisted verdict counts.
5. If decision is REWORK_B, only B may submit corrected JSON with reportedTotal 20; Gate stores one receipt. Wrong worker, unchanged output, repeat and ambiguous verdict must reject.
6. Repeat with correct output and/or incomplete evidence as negative controls. Capture FINALIZED execution AND persisted readbacks; do not invent a transaction hash or AI outcome.
7. Publish a short web-only video and reviewer guide after actual accepted evidence.

**Limitations:** A Gate receipt proves a new authorized artifact was submitted, NOT that it was verified as correct. Wallet role attestation does not certify external AI-agent identity. Synthetic test workflow only; no funds, worker pay, labor or legal dispute judgment. See docs/STUDIO_RUNBOOK.md.
