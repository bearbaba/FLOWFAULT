# FLOWFAULT — Studio and reviewer guide

FLOWFAULT runs on **GenLayer Studionet (chain ID 61999)**. Its web app and two deployed Intelligent Contracts are publicly accessible.

**Start with the product:** https://flowfault-eight.vercel.app  
**Watch the live browser walkthrough:** https://youtu.be/VlPv2M0jXjg

## Review Case #2 without a wallet

1. Open the web app and select **Chain explorer**.
2. Choose **Case evidence**, enter Case ID **2**, and read the latest-final result: `DECIDED / REWORK_B`.
3. Choose **Recovery receipt by case**, enter **2**, and inspect Receipt #2. The authorized Worker B submitted a corrected `reportedTotal: 20` report.
4. In **Workflow**, inspect the guided six-step sequence, including the assigned signer and recorded decision.

## Reproduce the signed workflow

1. Connect the **Owner** wallet on Studionet and create a task with two distinct Worker addresses.
2. Each worker connects their assigned wallet and signs its own SHA-256-linked artifact.
3. The Owner opens a dispute using the signed outputs and frozen agreement.
4. Invoke **AI decision**. A finalized, persisted `REWORK_A` or `REWORK_B` verdict authorizes the matching worker to proceed.
5. The authorized worker submits a replacement artifact to RecoveryGate and receives a one-time on-chain receipt.

The app follows each transaction through wallet confirmation, GenLayer execution/finality and a matching latest-final state readback.

## Smart contracts and evidence

- [HandoffCourt on Studio](https://studio.genlayer.com/?import-contract=0x02A5476d786f55a215B33d77bdb071acB787182b)
- [RecoveryGate on Studio](https://studio.genlayer.com/?import-contract=0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8)
- [Signed Studio Case #1 and browser Case #2 evidence](ONCHAIN_EVIDENCE.md)
- [Live deployment verification](DEPLOYMENT_REGISTRY.md)

**Proof semantics:** Recovery receipts identify who submitted a new artifact and its SHA-256 digest; their stored status is `REWORK_SUBMITTED_NOT_VERIFIED`. The system uses test GEN and synthetic tasks.
