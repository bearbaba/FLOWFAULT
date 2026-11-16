# FLOWFAULT

> **V2.2 MILESTONE — VerifiedRecovery now demonstrates a signed end-to-end `SUBMITTED → PASS → RESOLVED` on GenLayer Studionet.** Separate [V2.2 contract `0x6a9E026a…AD3966`](https://studio.genlayer.com/?import-contract=0x6a9E026adfD607f087626B06e293e7b277AD3966) evaluates a Worker B correction against immutable Court Case #3 via native structured JSON and deterministic evidence-reference IDs. [Submit](https://explorer-studio.genlayer.com/tx/0xcfbee2d522e6babe67d2d1ddaa84a128690fe920dd15c5acd03923755ee7a380) → [accepted three-criteria PASS](https://explorer-studio.genlayer.com/tx/0xe3b43a7e1414a79f808d1822de844c41b5bc455335b238f3fc8ca8766fc2ba38) → [signed RESOLVED](https://explorer-studio.genlayer.com/tx/0x9ef5bd6f5e4149a6cc4f699da4c7ee0dd403e527f184cfb5ea4139561f9e263b) were independently confirmed at `LATEST_FINAL`. [Machine-readable proof](docs/evidence/v22-case-3-pass-resolved.json) · [Versioned source & runbook](docs/VERIFIED_RECOVERY_V22.md). All transactions finalized with `MAJORITYAGREE`, corrected output/snapshot SHA-256 match. Original Court remains `DECIDED / REWORK_B`. **Historic V2.1 Case #3 remains REVIEW; no claim of retroactive recovery. Production website remains the original deployment; Milestone has not been submitted.**

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

> **V2.2 SOURCE + SIGNED MAINNET-LIKE STUDIONET EVIDENCE VERIFIED:** [`verified_recovery_v22.py`](contracts/verified_recovery_v22.py) now runs separately on GenLayer Studionet. Its native JSON + deterministic evidence ID design avoids requiring AI to produce perfectly copied literal quotations. A signed three-step recovery completed **PASS → RESOLVED** with no format retry on frozen invoice Case #3. The [exact deployed contract source](contracts/verified_recovery_v22_deployed.py) matches the RPC bytes and [source/release assessment](docs/VERIFIED_RECOVERY_V22.md) records limitations. Historical V2/V2.1 on-chain records and production website were not overwritten.

## VerifiedRecovery release progress

| Proof | On-chain status | What it establishes |
| --- | --- | --- |
| [Historic Case #2](docs/evidence/case-2-v2-finalized.json) | **V2 RESOLVED** | B signed correction; accepted GenLayer AI PASS on three frozen criteria; explicit hash-bound finalization |
| [Fresh signed Case #3](docs/evidence/case-3-v2-fail-review.json) | **V2 REVIEW — not resolved** | Signed Court REWORK_B, first correction FAIL, wrong finalize rolled back, corrected second revision received format-validation REVIEW |
| [V2.1 retry release](docs/VERIFIED_RECOVERY_V21.md) | **REVIEW — NOT RESOLVED** | [V2.1 contract `0xcbc76A74…2Db636`](https://studio.genlayer.com/?import-contract=0xcbc76A74B062ec16740355170ffE1700932Db636): two accepted format-fallback REVIEW runs; final retry Undetermined / MajorityDisagree, so its leader-only PASS was **not committed**. Proved bounded signer-only retry and audit but not recovery success. |
| [V2.2 structured evidence release](docs/VERIFIED_RECOVERY_V22.md) | **PASS → RESOLVED (SIGNED, LATEST_FINAL)** | [V2.2 contract `0x6a9E026a…AD3966`](https://studio.genlayer.com/?import-contract=0x6a9E026adfD607f087626B06e293e7b277AD3966): accepted correction, AI PASS on agreement/source/dependency with deterministic citation IDs, explicit hash-bound RESOLVED. [Verified evidence](docs/evidence/v22-case-3-pass-resolved.json). |

The updated [milestone-branch recovery UI](https://flowfault-moxl7m0li-khaiptk1998-8088s-projects.vercel.app/recovery.html) supports the separately deployed V2.0, V2.1 and V2.2 policies. On V2.2 it verifies `citation_mode=DETERMINISTIC_REFERENCE_IDS` and requires the current correction signer for initial assessment or strictly eligible format retry. It does not overwrite the existing production app or change any original Court judgment. Studio transactions and `LATEST_FINAL` readbacks are the authoritative V2.2 acceptance proof; a separate browser-wallet walkthrough has not yet been documented.

## Built on GenLayer

FLOWFAULT's original production workflow uses **two live Intelligent Contracts**; new recovery versions V2/V2.1/V2.2 are **separate deployed contracts** attached to the unchanged Court:

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
