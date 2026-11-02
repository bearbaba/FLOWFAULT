# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""FLOWFAULT RecoveryGate: signed one-time revision permission after GenLayer verdict.
Receipt proves an authorized rework SUBMISSION, not correctness or acceptance.
"""
from genlayer import *
import json
import re
import hashlib

def require(ok: bool, why: str):
    if not ok:
        raise gl.vm.UserError(why)

class RecoveryGate(gl.Contract):
    court: Address
    receipt_count: u256
    receipts: TreeMap[u256, str]
    case_receipt: TreeMap[u256, u256]

    def __init__(self, court_address: str):
        self.court = Address(court_address)
        self.receipt_count = u256(0)

    @gl.public.write
    def submit_rework(self, case_id: int, new_output: str, new_sha256: str) -> int:
        require(type(case_id) is int and case_id > 0, "invalid case id")
        require(type(new_output) is str and 8 <= len(new_output) <= 1200,
                "new output length 8-1200")
        require(type(new_sha256) is str and re.fullmatch(r"[0-9a-f]{64}", new_sha256) is not None,
                "invalid SHA-256")
        require(hashlib.sha256(new_output.encode("utf-8")).hexdigest() == new_sha256,
                "rework content hash mismatch")
        require(self.case_receipt.get(u256(case_id), u256(0)) == u256(0),
                "case already has rework receipt")
        actor = gl.message.sender_address.as_hex.lower()
        court = gl.get_contract_at(self.court)
        raw = court.view().recovery_permission(case_id, actor)
        require(type(raw) is str and 1 < len(raw) <= 1024, "invalid Court response")
        auth = json.loads(raw)
        require(auth.get("case_id") == case_id and auth.get("actor") == actor,
                "mismatched permission")
        require(auth.get("allowed") is True and auth.get("role") in ("A", "B"),
                "rework not authorized")
        require(auth.get("verdict") == "REWORK_" + auth["role"], "ambiguous responsibility")
        require(auth.get("original_sha256") != new_sha256, "unchanged artifact")
        self.receipt_count += u256(1)
        i = int(self.receipt_count)
        self.receipts[u256(i)] = json.dumps({
            "id": i, "case_id": case_id, "actor": actor,
            "role": auth["role"], "original_sha256": auth["original_sha256"],
            "new_sha256": new_sha256, "new_output": new_output,
            "status": "REWORK_SUBMITTED_NOT_VERIFIED"
        }, sort_keys=True, separators=(",", ":"))
        self.case_receipt[u256(case_id)] = u256(i)
        return i

    @gl.public.view
    def receipt_for(self, case_id: int) -> str:
        require(type(case_id) is int and case_id > 0, "invalid case id")
        index = self.case_receipt.get(u256(case_id), u256(0))
        return self.receipts[index] if index != u256(0) else ""

    @gl.public.view
    def get_receipt(self, receipt_id: int) -> str:
        require(type(receipt_id) is int and 0 < receipt_id <= int(self.receipt_count), "invalid receipt")
        return self.receipts[u256(receipt_id)]

    @gl.public.view
    def stats(self) -> str:
        return json.dumps({"receipts": int(self.receipt_count), "court": self.court.as_hex}, sort_keys=True)
