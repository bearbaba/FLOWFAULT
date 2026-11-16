# FLOWFAULT

> **VerifiedRecovery V2 and separately deployed V2.1 now verified on GenLayer Studionet.** The [V2 Studionet contract](https://studio.genlayer.com/?import-contract=0xa7a417F1380e09fD5Bc01436bE3dA0aF94fB0C71) adds signed evidence-based PASS / FAIL / REVIEW, bounded corrections and explicit recovery resolution. Historical Court **Case #2** has proven AI PASS → RESOLVED, whereas newly signed **Case #3** has proven FAIL plus rejected finalize, then terminal conservative REVIEW after invalid AI assessment formatting. [Independent Case #2 evidence](docs/evidence/case-2-v2-finalized.json) · [Case #3 evidence](docs/evidence/case-3-v2-fail-review.json). **V2.1 improves availability only for malformed AI results** with bounded signer-only retry and an assessment audit trail, while preserving the original two-revision cap and PASS-only finalization. [V2.1 release/Studio acceptance guide](docs/VERIFIED_RECOVERY_V21.md) · [V2/V2.1 PR #1](https://github.com/bearbaba/FLOWFAULT/pull/1). **V2.1 contract deployment, source identity, ABI and binding are independently verified; new signed V2.1 recovery acceptance remains pending. Milestone has not been submitted.**

### Proof-carrying accountability for multi-worker workflows

**When work breaks, responsibility should be traceable.**

FLOWFAULT is a live GenLayer application that turns a task handoff into a clear sequence: **assign work → capture signed evidence → resolve a dispute with AI consensus → authorize a corrective submission**.

[**Launch FLOWFAULT**](https://flowfault-eight.vercel.app/) · [**Watch the 2-minute demo**](https://youtu.be/VlPv2M0jXjg) · [**Explore verified evidence**](docs/ONCHAIN_EVIDENCE.md)

## The product

When two workers contribute to a dependent task, FLOWFAULT gives the owner a structured way to define expectations, inspect the outputs, and identify responsibility for a disputed handoff.

| Step | Experience | On-chain proof |
| --- | --- | --- |
| **1 · Assign** | Set the task agreement and two distinct worker wallets | Owner-signed, immutable case |
| **2 · Deliver** | Worker A and Worker B submit their work | Wallet-signed artifacts and SHA-256 digests |
| **3 · Dispute** | Owner explains the mismatch between the signed deliverables | Frozen dispute statement |
| **4 · Decide** | GenLayer comparative AI consensus evaluates the task and artifacts | Recorded verdict: `REWORK_A`, `REWORK_B`, `SHARED` or `UNVERIFIABLE` |
| **5 · Recover** | The responsible worker signs a corrective artifact | RecoveryGate permission and one-time receipt |

### A simpler workflow for people

The web application is organized around the next action. Start a new task or open an existing Case ID, see the signer assigned to the current step, switch wallets when needed, and follow signature → finality → stored-state verification. The public **Chain explorer** presents readable case and recovery details without requiring a wallet connection.

The sample workflow uses deterministic invoice calculations to produce worker outputs. GenLayer AI consensus is used specifically for the responsibility decision.

## Live demonstration · Case #2

The YouTube demo walks through the complete workflow on **GenLayer Studionet (chain ID 61999)**:

- An owner creates Case #2 and assigns Worker A and Worker B.
- Worker A submits approved invoices `INV1` and `INV3`, with approved total **20**.
- Worker B submits a duplicate extraction instead of the agreed independent report; the signed evidence makes the format violation inspectable.
- The owner opens a dispute and GenLayer records the finalized comparative verdict **`REWORK_B`**.
- RecoveryGate authorizes Worker B to submit a corrected report with `reportedTotal: 20`, generating **Receipt #2**.

**Receipt #2 status:** `REWORK_SUBMITTED_NOT_VERIFIED`. This is a deliberately precise proof of authorized submission; it does not certify the revised work through another evaluation.

[Watch the full web demo](https://youtu.be/VlPv2M0jXjg) · [Inspect Case #2 in FLOWFAULT](https://flowfault-eight.vercel.app/#verify)

## VerifiedRecovery release progress

| Proof | On-chain status | What it establishes |
| --- | --- | --- |
| [Historic Case #2](docs/evidence/case-2-v2-finalized.json) | **V2 RESOLVED** | B signed correction; accepted GenLayer AI PASS on three frozen criteria; explicit hash-bound finalization |
| [Fresh signed Case #3](docs/evidence/case-3-v2-fail-review.json) | **V2 REVIEW — not resolved** | Signed Court REWORK_B, first correction FAIL, wrong finalize rolled back, corrected second revision received format-validation REVIEW |
| [V2.1 retry release](docs/VERIFIED_RECOVERY_V21.md) | **DEPLOYED / SOURCE ATTESTED** | [New contract `0xcbc76A74…2Db636`](https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636), signer-only bounded format retries and exact source/ABI/binding proof; **signed V2.1 PASS/RESOLVED still pending** |

The updated /recovery.html view supports the live V2.0 and separately deployed V2.1 policies. It will only show the retry action when the configured on-chain contract reports V2.1, a current malformed-format REVIEW, available assessment retries, and the original correction signer. This change does not upgrade existing V2 addresses or rewrite Case #3.

## Built on GenLayer

FLOWFAULT uses **two live Intelligent Contracts**:

| Contract | Role | Deployment |
| --- | --- | --- |
| **HandoffCourt** | Stores signed work, evidence hashes, disputes and GenLayer comparative AI decisions | [View contract](https://explorer-studio.genlayer.com/address/0x02A5476d786f55a215B33d77bdb071acB787182b) |
| **RecoveryGate** | Reads the Court's final authorization and accepts a one-time signed rework | [View contract](https://explorer-studio.genlayer.com/address/0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8) |

**Core architecture:** Vite frontend and wallet signing; allowlisted read-only Vercel API; HandoffCourt + RecoveryGate on Studionet; GenLayer comparative AI consensus; SHA-256-linked output records. Transaction tracking verifies execution and persisted state before showing a successful result.

### Explore the product

1. Open [FLOWFAULT](https://flowfault-eight.vercel.app/) and select **Workflow**.
2. Choose **Create a new task** to fill the example agreement and two worker addresses; sign with the Owner wallet.
3. Follow the guided Worker A → Worker B → Dispute → AI decision → Recovery flow, switching to each assigned signer when prompted.
4. To review completed evidence without signing, open **Chain explorer**, select **Case evidence** or **Recovery receipt by case**, and enter **2**.

The environment is **Studionet** and uses synthetic demonstration data and test GEN.

## Verified evidence

- [On-chain evidence ledger](docs/ONCHAIN_EVIDENCE.md): signed Case #1 transactions, security integrity checks, and the Case #2 public demo/readback.
- [Deployment and source verification](docs/DEPLOYMENT_REGISTRY.md): live contract addresses, schemas, linkage and latest-final readbacks.
- [Studio and reviewer guide](docs/STUDIO_RUNBOOK.md): concise path to inspect the workflow.
- [CI source/schema verification](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799).

## Development

Requires Node.js 22+.

```bash
npm install
npm test
npm run build
npm run dev
```

The repository includes `contracts/` (GenLayer Intelligent Contracts), `lib/` (deterministic browser worker computations), `src/` (application interface), `api/` (latest-final public reads), and `tests/` (local regression tests).

---

**FLOWFAULT** · Signed evidence. AI-assisted responsibility. Accountable recovery.
