export const project = {
 id:"flowfault",name:"FLOWFAULT",repo:"bearbaba/FLOWFAULT",
 eyebrow:"PROOF-CARRYING WORKFLOW ACCOUNTABILITY",
 title:"When work breaks, responsibility must be provable.",
 intro:"One clear path from a signed work agreement to an AI decision and a traceable correction. Every action is signed. Every result is verified on-chain.",
 feature:"HandoffCourt stores a task owner, immutable source, assigned Worker A and Worker B, their SHA-256-matched artifacts and a signed dispute. Independent GenLayer comparative AI consensus records REWORK_A, REWORK_B, SHARED or UNVERIFIABLE. RecoveryGate reads live Court authorization and lets only the named worker submit one new, hashed artifact. Its receipt records SUBMITTED, never a fabricated claim of correctness.",
 boundaries:"Experimental synthetic multi-worker workflow. Browser workers run real deterministic functions on a documented fixture, but are not external autonomous AI agents. A rework receipt proves submission by the authorized wallet, not that the fix is correct. No financial dispute settlement or real-world job certification.",
 contracts:{court:"FLOWFAULT_COURT_ADDRESS",gate:"FLOWFAULT_RECOVERY_ADDRESS"},
 samples:{
  case:{
   task_spec:"Process synthetic invoice entries. Worker A must extract the IDs of approved entries and produce the exact integer approvedTotal as JSON. Worker B must independently issue a summary with reportedTotal matching A approvedTotal exactly, without inventing amounts or changing attribution. A failure in only B output requires REWORK_B.",
   source_data:'[{"id":"INV1","amount":12,"approved":true},{"id":"INV2","amount":6,"approved":false},{"id":"INV3","amount":8,"approved":true}]'
  },
  dispute:{reason:"The submitted Worker B report shows an approvedTotal different from the source and the frozen Worker A artifact. Identify which signed worker artifact deviated from the task agreement."}
 },
 forms:[
  {key:"open_case",title:"1. Lock a work agreement",subtitle:"Case owner signs immutable task, source and two distinct worker wallet addresses.",scope:"court",method:"open_case",
  fields:[["worker_a","Worker A wallet","address"],["worker_b","Worker B wallet","address"],["task_spec","Task agreement","textarea"],["source_data","Synthetic source data","textarea"]],preset:"case"},
  {key:"submit_evidence",title:"2. Generate & sign worker evidence",subtitle:"Worker A signs first. Worker B signs after A. Browser generates actual synthetic calculations and output hash; no AI outcome is precomputed.",scope:"court",method:"submit_evidence",
  fields:[["case_id","Case ID","number"],["output","Exact worker artifact","textarea"],["output_sha256","SHA-256 of artifact","text"]]},
  {key:"open_dispute",title:"3. Freeze a disputed handoff",subtitle:"Case owner only. Both worker outputs must already be on-chain.",scope:"court",method:"open_dispute",
  fields:[["case_id","Case ID","number"],["reason","Dispute statement","textarea"]],preset:"dispute"},
  {key:"adjudicate",title:"4. Independent GenLayer AI decision",subtitle:"Validators compare the frozen agreement, source and two artifacts. SHARED / UNVERIFIABLE authorize nobody.",scope:"court",method:"adjudicate",
  fields:[["case_id","Case ID","number"]]},
  {key:"submit_rework",title:"5. Signed, one-time rework",subtitle:"Only the worker attributed by REWORK_A / REWORK_B can submit a replacement digest through RecoveryGate. Submission does not prove correctness.",scope:"gate",method:"submit_rework",
  fields:[["case_id","Case ID","number"],["new_output","Replacement artifact","textarea"],["new_sha256","Replacement SHA-256","text"]]}
 ],
 reads:[
  ["Case evidence","court","get_case","id"],
  ["Recovery eligibility for wallet","court","recovery_permission","actor2"],
  ["Case total","court","totals","none"],
  ["Recovery receipt by case","gate","receipt_for","id"],
  ["Receipt by ID","gate","get_receipt","id"],
  ["Recovery Gate stats","gate","stats","none"]
 ]
};