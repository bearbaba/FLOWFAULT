# FLOWFAULT — Project reviewer guide

**Proof-carrying workflow accountability powered by GenLayer.**

[Launch product](https://flowfault-eight.vercel.app) · [Watch the YouTube demo](https://youtu.be/VlPv2M0jXjg) · [Inspect signed evidence](ONCHAIN_EVIDENCE.md)

## Product experience

FLOWFAULT handles work across two independently signing wallets under an owner-defined agreement. When a handoff is disputed, its GenLayer Intelligent Contract interprets the frozen task, source and artifacts through comparative AI consensus. A separate RecoveryGate turns a single-worker rework verdict into a precise, one-time authorization.

The UX is built for people: start a task, assign Worker A and Worker B, complete the guided steps, and inspect the result using a public wallet-free Chain explorer.

## Demonstrated on Studionet 61999

| Case | Work submitted | Final on-chain decision | Authorized recovery |
| --- | --- | --- | --- |
| **#1 · Signed Studio run** | Worker A total 20; Worker B faulty total 27 | `REWORK_B` | Worker B Receipt #1 |
| **#2 · Live web demo** | Worker A total 20; Worker B submitted an invalid duplicate report | `REWORK_B` | Worker B Receipt #2, corrected reportedTotal 20 |

The finalized case reads have `stage=DECIDED`. Both RecoveryGate receipts explicitly store `REWORK_SUBMITTED_NOT_VERIFIED`, which attests that the authorized replacement was submitted and hashed.

**Review Case #2:** Open [Chain explorer](https://flowfault-eight.vercel.app/#verify) → **Case evidence** → Case ID `2`; then **Recovery receipt by case** → `2`. A wallet is only needed to sign a new task.

## Contract and UI mapping

| What a user does | Method | Verified effect |
| --- | --- | --- |
| Assign work | `HandoffCourt.open_case` | Locks owner, workers, task and source hash |
| Worker A/B deliver | `HandoffCourt.submit_evidence` | Persists signer-specific artifact and SHA-256 digest |
| Owner disputes | `HandoffCourt.open_dispute` | Freezes the disputed handoff |
| AI decides | `HandoffCourt.adjudicate` | Persists `REWORK_A`, `REWORK_B`, `SHARED` or `UNVERIFIABLE` |
| Inspect eligibility | `HandoffCourt.recovery_permission` | Returns responsible wallet, role, original hash and authorization |
| Worker revises | `RecoveryGate.submit_rework` | Records a one-time signed replacement receipt |
| Verify completion | `get_case`, `receipt_for`, `get_receipt` | Latest-final readback of court and recovery records |

- **HandoffCourt:** [0x02A5476d786f55a215B33d77bdb071acB787182b](https://explorer-studio.genlayer.com/address/0x02A5476d786f55a215B33d77bdb071acB787182b)
- **RecoveryGate:** [0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8](https://explorer-studio.genlayer.com/address/0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8)
- **Deployed source/schema/linkage verification:** [CI result](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799)
- **Security-integrity transaction checks:** [signed evidence ledger](ONCHAIN_EVIDENCE.md) documents wallet separation, owner-only dispute protection and duplicate receipt rejection.

## Why it matters

The project brings signed work products, AI responsibility decisions and bounded follow-up actions into one transparent workflow. SHA-256 digests bind each submitted artifact to its signed content. The web app confirms transaction execution and persisted finality before presenting success, making the result independently inspectable.

**Demo scope:** GenLayer Studionet, test GEN, public synthetic invoice data and deterministic browser workers. The AI determines responsibility from the locked evidence. RecoveryGate records authorized resubmission, not an independently certified correction.
