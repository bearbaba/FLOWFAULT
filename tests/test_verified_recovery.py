"""Deterministic contract behavior under a GenLayer shim; not live consensus proof."""
import importlib.util
import json
import sys
import types
import unittest
from copy import deepcopy

class Address:
    def __init__(self, value): self.as_hex = value
class TreeMap(dict):
    @classmethod
    def __class_getitem__(cls, _): return cls
class UserError(Exception): pass
identity = lambda fn: fn
gl = types.SimpleNamespace(Contract=object, public=types.SimpleNamespace(write=identity, view=identity),
    vm=types.SimpleNamespace(UserError=UserError), message=types.SimpleNamespace(sender_address=Address('B')),
    nondet=types.SimpleNamespace(), eq_principle=types.SimpleNamespace())
sys.modules['genlayer'] = types.SimpleNamespace(gl=gl, Address=Address, TreeMap=TreeMap, u256=int)
spec = importlib.util.spec_from_file_location('recovery', 'contracts/verified_recovery.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.c = {'id':1,'stage':'DECIDED','verdict':'REWORK_B','worker_a':'a','worker_b':'b',
                  'task_spec':'Produce a correct report matching the approved source.',
                  'source_data':'Approved invoice total is 20.', 'a_output':'Approved total: 20',
                  'b_output':'Reported total: 27', 'a_sha256':m.digest('Approved total: 20'),
                  'b_sha256':m.digest('Reported total: 27')}
        gl.get_contract_at = lambda _: types.SimpleNamespace(view=lambda: types.SimpleNamespace(get_case=lambda _:m.canonical(self.c)))
        gl.message.sender_address = Address('b')
        gl.eq_principle.prompt_comparative = lambda fn, principle: fn()
        self.g = m.VerifiedRecovery('court')
        self.g.attempts, self.g.recoveries = TreeMap(), TreeMap()
        self.answer('PASS')
    def answer(self, verdict):
        self.raw = {'checks':[{'criterion':k,'result':verdict,'reason':'Compared against the frozen evidence.',
                         'references':[{'field':('agreement' if k=='dependency' else k),'quote':self.c['source_data'] if k=='source' else self.c['task_spec']}, {'field':'revision','quote':'Reported total:'}]} for k in m.CRITERIA]}
        gl.nondet.exec_prompt = lambda _: json.dumps(self.raw)
    def submit(self, text='Reported total: 20'):
        return self.g.submit_revision(1,text,m.digest(text))
    def state(self): return json.loads(self.g.get_recovery(1))
    def test_success_requires_explicit_finalization(self):
        i=self.submit(); self.assertEqual(self.state()['state'],'SUBMITTED')
        self.assertEqual(self.g.assess_revision(i),'PASS'); self.assertEqual(self.state()['state'],'PASS')
        self.assertEqual(self.g.finalize_recovery(1,i),'RESOLVED')
        self.assertEqual(self.c['stage'],'DECIDED')
        self.assertEqual(self.state()['resolution']['revision_sha256'],m.digest('Reported total: 20'))
    def test_wrong_worker(self):
        gl.message.sender_address=Address('owner')
        with self.assertRaisesRegex(UserError,'responsible'): self.submit()
        self.assertEqual(self.g.attempt_count,0)
    def test_hash_mismatch(self):
        with self.assertRaisesRegex(UserError,'hash mismatch'): self.g.submit_revision(1,'some revision','a'*64)
    def test_original_rejected(self):
        with self.assertRaisesRegex(UserError,'unchanged'): self.submit(self.c['b_output'])
    def test_pending_cannot_replace_or_finalize(self):
        i=self.submit()
        with self.assertRaisesRegex(UserError,'assessed first'): self.submit('Another revision')
        with self.assertRaisesRegex(UserError,'PASS required'): self.g.finalize_recovery(1,i)
    def test_fail_then_pass_preserves_history(self):
        i=self.submit('Reported total: 21'); self.answer('FAIL'); self.g.assess_revision(i)
        j=self.submit(); self.answer('PASS'); self.g.assess_revision(j)
        self.assertEqual(json.loads(self.g.get_attempt(i))['status'],'FAIL')
        with self.assertRaisesRegex(UserError,'stale'): self.g.finalize_recovery(1,i)
        self.assertEqual(self.g.finalize_recovery(1,j),'RESOLVED')
    def test_review_and_attempt_limit(self):
        self.answer('REVIEW')
        i=self.submit(); self.g.assess_revision(i)
        with self.assertRaisesRegex(UserError,'PASS required'): self.g.finalize_recovery(1,i)
        j=self.submit('Different revision text'); self.g.assess_revision(j)
        with self.assertRaisesRegex(UserError,'limit'): self.submit('Third revision text')
    def test_no_duplicate_or_reassessment(self):
        i=self.submit(); self.answer('FAIL'); self.g.assess_revision(i)
        with self.assertRaisesRegex(UserError,'duplicate'): self.submit()
        with self.assertRaisesRegex(UserError,'pending'): self.g.assess_revision(i)
    def test_A_never_closes_B(self):
        self.c['verdict']='REWORK_A'; gl.message.sender_address=Address('a')
        i=self.submit(); self.g.assess_revision(i)
        self.assertEqual(self.g.finalize_recovery(1,i),'UPSTREAM_VERIFIED_B_REVIEW_REQUIRED')
    def test_shared_and_unknown_block(self):
        for verdict in ('SHARED','UNVERIFIABLE','PENDING'):
            self.c['verdict']=verdict
            with self.assertRaises(UserError): self.submit()
    def test_snapshot_change_blocks_assessment(self):
        i=self.submit(); self.c['task_spec']='Changed agreement'
        with self.assertRaisesRegex(UserError,'snapshot changed'): self.g.assess_revision(i)
    def test_snapshot_change_blocks_finalize(self):
        i=self.submit(); self.g.assess_revision(i); self.c['source_data']='Changed source'
        with self.assertRaisesRegex(UserError,'snapshot changed'): self.g.finalize_recovery(1,i)
    def test_malformed_or_fabricated_reference_is_review(self):
        i=self.submit(); self.raw['checks'][0]['references'][0]['quote']='invented supporting evidence'
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_all_three_checks_required(self):
        i=self.submit(); self.raw['checks'].pop()
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_uncertainty_wins_over_failure(self):
        i=self.submit(); self.raw['checks'][0]['result']='REVIEW'; self.raw['checks'][1]['result']='FAIL'
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_duplicate_criteria_is_review(self):
        i=self.submit(); self.raw['checks'][0]['criterion']='source'
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_cannot_finalize_twice(self):
        i=self.submit(); self.g.assess_revision(i); self.g.finalize_recovery(1,i)
        with self.assertRaises(UserError): self.g.finalize_recovery(1,i)
        with self.assertRaises(UserError): self.submit('Another changed output')
    def test_cross_case_attempt_block(self):
        i=self.submit(); self.g.assess_revision(i)
        self.c['id']=2
        with self.assertRaisesRegex(UserError,'wrong case'): self.g.finalize_recovery(2,i)

if __name__ == '__main__': unittest.main()
