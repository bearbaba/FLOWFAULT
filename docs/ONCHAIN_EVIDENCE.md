# FLOWFAULT — Signed Studionet evidence ledger (2026-11-05)

**Network:** GenLayer Studionet, chain ID 61999  
**HandoffCourt:** `0x02A5476d786f55a215B33d77bdb071acB787182b`  
**RecoveryGate:** `0xBccDbe2906E9ef6Fd028018BDD892D820681c4d8`  
**Case:** `1`  
**Recovery receipt:** `1`

All hashes below were supplied from GenLayer Studio transaction details and must be assessed together with execution result and finalized state; `FINALIZED` / consensus `Accepted` alone does not imply execution success. Final stored-state readbacks were independently queried via the live read-only GenLayer API with `LATEST_FINAL`.

## Transaction record

| Step | Method | Signer | Transaction | GenVM | Evidence |
| --- | --- | --- | --- | --- | --- |
| Guard check (intentional owner/worker identity collision) | `open_case` | Owner | [0x0f0a0e6c…6375713](https://explorer-studio.genlayer.com/tx/0x0f0a0e6cf0a2a4e22c8360bcf0a10409b44bd6fbb96e35c14b20941c06375713) | **ERROR / Rollback** | `case owner and workers must be distinct`; no case created |
| Case creation | `open_case` | Owner | [0x5494092d…7f35b123](https://explorer-studio.genlayer.com/tx/0x5494092d319d43fe8b5a10c34380a1c508d1565bc1129f00aa1bbe947f35b123) | **SUCCESS** | Return `1`; owner and two distinct workers |
| Worker A evidence | `submit_evidence` | Worker A | [0x4cd8e760…593ab742](https://explorer-studio.genlayer.com/tx/0x4cd8e760e8dcedc9ef45661f98f9d40abca6c3f5d7167993224b32f1593ab742) | **SUCCESS** | Return `A`; total 20 |
| Worker B fault evidence | `submit_evidence` | Worker B | [0x58a2c160…1910555](https://explorer-studio.genlayer.com/tx/0x58a2c16027070083472e26638524421f5eb489cbb8a61412ce6c7e2ec1910555) | **SUCCESS** | Return `B`; total 27 |
| Owner dispute | `open_dispute` | Owner | [0xee0879fc…01a2e2d](https://explorer-studio.genlayer.com/tx/0xee0879fc7000db6f42648ecddd98f328e3c18a2e2299210787b5150ac01a2e2d) | **SUCCESS** | Stored stage `DISPUTED` prior to adjudication |
| Comparative AI adjudication | `adjudicate` | Owner | [0x3e32896e…e0b89425](https://explorer-studio.genlayer.com/tx/0x3e32896edb25c00993ab75b44337bc30458128a8e2ef64190d7bb703e0b89425) | **SUCCESS** | Return `REWORK_B`; equivalence output `REWORK_B`; consensus Accepted, rotation count 3 |
| One-time corrective submission | `submit_rework` | Worker B | [0x63f7c658…663378c](https://explorer-studio.genlayer.com/tx/0x63f7c658c3794f43ab9d4175e46dad8ad8f98bc770c259def89a30a2b663378c) | **SUCCESS** | Return receipt ID `1` |

Signer identities:

- Owner: `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`
- Worker A: `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff`
- Worker B: `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`

## Latest-final stored readback

- `HandoffCourt.get_case(1)`: `id=1`, `stage=DECIDED`, `verdict=REWORK_B`, immutable A/B evidence digests and signer identities.
- Worker A SHA-256: `4aceca17fe75cb8d90bb70e8cc2cfe0271e85f43f289bb7070edaa6dd01acc7f`
- Worker B SHA-256 (faulty original): `0b877302d3f338eba031699be97de57204e55a21b2c6808a0d533ca9f885e40e`
- `RecoveryGate.receipt_for(1)` and `get_receipt(1)`: matching receipt `id=1`, `case_id=1`, `actor=Worker B`, `role=B`, `new_sha256=dd9831393724694103a7965c820b368431fe387278c8355262782a5a97a0f765`.
- Replacement JSON: `{"reportedTotal":20,"summary":"Synthetic approved invoice total for INV1, INV3"}`
- Receipt status: **`REWORK_SUBMITTED_NOT_VERIFIED`**.
- `RecoveryGate.stats()`: `receipts=1` and `court=0x02A5476d786f55a215B33d77bdb071acB787182b`.

## Evidence boundary

**Demonstrated:** GenLayer contract deployment and linkage, owner-signed work agreement, two distinct worker-signed digests, owner dispute, persisted comparative AI verdict, cross-contract permission, and one authorized corrective submission.

**Not established by the above:** independent proof of real autonomous agents, validation that the correction is actually correct, signer-denial transaction on an unused case, hash mismatch transaction, ambiguous/SHARED case, or a web E2E demo/video. Do not claim those tests without their own transaction receipts. The owner-worker collision rollback is a real negative test and is explicitly recorded as such.

See [deployment verification](https://github.com/bearbaba/FLOWFAULT/actions/runs/41996422799) for source/schema verification. The project's source verification found normalized match (not byte-for-byte match), and that should remain visible.

## Additional Studio negative test — duplicate RecoveryGate submission

- Transaction: https://explorer-studio.genlayer.com/tx/0xae0dcb9dbb88f7ece9dbb0fb1c539f712019e0f1e65751e7e33cfd8aedacdff9
- Contract method: `RecoveryGate.submit_rework`; Case ID `1`, identical replacement JSON and SHA-256 to the successful Receipt #1.
- Reported status: `FINALIZED`, GenVM `ERROR` / rollback; consensus `Accepted`.
- Exact rollback reason: `case already has rework receipt`.
- Validator records supplied: three validator `Agree` results for this error; two other validator executions cancelled after quorum.
- Follow-up read `receipt_for(1)` at `LATEST_FINAL` was successful and still returned the original Worker B Receipt #1, including the same original and replacement hashes and status `REWORK_SUBMITTED_NOT_VERIFIED`.
- Case `get_case(1)` still returned `DECIDED` / `REWORK_B`.
- This proves duplicate submission rejection for this Case, not independent wrong-signer denial on a new Case.

## Additional Studio negative test — unauthorized dispute

- Transaction: https://explorer-studio.genlayer.com/tx/0xc07724ba2ba342abf3c34d7942acac3eef6c09410fbf5e7aead1014bc68fd518
- Contract: `HandoffCourt`, method `open_dispute`, Case ID `1`.
- The signed test was initiated by switching to Worker A according to the Studio test instructions; the supplied transaction view did **not** display a `From` field, so the exact sender remains to be corroborated from the explorer.
- Transaction reported `FINALIZED` with GenVM `ERROR / Rollback`; consensus `Accepted` indicates acceptance of the rollback, **not** successful execution.
- Exact reported rollback reason: `owner only`.
- Validator record supplied: three `Agree` results for `[rollback] owner only`; two other executions cancelled after quorum.
- Independent `LATEST_FINAL` read after rollback: `HandoffCourt.get_case(1)` remained `DECIDED / REWORK_B` with its original dispute string, and `RecoveryGate.receipt_for(1)` retained the original Worker B receipt #1 and `REWORK_SUBMITTED_NOT_VERIFIED`.
- This demonstrates the owner-only protection rejecting a non-owner `open_dispute` call; it is not evidence of a successful dispute opening or an unauthorized recovery denial.
