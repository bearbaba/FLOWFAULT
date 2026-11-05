# FLOWFAULT — Studio deployment and signed-workflow runbook

Target GenLayer **Studionet 61999** via https://studio.genlayer.com, never Studio Dev 61997.

1. HandoffCourt and RecoveryGate are deployed to Studionet 61999, with source, schema and live Gate-to-Court linkage verified by [CI preflight](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799).
2. Public website: https://flowfault-khaiptk1998-8088s-projects.vercel.app. Both server-only environment variables are configured.
3. Prepare three distinct wallets: Case Owner, Worker A, Worker B, each funded with test GEN.
4. Web forms: owner open_case; A generates artifact from source, hashes and signs submit_evidence; B generates faulty report, hashes and signs its evidence; owner signs open_dispute; any wallet signs adjudicate.
5. Confirm actual GenLayer comparative AI outcome in stored Court. If it is REWORK_B, assigned B alone can submit corrected artifact. Gate stores REWORK_SUBMITTED_NOT_VERIFIED; it does NOT establish successful downstream correction.
6. Test wrong signer, hash mismatch, duplicate evidence, duplicate rework, unchanged output, missing worker output, SHARED / UNVERIFIABLE no grant. Preserve failed txs and final readbacks.
7. Prepare an on-chain evidence ledger linking code, deployed source hashes, exact txs, and a concise web-only demo before submitting a GenLayer Project.

Do not claim validator consensus from successful Python syntax or unit tests. Studio readiness is a separate acceptance gate.
