# FLOWFAULT — Studio sequential deployment

Target GenLayer **Studionet 61999** via https://studio.genlayer.com, never Studio Dev 61997.

1. Deploy contracts/handoff_court.py FIRST, constructor no args. Verify source/schema, deployed address and FINALIZED execution.
2. Deploy contracts/recovery_gate.py SECOND, passing court_address equal to the exact Court address. Check stats().court on-chain.
3. Set server-only FLOWFAULT_COURT_ADDRESS and FLOWFAULT_RECOVERY_ADDRESS for the Vercel project, redeploy once and run npm run preflight.
4. Prepare three distinct wallets: Case Owner, Worker A, Worker B, each funded with test GEN.
5. Web forms: owner open_case; A generates artifact from source, hashes and signs submit_evidence; B generates faulty report, hashes and signs its evidence; owner signs open_dispute; any wallet signs adjudicate.
6. Confirm actual GenLayer comparative AI outcome in stored Court. If it is REWORK_B, assigned B alone can submit corrected artifact. Gate stores REWORK_SUBMITTED_NOT_VERIFIED; it does NOT establish successful downstream correction.
7. Test wrong signer, hash mismatch, duplicate evidence, duplicate rework, unchanged output, missing worker output, SHARED / UNVERIFIABLE no grant. Preserve failed txs and final readbacks.
8. Prepare an on-chain evidence ledger linking code, deployed source hashes, exact txs, and a concise web-only demo before submitting a GenLayer Project.

Do not claim validator consensus from successful Python syntax or unit tests. Studio readiness is a separate acceptance gate.
