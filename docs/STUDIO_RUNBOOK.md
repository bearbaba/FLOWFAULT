# FLOWFAULT — Studio deployment and signed-workflow runbook

Target GenLayer **Studionet 61999** via https://studio.genlayer.com, never Studio Dev 61997.

1. HandoffCourt and RecoveryGate are deployed to Studionet 61999, with source, schema and live Gate-to-Court linkage verified by [CI preflight](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799).
2. Public website: https://flowfault-khaiptk1998-8088s-projects.vercel.app. Both server-only environment variables are configured.
3. Prepare three distinct wallets: Case Owner, Worker A, Worker B, each funded with test GEN.
4. **Completed in Studio:** owner created Case #1; A signed approvedTotal `20`; B signed intentionally inaccurate total `27`; owner opened dispute; comparative AI returned `REWORK_B` with FINALIZED/SUCCESS; authorized B submitted the corrected total and received receipt #1. [Exact signed txs and verified readbacks](ONCHAIN_EVIDENCE.md).
5. **Next signed Studio negative test:** B resubmits `submit_rework` for Case #1 with the same parameters. Expected FINALIZED with GenVM ERROR / rollback `case already has rework receipt`; check receipt #1 remains intact and `stats().receipts=1`. Record actual result rather than asserting it occurred.
6. Test separate wrong-signer, hash-mismatch, missing-evidence and SHARED / UNVERIFIABLE cases if pursuing stronger negative coverage; do not call an existing receipt-case a clean authorization failure because duplicate gating runs first.
7. **Website only after Studio tests:** record one concise web workflow demo; preserve Studio signed ledger, version, hashes and exact outcome when preparing a Projects submission.

Do not claim validator consensus from successful Python syntax or unit tests. Studio readiness is a separate acceptance gate.
