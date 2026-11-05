# FLOWFAULT — Studionet deployment registry

Two GenLayer Studio import links were provided by the project owner on 2026-11-05.

- Target: **GenLayer Studionet (chain ID 61999)**.
- HandoffCourt (reported first deployment): `0x02A5476d786f55a215B33d77bdb071acB787182b`
- RecoveryGate (reported second deployment): `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8`
- Court Studio import: https://studio.genlayer.com/?import-contract=0x02A5476d786f55a215B33d77bdb071acB787182b
- Gate Studio import: https://studio.genlayer.com/?import-contract=0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8

These are **user-reported contract addresses**. They are NOT by themselves proof of source fidelity, constructor linkage, finalized deployment execution, AI consensus adjudication, or signed worker evidence.

## Verification

Run the workflow **FLOWFAULT live Studionet deployment verification**, or locally:

```sh
FLOWFAULT_COURT_ADDRESS=0x02A5476d786f55a215B33d77bdb071acB787182b \
FLOWFAULT_RECOVERY_ADDRESS=0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8 \
npm run preflight
```

The preflight compares deployed source to `contracts/`, checks GenVM schema, performs LATEST_FINAL on-chain reads, and confirms `RecoveryGate.stats().court` points to the reported Court. A passing check still does not demonstrate the signed application workflow.

## Acceptance boundary

Only claim Open Case, signed Worker A & B evidence, dispute, comparative verdict, and one-time recovery after separate real transactions and persisted final readbacks. Never substitute CI or contract deployment for these receipts.
